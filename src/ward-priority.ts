/** 住みやすさ・通勤イメージに基づく区・市（東京都内）の静的優先度 */

const TIER_A = [
  "杉並区",
  "中野区",
  "世田谷区",
  "武蔵野市",
  "三鷹市",
  "練馬区",
  "目黒区",
  "文京区",
  "狛江市",
  "調布市",
] as const;

const TIER_B = [
  "渋谷区",
  "新宿区",
  "豊島区",
  "品川区",
  "大田区",
  "北区",
  "板橋区",
  "江東区",
  "港区",
  "中央区",
] as const;

const TIER_C = ["墨田区", "台東区", "荒川区", "千代田区"] as const;

const TIER_D = ["足立区", "葛飾区", "江戸川区"] as const;

const TIER_E = [
  "八王子市",
  "立川市",
  "青梅市",
  "あきる野市",
  "福生市",
  "羽村市",
  "瑞穂町",
  "日の出町",
  "檜原村",
  "奥多摩町",
  "大島町",
  "利島村",
  "新島村",
  "神津島村",
] as const;

export function normalizeWardLabel(ward: string): string {
  return ward.replace(/^東京都/, "").trim();
}

export function wardPriorityScore(ward: string): {
  delta: number;
  band: string;
} {
  const w = normalizeWardLabel(ward);
  if (TIER_A.some((x) => w.includes(x))) {
    return { delta: 20, band: "住みやすいエリア（最優先）" };
  }
  if (TIER_B.some((x) => w.includes(x))) {
    return { delta: 10, band: "住みやすいエリア（準優先）" };
  }
  if (TIER_C.some((x) => w.includes(x))) {
    return { delta: 0, band: "都心・下町（標準）" };
  }
  if (TIER_D.some((x) => w.includes(x))) {
    return { delta: -8, band: "郊外寄り（慎重）" };
  }
  if (TIER_E.some((x) => w.includes(x))) {
    return { delta: -15, band: "多摩・島しょ（通勤要確認）" };
  }
  return { delta: 2, band: "その他（23区外市部等）" };
}
