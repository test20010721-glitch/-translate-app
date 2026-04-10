'use client'
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, background: '#f5f5f0', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
