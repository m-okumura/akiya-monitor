# CLAUDE.md（AI 向けプロジェクト指示）

このファイルは Claude / Cursor 等が作業するときの前提です。変更前に必ず読んでください。

## プロジェクト概要

- **PRJ-AKIYA**: JKK 先着順空き家の日次監視 + 新規物件メール通知
- **リポジトリ**: `m-okumura/akiya-monitor`（このディレクトリがルート）
- **thinking リポジトリとは別管理**（Obsidian vault に混ぜない）

## 技術スタック

- Node.js 22 + TypeScript（`tsx` で実行）
- cheerio（HTML パース）、iconv-lite（Shift_JIS）、nodemailer
- GitHub Actions Cron + Actions Cache（`.data/state.json`）

## よく使うコマンド

```bash
npm ci
npm run check    # 監視 1 回実行
npm run build    # tsc --noEmit
```

## 環境変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASSWORD` / `MAIL_TO` | 本番 | SMTP |
| `MAIL_FROM` | 任意 | From |
| `MENSEKI_MIN` | 任意 | デフォルト 40 |
| `YACHIN_MAX` | 任意 | 家賃上限（円）。未設定で無制限 |
| `NOTIFY_ON_FIRST_RUN` | 任意 | `true` で初回も通知 |
| `STATE_PATH` | 任意 | デフォルト `.data/state.json` |

## コーディング方針

1. **変更範囲を最小に** — JKK サイト仕様に追随するパーサ・クライアント以外触らない
2. **取得頻度** — 1日1回以上にしない（マナー・ブロック回避）
3. **state** — `.data/state.json` は git に含めない
4. **JKK 入口** — `akiyaJyoukenStartInit` 経由。`akiyaBackInit` を直接叩かない
5. **エラー時** — サイレント失敗にせず、可能なら失敗通知メール

## ディレクトリ

```
.
├── CLAUDE.md / PROJECT.md / README.md
├── docs/
├── src/           # アプリケーション本体
├── .github/workflows/
└── .data/         # 実行 state（gitignore）
```

## ドキュメント更新

仕様変更・検索条件変更・Secrets 追加時は `docs/` と `PROJECT.md` のステータスを更新する。
