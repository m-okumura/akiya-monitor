# メールリンク用 GitHub Pages（中継ページ）

JKK ねっとは `akiyaJyokenDirect` 等の**直 URL**だと混雑エラーになることがあります。  
メールのマンション名リンクは `docs/link/index.html` の中継ページ経由にしています。

## 初回設定（1 回だけ）

1. GitHub → **akiya-monitor** → **Settings** → **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **main** / Folder: **/docs**
4. Save → 数分後 `https://m-okumura.github.io/akiya-monitor/link/` が開けることを確認

## カスタム

| 環境変数 | 説明 |
|----------|------|
| `LISTING_LINK_BRIDGE_BASE` | 中継ページのベース URL。未設定時は上記 GitHub Pages。`off` で JKK 入口のみ |

Actions の workflow に `LISTING_LINK_BRIDGE_BASE` を足す必要は通常ありません（デフォルトで GitHub Pages URL）。
