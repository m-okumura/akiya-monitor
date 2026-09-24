import { parseMinRentYen } from "./money.js";
import type { Listing, ScoredListing } from "./types.js";
import { wardPriorityScore } from "./ward-priority.js";

export function scoreListing(listing: Listing): ScoredListing {
  const reasons: string[] = [];
  let score = 50;

  const { delta: wardDelta, band } = wardPriorityScore(listing.ward);
  score += wardDelta;
  reasons.push(`${band} (${wardDelta >= 0 ? "+" : ""}${wardDelta})`);

  const rentMin = parseMinRentYen(listing.rentYen);
  if (rentMin != null) {
    if (rentMin <= 70_000) {
      score += 8;
      reasons.push(`家賃目安 ${rentMin.toLocaleString("ja-JP")}円 (+8)`);
    } else if (rentMin <= 85_000) {
      score += 4;
      reasons.push(`家賃目安 ${rentMin.toLocaleString("ja-JP")}円 (+4)`);
    } else if (rentMin >= 95_000) {
      score -= 3;
      reasons.push(`家賃上限付近 ${rentMin.toLocaleString("ja-JP")}円 (-3)`);
    }
  }

  if (listing.areaSqm >= 55) {
    score += 10;
    reasons.push(`広め ${listing.areaSqm}㎡ (+10)`);
  } else if (listing.areaSqm >= 48) {
    score += 6;
    reasons.push(`${listing.areaSqm}㎡ (+6)`);
  } else if (listing.areaSqm >= 42) {
    score += 3;
    reasons.push(`${listing.areaSqm}㎡ (+3)`);
  }

  let tier: ScoredListing["tier"] = "neutral";
  if (score >= 72) tier = "recommended";
  else if (score < 48) tier = "caution";
  if (wardDelta <= -8) {
    tier = tier === "recommended" ? "neutral" : tier;
  }

  return {
    ...listing,
    score,
    tier,
    scoreReasons: reasons,
  };
}

export function scoreListings(listings: Listing[]): ScoredListing[] {
  return listings.map(scoreListing);
}

export function sortByScore(listings: ScoredListing[]): ScoredListing[] {
  return [...listings].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name, "ja"),
  );
}
