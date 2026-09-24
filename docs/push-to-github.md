# GitHub へ push する

## 初回（空リポジトリ）

```bash
cd PRJ-AKIYA_JKK空き家監視
git init
git branch -M main
git remote add origin https://github.com/m-okumura/akiya-monitor.git
git add .
git commit -m "feat: JKK空き家日次監視の初期構成"
git push -u origin main
```

## 更新

```bash
git add .
git commit -m "説明..."
git push origin main
```

## thinking から移行していた場合

`thinking/akiya-monitor/` にあった内容は **このフォルダが正** です。  
vault 側のコピーは削除して問題ありません。
