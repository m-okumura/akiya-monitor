import type { Listing } from "../types.js";
import { config } from "../config.js";
import { buildListingLinkForEmail } from "../listing-url.js";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatRentLine(listing: Listing): string {
  const common =
    listing.commonFeeYen && listing.commonFeeYen !== "0"
      ? `（共益費 ${listing.commonFeeYen}円）`
      : "";
  return `${listing.layout} / ${listing.areaSqm}㎡ / 家賃 ${listing.rentYen}円${common}`;
}

function groupByWard(listings: Listing[]): Map<string, Listing[]> {
  const groups = new Map<string, Listing[]>();
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
    items.sort((a, b) => a.name.localeCompare(b.name, "ja"));
  }
  return groups;
}

function renderListingsBody(listings: Listing[]): string {
  const groups = groupByWard(listings);
  const wards = [...groups.keys()].sort((a, b) => a.localeCompare(b, "ja"));

  const sections = wards.map((ward) => {
    const items = groups.get(ward) ?? [];
    const rows = items
      .map((listing) => {
        const url = buildListingLinkForEmail(listing);
        return `<li style="margin: 0.35em 0;">
          <a href="${escapeHtml(url)}" style="color: #0b57d0; text-decoration: underline;" title="JKK空き家検索の開き方">${escapeHtml(listing.name)}</a>
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

function buildListingsMail(options: {
  introHtml: string;
  listings: Listing[];
  totalCount: number;
  subjectPrefix: string;
}): { subject: string; html: string } {
  const { introHtml, listings, totalCount, subjectPrefix } = options;
  const html = `
    ${introHtml}
    <p style="color: #444;">検索条件: 東京都 / 専有面積 ${config.mensekiMin}㎡以上 / 家賃制限なし</p>
    <p style="color: #444;">サイト表示の該当総数: ${totalCount} 件 / このメールの掲載: ${listings.length} 件</p>
    <p style="color: #666; font-size: 0.9em;">※マンション名リンクは<strong>JKK 公式の開き方ページ</strong>です。JKK の「住宅名（カナ）」欄用の読みをコピーできます（漢字のままでは検索できません）。</p>
    ${renderListingsBody(listings)}
    <p style="margin-top: 1.2em;"><a href="https://www.to-kousya.or.jp/chintai/index.html">JKKねっと（都営住宅）トップ</a></p>
  `;

  return {
    subject: `[JKK空き家] ${subjectPrefix} ${listings.length} 件（該当 ${totalCount} 件）`,
    html,
  };
}

export function buildNewListingsMail(
  listings: Listing[],
  totalCount: number,
): { subject: string; html: string } {
  return buildListingsMail({
    introHtml: `<p>JKK空き家（先着順）に、条件に合う<strong>新規</strong>物件が ${listings.length} 件見つかりました。</p>`,
    listings,
    totalCount,
    subjectPrefix: "新規",
  });
}

export function buildSnapshotMail(
  listings: Listing[],
  totalCount: number,
): { subject: string; html: string } {
  return buildListingsMail({
    introHtml:
      "<p>JKK空き家（先着順）の<strong>現時点</strong>の該当物件一覧です（手動スナップショット）。</p>",
    listings,
    totalCount,
    subjectPrefix: "現時点",
  });
}

export function buildFailureMail(message: string): { subject: string; html: string } {
  return {
    subject: "[JKK空き家] 監視エラー",
    html: `<p>JKK空き家監視でエラーが発生しました。</p><pre style="white-space: pre-wrap;">${escapeHtml(message)}</pre>`,
  };
}
