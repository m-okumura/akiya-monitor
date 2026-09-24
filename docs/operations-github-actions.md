# GitHub Actions 運用

## ワークフロー

`.github/workflows/jkk-akiya-monitor.yml`

- **schedule**: 毎日 7:00 JST（UTC 22:00）
- **workflow_dispatch**: 手動実行（オプション **snapshot_email** で現時点一覧メール）
- **通知**: `NOTIFY_PROVIDER=resend`（Secrets 参照）

## Secrets（Repository secrets）

| Name | 必須 | 説明 |
|------|------|------|
| `RESEND_API_KEY` | ○ | [Resend](https://resend.com/) の API キー |
| `MAIL_TO` | ○ | 通知先メール |
| `MAIL_FROM` | 任意 | 未設定時 `JKK Akiya Monitor <onboarding@resend.dev>` |
| `GEMINI_API_KEY` | ○（AI 利用時） | OSAKA 監視と同じキーで可 |

SMTP に戻す場合は workflow の `env` を `NOTIFY_PROVIDER=smtp` と `MAIL_HOST` 等に変更。

## 手動実行の注意

- **Run workflow**（main 最新）で実行する。**過去 Run の Re-run** は古い commit のまま動く。
- `snapshot_email: true` でスナップショット＋AI メモ付き一覧メール。

## 状態ファイル

- パス: `.data/state.json`
- Actions Cache キー: `jkk-akiya-monitor-state`
- リポジトリにはコミットしない

## 初回デプロイ手順

1. Resend で API キー発行
2. ローカルで `npm run check` が通ることを確認
3. `main` に push
4. **Settings → Secrets** に `RESEND_API_KEY` と `MAIL_TO` を登録
5. Actions → **Run workflow** で手動 1 回（state 初期化）
6. 翌日以降、新規物件があればメール

## Cloud Agent について

Agent の実行リポジトリが `thinking` のみの場合、**別リポジトリへは push できない**ことがあります。  
このプロジェクトは **`akiya-monitor` リポジトリをルートにした Agent** で push するか、ローカルから push してください。
