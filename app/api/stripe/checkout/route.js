import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserByEmail, setStripeCustomerId } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: 'ログインが必要です' }, { status: 401 })

    const user = await getUserByEmail(session.user.email)
    if (!user) return Response.json({ error: 'ユーザーが見つかりません' }, { status: 404 })

    let customerId = user.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name })
      customerId = customer.id
      await setStripeCustomerId(user.email, customerId)
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/?subscribed=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
    })

    return Response.json({ url: checkoutSession.url })
  } catch (e) {
    console.error(e)
    return Response.json({ error: e.message }, { status: 500 })
  }
}
