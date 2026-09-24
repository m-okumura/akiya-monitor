import type { ScoredListing } from "../types.js";
import { config } from "../config.js";
import { buildListingLinkForEmail } from "../listing-url.js";
import type { MailContext } from "./types.js";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tierLabel(tier: ScoredListing["tier"]): string {
  switch (tier) {
    case "recommended":
      return "◎";
    case "caution":
      return "△";
    default:
      return "○";
  }
}

function formatRentLine(listing: ScoredListing): string {
  const common =
    listing.commonFeeYen && listing.commonFeeYen !== "0"
      ? `（共益費 ${listing.commonFeeYen}円）`
      : "";
  return `${listing.layout} / ${listing.areaSqm}㎡ / 家賃 ${listing.rentYen}円${common} / スコア ${listing.score}`;
}

function groupByWard(listings: ScoredListing[]): Map<string, ScoredListing[]> {
  const groups = new Map<string, ScoredListing[]>();
  for (const listing of listings) {
    const ward = listing.ward || "（地域不明）";
    const bucket = groups.get(ward);
    if (bucket) {
      bucket.push(listing);
    } else {
      groups.set(ward, [listing]);
    }
  }
  for (const items of groups.values()) {
    items.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "ja"));
  }
  return groups;
}

function renderScoreTop(listings: ScoredListing[]): string {
  const top = [...listings].sort((a, b) => b.score - a.score).slice(0, 8);
  if (top.length === 0) return "";

  const rows = top
    .map((l) => {
      const url = buildListingLinkForEmail(l);
      return `<li style="margin:0.3em 0;">${tierLabel(l.tier)} <a href="${escapeHtml(url)}" style="color:#0b57d0;">${escapeHtml(l.name)}</a> — ${escapeHtml(l.ward)} / ${escapeHtml(formatRentLine(l))}</li>`;
    })
    .join("\n");

  return `<section style="margin:1em 0;padding:0.75em 1em;background:#f4f7fb;border-radius:8px;">
<h3 style="margin:0 0 0.5em;font-size:1em;">ルールスコア TOP（住みやすい区・家賃・面積）</h3>
<ul style="margin:0;padding-left:1.2em;">${rows}</ul>
</section>`;
}

function renderListingsBody(listings: ScoredListing[]): string {
  const groups = groupByWard(listings);
  const wards = [...groups.keys()].sort((a, b) => a.localeCompare(b, "ja"));

  const sections = wards.map((ward) => {
    const items = groups.get(ward) ?? [];
    const rows = items
      .map((listing) => {
        const url = buildListingLinkForEmail(listing);
        return `<li style="margin: 0.35em 0;">
          ${tierLabel(listing.tier)} <a href="${escapeHtml(url)}" style="color: #0b57d0; text-decoration: underline;" title="JKK空き家検索の開き方">${escapeHtml(listing.name)}</a>
          <span style="color: #333;"> — ${escapeHtml(formatRentLine(listing))}</span>
        </li>`;
      })
      .join("\n");

    return `<section style="margin: 1em 0;">
      <h3 style="margin: 0.5em 0; font-size: 1em; color: #111;">${escapeHtml(ward)}（${items.length}件）</h3>
      <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">${rows}</ul>
    </section>`;
  });

  return sections.join("\n");
}

function yachinLabel(): string {
  const max = config.yachinMax;
  return max != null
    ? `家賃 ${max.toLocaleString("ja-JP")} 円以下`
    : "家賃制限なし";
}

function buildListingsMail(options: {
  introHtml: string;
  listings: ScoredListing[];
  context: MailContext;
  subjectPrefix: string;
}): { subject: string; html: string } {
  const { introHtml, listings, context, subjectPrefix } = options;
  const html = `
    ${introHtml}
    ${context.advisorHtml}
    ${renderScoreTop(listings)}
    <p style="color: #444;">検索条件: 東京都 / 専有面積 ${config.mensekiMin}㎡以上 / ${yachinLabel()}</p>
    <p style="color: #444;">サイト表示の該当総数: ${context.totalCount} 件 / このメールの掲載: ${listings.length} 件</p>
    <p style="color: #666; font-size: 0.9em;">※マンション名リンクは<strong>JKK 公式の開き方ページ</strong>です。JKK の「住宅名（カナ）」欄用の読みをコピーできます（漢字のままでは検索できません）。</p>
    ${renderListingsBody(listings)}
    <p style="margin-top: 1.2em;"><a href="https://www.to-kousya.or.jp/chintai/index.html">JKKねっと（都営住宅）トップ</a></p>
  `;

  return {
    subject: `[JKK空き家] ${subjectPrefix} ${listings.length} 件（該当 ${context.totalCount} 件）`,
    html,
  };
}

export function buildNewListingsMail(
  listings: ScoredListing[],
  context: MailContext,
): { subject: string; html: string } {
  return buildListingsMail({
    introHtml: `<p>JKK空き家（先着順）に、条件に合う<strong>新規</strong>物件が ${listings.length} 件見つかりました。</p>`,
    listings,
    context,
    subjectPrefix: "新規",
  });
}

export function buildSnapshotMail(
  listings: ScoredListing[],
  context: MailContext,
): { subject: string; html: string } {
  return buildListingsMail({
    introHtml:
      "<p>JKK空き家（先着順）の<strong>現時点</strong>の該当物件一覧です（手動スナップショット）。</p>",
    listings,
    context,
    subjectPrefix: "現時点",
  });
}

export function buildFailureMail(message: string): { subject: string; html: string } {
  return {
    subject: "[JKK空き家] 監視エラー",
    html: `<p>JKK空き家監視でエラーが発生しました。</p><pre style="white-space: pre-wrap;">${escapeHtml(message)}</pre>`,
  };
}
