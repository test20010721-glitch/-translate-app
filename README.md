# NuanceTranslate（月額サブスク版）

## Vercelへのデプロイ手順

### 1. GitHubにコードをpush（全ファイル）

### 2. Vercel Postgresを追加
1. Vercelダッシュボード → プロジェクト → 「Storage」タブ
2. 「Create Database」→「Postgres」→作成
3. DATABASE_URLなどの環境変数が自動追加される

### 3. Stripeの設定
1. stripe.com でアカウント作成
2. 「商品」→「商品を追加」
   - 名前: NuanceTranslate Pro
   - 価格: ¥980/月（繰り返し請求）
3. 価格IDをコピー（price_xxxxx）
4. APIキー → シークレットキーをコピー
5. Webhook設定:
   - URL: https://あなたのドメイン.vercel.app/api/webhook
   - イベント: customer.subscription.created/updated/deleted
   - 署名シークレットをコピー

### 4. Vercelに環境変数を設定

OPENAI_API_KEY=sk-proj-...
NEXTAUTH_SECRET=ランダムな文字列
NEXTAUTH_URL=https://あなたのドメイン.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

### 5. Redeployして完成！
