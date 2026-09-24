# PRJ-AKIYA — JKK 空き家監視

東京都営住宅 [JKKねっと 空き家（先着順）](https://www.to-kousya.or.jp/chintai/index.html) を毎日チェックし、**新規に載った物件**をメール通知します。

- **GitHub**: [m-okumura/akiya-monitor](https://github.com/m-okumura/akiya-monitor)
- **ローカル配置例**: `C:\Users\3031662\Work\1_projects\PRJ-AKIYA_JKK空き家監視`

## クイックスタート

```bash
npm ci
export MAIL_HOST=... MAIL_PORT=587 MAIL_USER=... MAIL_PASSWORD=... MAIL_TO=...
npm run check
```

詳細は [docs/setup-local.md](./docs/setup-local.md) を参照してください。

## ドキュメント

| ファイル | 内容 |
|----------|------|
| [PROJECT.md](./PROJECT.md) | 案件定義・ステータス |
| [CLAUDE.md](./CLAUDE.md) | AI / 開発ルール |
| [docs/architecture.md](./docs/architecture.md) | システム構成 |
| [docs/setup-local.md](./docs/setup-local.md) | ローカル開発 |
| [docs/operations-github-actions.md](./docs/operations-github-actions.md) | GitHub 運用 |

## 検索条件（デフォルト）

- 東京都（区部・市部すべて）
- 専有面積 **40㎡ 以上**
- 家賃 **制限なし**
