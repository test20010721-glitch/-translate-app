'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const s = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
    card: { background: '#fff', borderRadius: 16, border: '1px solid #e0e0d8', padding: '32px 28px', width: '100%', maxWidth: 400 },
    h1: { fontSize: 22, fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px', textAlign: 'center' },
    sub: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 28 },
    label: { fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 },
    input: { width: '100%', fontSize: 15, padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0d8', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 16, outline: 'none' },
    btn: { width: '100%', fontSize: 14, fontWeight: 600, padding: 11, borderRadius: 8, border: 'none', background: loading ? '#ccc' : '#1a1a1a', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: 4 },
    toggle: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 20 },
    link: { color: '#1a56db', cursor: 'pointer', textDecoration: 'underline' },
    err: { fontSize: 12, color: '#dc2626', background: '#fee2e2', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }
  }

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      if (isRegister) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        })
        const data = await res.json()
        if (data.error) { setError(data.error); setLoading(false); return }
      }
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) { setError('メールまたはパスワードが間違っています'); setLoading(false); return }
      router.push('/')
    } catch(e) {
      setError('エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.h1}>NuanceTranslate</h1>
        <p style={s.sub}>{isRegister ? 'アカウントを作成' : 'ログイン'}</p>
        {error && <div style={s.err}>{error}</div>}
        {isRegister && (
          <>
            <label style={s.label}>お名前</label>
            <input style={s.input} type="text" placeholder="山田 太郎" value={name} onChange={e => setName(e.target.value)} />
          </>
        )}
        <label style={s.label}>メールアドレス</label>
        <input style={s.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label style={s.label}>パスワード{isRegister ? '（8文字以上）' : ''}</label>
        <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? '処理中...' : isRegister ? 'アカウント作成' : 'ログイン'}
        </button>
        <p style={s.toggle}>
          {isRegister ? 'すでにアカウントをお持ちの方は' : 'アカウントをお持ちでない方は'}
          <span style={s.link} onClick={() => { setIsRegister(!isRegister); setError('') }}>
            {isRegister ? 'ログイン' : '新規登録'}
          </span>
        </p>
      </div>
    </div>
  )
}
