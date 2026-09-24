export type NotifyProvider = "smtp" | "resend";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`環境変数 ${name} が設定されていません`);
  }
  return value;
}

function optionalInt(name: string): number | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) {
    throw new Error(`環境変数 ${name} は整数である必要があります`);
  }
  return n;
}

function parseNotifyProvider(): NotifyProvider {
  const raw = process.env.NOTIFY_PROVIDER ?? "smtp";
  if (raw === "smtp" || raw === "resend") {
    return raw;
  }
  throw new Error(
    `環境変数 NOTIFY_PROVIDER は smtp または resend である必要があります（現在: ${raw}）`,
  );
}

const notifyProvider = parseNotifyProvider();

function defaultFromAddress(): string {
  if (notifyProvider === "resend") {
    return "JKK空き家監視 <onboarding@resend.dev>";
  }
  return "JKK空き家監視<monitor@localhost>";
}

export const config = {
  statePath: process.env.STATE_PATH ?? ".data/state.json",
  mensekiMin: optionalInt("MENSEKI_MIN") ?? 40,
  yachinMax: optionalInt("YACHIN_MAX"),
  notifyOnFirstRun: process.env.NOTIFY_ON_FIRST_RUN === "true",
  snapshotEmail: process.env.SNAPSHOT_EMAIL === "true",
  notifyProvider,
  notify: {
    to: () => requireEnv("MAIL_TO"),
    from: () => process.env.MAIL_FROM ?? defaultFromAddress(),
  },
  resend: {
    apiKey: () => requireEnv("RESEND_API_KEY"),
  },
  smtp: {
    host: () => requireEnv("MAIL_HOST"),
    port: () => Number.parseInt(requireEnv("MAIL_PORT"), 10),
    user: () => requireEnv("MAIL_USER"),
    password: () => requireEnv("MAIL_PASSWORD"),
  },
};
