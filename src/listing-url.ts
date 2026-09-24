import iconv from "iconv-lite";

const JKK_BUILDING_SEARCH_BASE =
  "https://jhomes.to-kousya.or.jp/search/jkknet/service/akiyaJyokenDirect";

/** 住宅名で JKK 空き家検索（建物単位）へ deep link */
export function buildBuildingSearchUrl(buildingName: string): string {
  const hex = [...iconv.encode(buildingName, "Shift_JIS")]
    .map((byte) => byte.toString(16).toUpperCase().padStart(2, "0"))
    .join("");
  return `${JKK_BUILDING_SEARCH_BASE}?jutaku_name=${hex}&sen_flg=1`;
}
