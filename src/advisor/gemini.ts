import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config.js";
import type { ScoredListing } from "../types.js";
import { toAdvisorFacts, type AdvisorFact } from "./facts.js";
import { renderAdvisorMarkdownToHtml } from "./markdown-email.js";

const MODEL_FALLBACKS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
] as const;

const STABLE_AFTER_PREFERRED = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
] as const;

const RETRYABLE_ATTEMPTS = 3;

export type AdvisorOutput = {
  html: string;
  skipped: boolean;
  reason?: string;
  modelUsed?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRetryableError(msg: string): boolean {
  return /503|429|UNAVAILABLE|overloaded|Resource exhausted|high demand/i.test(
    msg,
  );
}

function isNotFoundError(msg: string): boolean {
  return /404|not found|no longer available|is not found for API/i.test(msg);
}

function factsToPrompt(
  facts: AdvisorFact[],
  meta: { totalInMail: number; capped: boolean },
): string {
  return JSON.stringify(
    {
      criteria:
        "東京都 JKK 先着順空き家。専有40㎡以上・家賃10万円以下。住みやすい区（杉並・中野・世田谷・武蔵野・三鷹等）を優先。先着順のためスピード重要。",
      note: meta.capped
        ? `listings はルールスコア上位のみ（${facts.length}件）。メール掲載総数は ${meta.totalInMail} 件。`
        : undefined,
      listings: facts,
    },
    null,
    2,
  );
}

const SYSTEM_INSTRUCTION = `あなたは東京都 JKK 空き家（都営・UR系先着）の選定アドバイザーです。
入力 JSON の listings だけを根拠にしてください。JSON に無い事実を捏造しないでください。
score / tier / scoreReasons を重視し、ward（区）と家賃・面積のバランスで判断してください。
先着順のため「早めに動く価値があるか」も短く触れてください。
出力は日本語 Markdown（見出し ##、箇条書き - ）。
物件名は JSON の propertyName をそのまま使う。**物件名** で強調してよい。
Markdown のリンクや URL は書かない（メール側で JKK 開き方リンクを付与する）。
id を本文に繰り返さない。1行に複数物件を「/」で並べない。
構成:
1. 結論（おすすめ TOP3、各1〜3行。住みやすい区を優先）
2. 見送り・慎重（理由付き）
3. 次のアクション（JKK 申込前の確認事項2つ）`;

function modelCandidates(): string[] {
  const preferred = config.gemini.model;
  const stable = STABLE_AFTER_PREFERRED.filter((m) => m !== preferred);
  const stableSet = new Set<string>(STABLE_AFTER_PREFERRED);
  const rest = MODEL_FALLBACKS.filter(
    (m) => m !== preferred && !stableSet.has(m),
  );
  return [preferred, ...stable, ...rest];
}

async function generateWithModelOnce(
  apiKey: string,
  modelName: string,
  prompt: string,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION,
  });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

async function generateWithModel(
  apiKey: string,
  modelName: string,
  prompt: string,
): Promise<string> {
  let lastMsg = "";
  for (let attempt = 0; attempt < RETRYABLE_ATTEMPTS; attempt++) {
    try {
      return await generateWithModelOnce(apiKey, modelName, prompt);
    } catch (error) {
      lastMsg = errorMessage(error);
      if (isNotFoundError(lastMsg)) throw error;
      if (isRetryableError(lastMsg) && attempt < RETRYABLE_ATTEMPTS - 1) {
        const waitMs = 2000 * (attempt + 1);
        console.warn(
          `Gemini ${modelName} 混雑/503 → ${waitMs}ms 後にリトライ (${attempt + 2}/${RETRYABLE_ATTEMPTS})`,
        );
        await sleep(waitMs);
        continue;
      }
      throw error;
    }
  }
  throw new Error(lastMsg || "Gemini unknown error");
}

function escapeHtmlModel(name: string): string {
  return name.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function advisorUnavailableHtml(reason: string): string {
  const short = reason.slice(0, 180).replace(/</g, "&lt;");
  return `<section style="margin:1.2em 0;padding:0.85em 1em;background:#fff8e6;border-radius:8px;border:1px solid #f0e0a0;">
<p style="margin:0;color:#553;font-size:0.95em;"><strong>AI 選定メモ</strong>は Google API の都合で省略しました（503 等）。<strong>ルールスコア TOP</strong>と区別一覧を参照してください。</p>
<p style="margin:0.5em 0 0;color:#887;font-size:0.8em;">${short}</p>
</section>`;
}

export async function generateGeminiAdvice(
  listings: ScoredListing[],
  options: { totalInMail: number },
): Promise<AdvisorOutput> {
  if (!config.aiAdvisorEnabled) {
    return { html: "", skipped: true, reason: "AI_ADVISOR=false" };
  }
  const apiKey = config.gemini.apiKey();
  if (!apiKey) {
    return { html: "", skipped: true, reason: "GEMINI_API_KEY 未設定" };
  }

  const cap = config.gemini.advisorListingCap;
  const capped = listings.length > cap;
  const forAi = capped ? listings.slice(0, cap) : listings;
  const facts = toAdvisorFacts(forAi);
  const prompt = `以下の物件データを評価してください。\n\n${factsToPrompt(facts, {
    totalInMail: options.totalInMail,
    capped,
  })}`;
  const errors: string[] = [];

  for (const modelName of modelCandidates()) {
    try {
      const text = await generateWithModel(apiKey, modelName, prompt);
      if (!text) {
        errors.push(`${modelName}: 空応答`);
        continue;
      }
      console.log(`Gemini 成功: ${modelName}`);
      const bodyHtml = renderAdvisorMarkdownToHtml(text, facts);
      return {
        modelUsed: modelName,
        html: `<section style="margin:1.2em 0;padding:1em;background:#f6f8fc;border-radius:8px;">
<h2 style="margin:0 0 0.6em;font-size:1.05em;">AI 選定メモ（Gemini / ${escapeHtmlModel(modelName)}）</h2>
${bodyHtml}
<p style="margin-top:0.8em;color:#666;font-size:0.85em;">※一覧 JSON の自動要約。空室・申込条件は JKK 公式で要確認。</p>
</section>`,
        skipped: false,
      };
    } catch (error) {
      const msg = errorMessage(error);
      errors.push(`${modelName}: ${msg.slice(0, 160)}`);
      console.warn(`Gemini ${modelName} 失敗: ${msg.slice(0, 120)}`);
    }
  }

  const reason = `全モデル失敗 (${errors.join(" | ")})`;
  return {
    html: advisorUnavailableHtml(reason),
    skipped: true,
    reason,
  };
}
