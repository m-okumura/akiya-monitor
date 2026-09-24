# GitHub Actions 運用

## ワークフロー

`.github/workflows/jkk-akiya-monitor.yml`

- **schedule**: 毎日 7:00 JST（UTC 22:00）
- **workflow_dispatch**: 手動実行

## Secrets（Repository secrets）

| Name | 説明 |
|------|------|
| `MAIL_HOST` | SMTP ホスト |
| `MAIL_PORT` | 例: `587` |
| `MAIL_USER` | SMTP ユーザー |
| `MAIL_PASSWORD` | SMTP パスワード |
| `MAIL_TO` | 通知先 |
| `MAIL_FROM` | （任意） |

## 状態ファイル

- パス: `.data/state.json`
- Actions Cache キー: `jkk-akiya-monitor-state`
- リポジトリにはコミットしない

## 初回デプロイ手順

1. ローカルで `npm run check` が通ることを確認
2. `main` に push
3. **Settings → Secrets** を登録
4. Actions → **Run workflow** で手動 1 回（state 初期化）
5. 翌日以降、新規物件があればメール

## Cloud Agent について

Agent の実行リポジトリが `thinking` のみの場合、**別リポジトリへは push できない**ことがあります。  
このプロジェクトは **`akiya-monitor` リポジトリをルートにした Agent** で push するか、ローカルから push してください。
