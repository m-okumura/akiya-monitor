import type { Listing } from "../types.js";
import { config } from "../config.js";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildNewListingsMail(
  listings: Listing[],
  totalCount: number,
): { subject: string; html: string } {
  const lines = listings
    .map(
      (l) =>
        `・${l.name}（${l.ward}） ${l.layout} / ${l.areaSqm}㎡ / 家賃 ${l.rentYen}円 [ID:${l.id}]`,
    )
    .join("\n");

  const html = `
    <p>JKK空き家（先着順）に、条件に合う新規物件が ${listings.length} 件見つかりました。</p>
    <p>検索条件: 東京都 / 専有面積 ${config.mensekiMin}㎡以上 / 家賃制限なし</p>
    <p>現在の該当総数（サイト表示）: ${totalCount} 件</p>
    <pre style="font-family: sans-serif; white-space: pre-wrap;">${escapeHtml(lines)}</pre>
    <p><a href="https://www.to-kousya.or.jp/chintai/index.html">JKKねっと（都営住宅）</a></p>
  `;

  return {
    subject: `[JKK空き家] 新規 ${listings.length} 件（該当 ${totalCount} 件）`,
    html,
  };
}

export function buildFailureMail(message: string): { subject: string; html: string } {
  return {
    subject: "[JKK空き家] 監視エラー",
    html: `<p>JKK空き家監視でエラーが発生しました。</p><pre>${escapeHtml(message)}</pre>`,
  };
}
