import type { ScoredListing } from "../types.js";

export type MailContext = {
  totalCount: number;
  advisorHtml: string;
};

export type Notifier = {
  sendNewListings(
    listings: ScoredListing[],
    context: MailContext,
  ): Promise<void>;
  sendSnapshot(listings: ScoredListing[], context: MailContext): Promise<void>;
  sendFailure(message: string): Promise<void>;
};
