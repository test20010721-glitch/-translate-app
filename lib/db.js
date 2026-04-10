import { sql } from '@vercel/postgres'

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

export async function getUserByEmail(email) {
  const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`
  return rows[0] || null
}

export async function createUser({ email, password, name }) {
  const { rows } = await sql`
    INSERT INTO users (email, password, name)
    VALUES (${email}, ${password}, ${name})
    RETURNING *
  `
  return rows[0]
}

export async function updateSubscription({ stripeCustomerId, subscriptionId, status }) {
  await sql`
    UPDATE users
    SET stripe_subscription_id = ${subscriptionId},
        subscription_status = ${status}
    WHERE stripe_customer_id = ${stripeCustomerId}
  `
}

export async function setStripeCustomerId(email, customerId) {
  await sql`
    UPDATE users SET stripe_customer_id = ${customerId} WHERE email = ${email}
  `
}

export async function isSubscribed(email) {
  const user = await getUserByEmail(email)
  return user?.subscription_status === 'active'
}
