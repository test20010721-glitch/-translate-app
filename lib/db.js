import { sql } from '@vercel/postgres'

// ユーザーテーブルを初期化（初回のみ実行）
export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      name VARCHAR(255),
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      subscription_status VARCHAR(50) DEFAULT 'inactive',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
}

// メールでユーザーを検索
export async function getUserByEmail(email) {
  const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`
  return rows[0] || null
}

// ユーザーを作成
export async function createUser({ email, password, name }) {
  const { rows } = await sql`
    INSERT INTO users (email, password, name)
    VALUES (${email}, ${password}, ${name})
    RETURNING *
  `
  return rows[0]
}

// サブスク状態を更新（Stripeのwebhookから呼ぶ）
export async function updateSubscription({ stripeCustomerId, subscriptionId, status }) {
  await sql`
    UPDATE users
    SET stripe_subscription_id = ${subscriptionId},
        subscription_status = ${status}
    WHERE stripe_customer_id = ${stripeCustomerId}
  `
}

// StripeカスタマーIDを保存
export async function setStripeCustomerId(email, customerId) {
  await sql`
    UPDATE users SET stripe_customer_id = ${customerId} WHERE email = ${email}
  `
}

// サブスクが有効かチェック
export async function isSubscribed(email) {
  const user = await getUserByEmail(email)
  return user?.subscription_status === 'active'
}
