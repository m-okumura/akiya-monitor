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

## 環境変数（Resend・推奨）

[Resend](https://resend.com/) で API キーを発行し、通知先メールを設定します。

PowerShell 例:

```powershell
$env:NOTIFY_PROVIDER = "resend"
$env:RESEND_API_KEY = "re_..."
$env:MAIL_TO = "you@example.com"
# 任意（未設定時は onboarding@resend.dev ※ Resend アカウントと同じ受信先向け）
# $env:MAIL_FROM = "JKK空き家監視 <onboarding@resend.dev>"
```

## 環境変数（SMTP・任意）

Gmail 等の SMTP を使う場合:

```powershell
$env:NOTIFY_PROVIDER = "smtp"
$env:MAIL_HOST = "smtp.gmail.com"
$env:MAIL_PORT = "587"
$env:MAIL_USER = "you@gmail.com"
$env:MAIL_PASSWORD = "アプリパスワード"
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
