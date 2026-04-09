import Stripe from 'stripe'
import { updateSubscription } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // サブスク状態の変化をDBに反映
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await updateSubscription({
        stripeCustomerId: event.data.object.customer,
        subscriptionId: event.data.object.id,
        status: event.data.object.status === 'active' ? 'active' : 'inactive'
      })
      break

    case 'customer.subscription.deleted':
      await updateSubscription({
        stripeCustomerId: event.data.object.customer,
        subscriptionId: event.data.object.id,
        status: 'inactive'
      })
      break
  }

  return Response.json({ received: true })
}

// Stripeのwebhookはbodyをそのまま使うのでbodyParserを無効化
export const config = { api: { bodyParser: false } }
