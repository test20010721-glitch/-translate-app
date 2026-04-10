import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from './db'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await getUserByEmail(credentials.email)
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          subscriptionStatus: user.subscription_status
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.subscriptionStatus = user.subscriptionStatus
      if (token.email) {
        const dbUser = await getUserByEmail(token.email)
        token.subscriptionStatus = dbUser?.subscription_status || 'inactive'
        token.userId = String(dbUser?.id)
      }
      return token
    },
    async session({ session, token }) {
      session.user.subscriptionStatus = token.subscriptionStatus
      session.user.id = token.userId
      return session
    }
  },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' }
}
