import nodemailer from "nodemailer";
import type { Listing } from "../types.js";
import { config } from "../config.js";
import {
  buildFailureMail,
  buildNewListingsMail,
  buildSnapshotMail,
} from "./messages.js";
import type { Notifier } from "./types.js";

function createTransporter() {
  return nodemailer.createTransport({
    host: config.smtp.host(),
    port: config.smtp.port(),
    auth: {
      user: config.smtp.user(),
      pass: config.smtp.password(),
    },
  });
}

export const smtpNotifier: Notifier = {
  async sendNewListings(listings: Listing[], totalCount: number): Promise<void> {
    const { subject, html } = buildNewListingsMail(listings, totalCount);
    await createTransporter().sendMail({
      from: config.notify.from(),
      to: config.notify.to(),
      subject,
      html,
    });
  },

  async sendSnapshot(listings: Listing[], totalCount: number): Promise<void> {
    const { subject, html } = buildSnapshotMail(listings, totalCount);
    await createTransporter().sendMail({
      from: config.notify.from(),
      to: config.notify.to(),
      subject,
      html,
    });
  },

  async sendFailure(message: string): Promise<void> {
    const { subject, html } = buildFailureMail(message);
    await createTransporter().sendMail({
      from: config.notify.from(),
      to: config.notify.to(),
      subject,
      html,
    });
  },
};
