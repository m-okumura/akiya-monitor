# プロジェクト定義

| 項目 | 内容 |
|------|------|
| プロジェクト ID | PRJ-AKIYA |
| 名称 | JKK 空き家（先着順）監視 |
| GitHub | https://github.com/m-okumura/akiya-monitor |
| ローカル配置（想定） | `C:\Users\3031662\Work\1_projects\PRJ-AKIYA_JKK空き家監視` |

## 目的

[JKKねっと](https://www.to-kousya.or.jp/chintai/index.html) の先着順空き家を **1日1回** 自動検索し、前回実行時に無かった物件をメールで通知する。

## スコープ

- 対象: 東京都（区部・市部）
- 専有面積: 40㎡ 以上
- 家賃: 制限なし（件数優先）
- 実行基盤: GitHub Actions（AWS 等は使わない）
- 通知: Resend API（本番）/ SMTP 任意

## ステータス

| フェーズ | 状態 |
|----------|------|
| 要件整理 | 完了 |
| 実装 | 完了 |
| GitHub 反映 | 完了（2026-09-24） |
| Secrets 設定 | 完了（Resend） |
| 本番運用 | 稼働中（日次 7:00 JST） |

## 関連ドキュメント

- [README.md](./README.md) … クイックスタート
- [CLAUDE.md](./CLAUDE.md) … AI / 開発者向けルール
- [docs/architecture.md](./docs/architecture.md) … 処理フロー
- [docs/setup-local.md](./docs/setup-local.md) … ローカル環境
- [docs/operations-github-actions.md](./docs/operations-github-actions.md) … 運用
