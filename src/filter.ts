import type { Listing } from "./types.js";

export function applyOptionalFilters(
  listings: Listing[],
  options: { mensekiMin: number; yachinMax?: number },
): Listing[] {
  return listings.filter((l) => {
    if (l.areaSqm > 0 && l.areaSqm < options.mensekiMin) {
      return false;
    }
    if (options.yachinMax !== undefined) {
      const minRent = parseMinRentYen(l.rentYen);
      if (minRent !== null && minRent > options.yachinMax) {
        return false;
      }
    }
    return true;
  });
}

function parseMinRentYen(rentLabel: string): number | null {
  const normalized = rentLabel.replace(/,/g, "").replace(/～.*$/, "");
  const n = Number.parseInt(normalized, 10);
  return Number.isNaN(n) ? null : n;
}
