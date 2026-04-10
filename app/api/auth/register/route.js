import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser, initDB } from '@/lib/db'

export async function POST(req) {
  try {
    await initDB()
    const { email, password, name } = await req.json()
    if (!email || !password) return Response.json({ error: 'メールとパスワードを入力してください' }, { status: 400 })
    if (password.length < 8) return Response.json({ error: 'パスワードは8文字以上にしてください' }, { status: 400 })
    const existing = await getUserByEmail(email)
    if (existing) return Response.json({ error: 'このメールアドレスは既に登録されています' }, { status: 400 })
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await createUser({ email, password: hashedPassword, name: name || email.split('@')[0] })
    return Response.json({ success: true, userId: user.id })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
