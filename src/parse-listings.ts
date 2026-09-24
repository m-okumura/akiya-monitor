import * as cheerio from "cheerio";
import type { Listing } from "./types.js";

export function parseListings(html: string): Listing[] {
  const listings: Listing[] = [];
  const $ = cheerio.load(html);

  $("a[onclick*='senPage']").each((_, anchor) => {
    const onclick = $(anchor).attr("onclick") ?? "";
    const match = /senPage\s*\(\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*\)/.exec(
      onclick,
    );
    if (!match) return;

    const [, boshuNo, mskKbn, jyutakuCd, yusenKbn] = match;
    const cells = $(anchor)
      .closest("tr")
      .find("td")
      .map((__, td) => $(td).text().replace(/\s+/g, " ").trim())
      .get();

    const name = cells[1] ?? "";
    const ward = cells[2] ?? "";
    const layout = cells[5] ?? "";
    const areaSqm = Number.parseFloat((cells[6] ?? "0").replace(/,/g, ""));
    const rentYen = cells[7] ?? "";
    const commonFeeYen = cells[8] ?? "";

    listings.push({
      id: `${mskKbn}-${jyutakuCd}-${yusenKbn}`,
      boshuNo,
      mskKbn,
      jyutakuCd,
      yusenKbn,
      name,
      ward,
      layout,
      areaSqm: Number.isNaN(areaSqm) ? 0 : areaSqm,
      rentYen,
      commonFeeYen,
    });
  });

  return dedupeById(listings);
}

function dedupeById(listings: Listing[]): Listing[] {
  const map = new Map<string, Listing>();
  for (const item of listings) {
    map.set(item.id, item);
  }
  return [...map.values()];
}

export function parseResultCount(html: string): number | null {
  const match = html.match(/(\d+)\s*件が該当しました/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}
