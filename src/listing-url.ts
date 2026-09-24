/** JKK 空き家検索の公式入口（セッション開始用） */
export const JKK_AKIYA_ENTRY_URL =
  "https://jhomes.to-kousya.or.jp/search/jkknet/service/akiyaJyoukenStartInit";

const DEFAULT_BRIDGE_BASE = "https://m-okumura.github.io/akiya-monitor";

function bridgeBaseUrl(): string | null {
  const raw = process.env.LISTING_LINK_BRIDGE_BASE?.trim();
  if (raw === "off" || raw === "false") return null;
  return raw || DEFAULT_BRIDGE_BASE;
}

/** メール用: JKK 直リンクではなく中継ページ（Gmail 等の prefetch 回避 + 公式導線） */
export function buildListingLinkForEmail(buildingName: string): string {
  const base = bridgeBaseUrl();
  if (!base) return JKK_AKIYA_ENTRY_URL;
  const encoded = Buffer.from(buildingName, "utf8").toString("base64url");
  return `${base.replace(/\/$/, "")}/link/?n=${encoded}`;
}
