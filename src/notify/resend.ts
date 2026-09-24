import { Resend } from "resend";
import type { Listing } from "../types.js";
import { config } from "../config.js";
import {
  buildFailureMail,
  buildNewListingsMail,
  buildSnapshotMail,
} from "./messages.js";
import type { Notifier } from "./types.js";

function client(): Resend {
  return new Resend(config.resend.apiKey());
}

export const resendNotifier: Notifier = {
  async sendNewListings(listings: Listing[], totalCount: number): Promise<void> {
    const { subject, html } = buildNewListingsMail(listings, totalCount);
    const { error } = await client().emails.send({
      from: config.notify.from(),
      to: config.notify.to(),
      subject,
      html,
    });
    if (error) {
      throw new Error(`Resend: ${error.message}`);
    }
  },

  async sendSnapshot(listings: Listing[], totalCount: number): Promise<void> {
    const { subject, html } = buildSnapshotMail(listings, totalCount);
    const { error } = await client().emails.send({
      from: config.notify.from(),
      to: config.notify.to(),
      subject,
      html,
    });
    if (error) {
      throw new Error(`Resend: ${error.message}`);
    }
  },

  async sendFailure(message: string): Promise<void> {
    const { subject, html } = buildFailureMail(message);
    const { error } = await client().emails.send({
      from: config.notify.from(),
      to: config.notify.to(),
      subject,
      html,
    });
    if (error) {
      throw new Error(`Resend: ${error.message}`);
    }
  },
};
