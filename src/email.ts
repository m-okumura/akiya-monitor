import nodemailer from "nodemailer";
import type { Listing } from "./types.js";
import { config } from "./config.js";

export async function sendNewListingsEmail(
  listings: Listing[],
  totalCount: number,
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: config.mail.host(),
    port: config.mail.port(),
    auth: {
      user: config.mail.user(),
      pass: config.mail.password(),
    },
  });

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

  await transporter.sendMail({
    from: config.mail.from,
    to: config.mail.to(),
    subject: `[JKK空き家] 新規 ${listings.length} 件（該当 ${totalCount} 件）`,
    html,
  });
}

export async function sendFailureEmail(message: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: config.mail.host(),
    port: config.mail.port(),
    auth: {
      user: config.mail.user(),
      pass: config.mail.password(),
    },
  });

  await transporter.sendMail({
    from: config.mail.from,
    to: config.mail.to(),
    subject: "[JKK空き家] 監視エラー",
    html: `<p>JKK空き家監視でエラーが発生しました。</p><pre>${escapeHtml(message)}</pre>`,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
