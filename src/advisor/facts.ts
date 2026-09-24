import { buildListingLinkForEmail } from "../listing-url.js";
import type { ScoredListing } from "../types.js";

export type AdvisorFact = {
  id: string;
  propertyName: string;
  ward: string;
  layout: string;
  areaSqm: number;
  rentYen: string;
  commonFeeYen: string;
  searchKana: string | null;
  score: number;
  tier: string;
  scoreReasons: string[];
  listingUrl: string;
};

export function toAdvisorFacts(listings: ScoredListing[]): AdvisorFact[] {
  return listings.map((l) => ({
    id: l.id,
    propertyName: l.name,
    ward: l.ward,
    layout: l.layout,
    areaSqm: l.areaSqm,
    rentYen: l.rentYen,
    commonFeeYen: l.commonFeeYen,
    searchKana: l.searchKana ?? null,
    score: l.score,
    tier: l.tier,
    scoreReasons: l.scoreReasons,
    listingUrl: buildListingLinkForEmail(l),
  }));
}
