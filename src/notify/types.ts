import type { Listing } from "../types.js";

export type Notifier = {
  sendNewListings(listings: Listing[], totalCount: number): Promise<void>;
  sendFailure(message: string): Promise<void>;
};
