import path from "node:path";
import { generateGeminiAdvice } from "./advisor/gemini.js";
import { config } from "./config.js";
import { createNotifier, isNotifierConfigured } from "./notify/index.js";
import { applyOptionalFilters } from "./filter.js";
import { JkkClient } from "./jkk-client.js";
import { parseListings, parseResultCount } from "./parse-listings.js";
import { scoreListings, sortByScore } from "./score.js";
import { enrichListingsWithSearchKana } from "./search-kana.js";
import { diffListingIds, loadState, saveState } from "./state.js";
import type { Listing, ScoredListing } from "./types.js";

async function prepareForMail(listings: Listing[]): Promise<{
  scored: ScoredListing[];
  advisorHtml: string;
}> {
  const scored = sortByScore(scoreListings(listings));

  console.log("AI アドバイス生成…");
  const advisor = await generateGeminiAdvice(scored, {
    totalInMail: scored.length,
  });
  if (advisor.skipped) {
    console.warn(
      `AI スキップ: ${advisor.reason ?? "不明"}（メール送信は続行）`,
    );
  }

  return { scored, advisorHtml: advisor.html };
}

async function main(): Promise<void> {
  const statePath = path.resolve(process.cwd(), config.statePath);
  const client = new JkkClient(config.mensekiMin);
  const notifier = createNotifier();

  console.log("JKK空き家監視を開始します…");
  const html = await client.fetchSearchResults();
  const totalCount = parseResultCount(html) ?? 0;
  let listings = parseListings(html);
  listings = applyOptionalFilters(listings, {
    mensekiMin: config.mensekiMin,
    yachinMax: config.yachinMax,
  });
  listings = await enrichListingsWithSearchKana(listings);

  console.log(
    `該当 ${totalCount} 件 / パース ${listings.length} 件（家賃上限 ${config.yachinMax?.toLocaleString("ja-JP") ?? "なし"} 円）`,
  );

  const currentIds = listings.map((l) => l.id);

  if (config.snapshotEmail) {
    const { scored, advisorHtml } = await prepareForMail(listings);
    console.log(
      `スナップショット: ${scored.length} 件をメール送信します（${config.notifyProvider}）`,
    );
    await notifier.sendSnapshot(scored, { totalCount, advisorHtml });
    await saveState(statePath, currentIds);
    return;
  }
  const previous = await loadState(statePath);
  const previousIds = new Set(previous?.listingIds ?? []);
  const isFirstRun = previous === null;

  await saveState(statePath, currentIds);

  const newIds = diffListingIds(previousIds, currentIds);
  const newListings = listings.filter((l) => newIds.includes(l.id));

  if (isFirstRun && !config.notifyOnFirstRun) {
    console.log(
      `初回実行のため通知をスキップしました（保存 ID: ${currentIds.length} 件）`,
    );
    return;
  }

  if (newListings.length === 0) {
    console.log("新規物件はありません");
    return;
  }

  const { scored, advisorHtml } = await prepareForMail(newListings);
  console.log(
    `新規 ${scored.length} 件をメール送信します（${config.notifyProvider}）`,
  );
  await notifier.sendNewListings(scored, { totalCount, advisorHtml });
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  try {
    if (isNotifierConfigured()) {
      await createNotifier().sendFailure(message);
    }
  } catch (mailError) {
    console.error("失敗通知メールも送信できませんでした:", mailError);
  }
  process.exit(1);
});
