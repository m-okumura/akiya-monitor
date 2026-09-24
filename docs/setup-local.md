# ローカル環境セットアップ

## 前提

- Node.js **22.x**
- Git

## 配置

Windows 例:

```text
C:\Users\3031662\Work\1_projects\PRJ-AKIYA_JKK空き家監視
```

GitHub から clone する場合:

```bash
git clone https://github.com/m-okumura/akiya-monitor.git PRJ-AKIYA_JKK空き家監視
cd PRJ-AKIYA_JKK空き家監視
```

## インストール

```bash
npm ci
```

## 環境変数

PowerShell 例:

```powershell
$env:MAIL_HOST = "smtp.example.com"
$env:MAIL_PORT = "587"
$env:MAIL_USER = "user"
$env:MAIL_PASSWORD = "pass"
$env:MAIL_TO = "you@example.com"
```

## 実行

```bash
npm run check
```

- **初回**は `NOTIFY_ON_FIRST_RUN` 未設定時、通知せず `.data/state.json` のみ作成
- 初回からメールしたい: `$env:NOTIFY_ON_FIRST_RUN = "true"`

## 型チェック

```bash
npm run build
```
