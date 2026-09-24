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

export const config = {
  statePath: process.env.STATE_PATH ?? ".data/state.json",
  mensekiMin: optionalInt("MENSEKI_MIN") ?? 40,
  yachinMax: optionalInt("YACHIN_MAX"),
  notifyOnFirstRun: process.env.NOTIFY_ON_FIRST_RUN === "true",
  mail: {
    host: () => requireEnv("MAIL_HOST"),
    port: () => Number.parseInt(requireEnv("MAIL_PORT"), 10),
    user: () => requireEnv("MAIL_USER"),
    password: () => requireEnv("MAIL_PASSWORD"),
    to: () => requireEnv("MAIL_TO"),
    from: process.env.MAIL_FROM ?? "JKK空き家監視<monitor@localhost>",
  },
};
