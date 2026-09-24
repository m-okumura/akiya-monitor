# アーキテクチャ

## 処理フロー

```mermaid
sequenceDiagram
  participant GA as GitHub Actions
  participant App as src/index.ts
  participant JKK as jhomes.to-kousya.or.jp
  participant Cache as Actions Cache
  participant Notify as Resend / SMTP

  GA->>App: npm run check（毎日 7:00 JST）
  App->>JKK: セッション開始 + 条件検索 POST
  JKK-->>App: 結果 HTML（最大50件/ページ）
  App->>App: 物件 ID 抽出・差分
  App->>Cache: 前回 state 読込
  App->>Cache: 今回 state 保存
  alt 新規物件あり
    App->>Notify: 通知メール
  else 初回 or 変更なし
    App->>App: 通知スキップ
  end
```

## モジュール

| ファイル | 役割 |
|----------|------|
| `src/jkk-client.ts` | Cookie 維持・Shift_JIS POST・JKK 検索 |
| `src/parse-listings.ts` | 結果 HTML から物件一覧 |
| `src/state.ts` | `.data/state.json` 読み書き |
| `src/filter.ts` | 任意の家賃上限フィルタ |
| `src/notify/` | メール送信（Resend API / SMTP） |
| `src/index.ts` | オーケストレーション |

## 物件 ID

`{mskKbn}-{jyutakuCd}-{yusenKbn}`（詳細ボタン `senPage` から取得）

## 外部依存

- JKK Web（非公式 API・HTML スクレイピング）
- Resend API（本番デフォルト）または SMTP（`NOTIFY_PROVIDER=smtp`）

HTML 変更でパーサが壊れるリスクあり。取得失敗時はエラーメールを送る。
