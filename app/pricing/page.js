'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isSubscribed = session?.user?.subscriptionStatus === 'active'

  const s = {
    page: { minHeight: '100vh', padding: '40px 16px' },
    h1: { fontSize: 26, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', margin: '0 0 8px' },
    sub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40 },
    cards: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 700, margin: '0 auto' },
    card: (featured) => ({ background: '#fff', borderRadius: 16, border: featured ? '2px solid #1a56db' : '1px solid #e0e0d8', padding: '28px 24px', width: 300, position: 'relative' }),
    badge: { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1a56db', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap' },
    planName: { fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 },
    price: { fontSize: 36, fontWeight: 700, color: '#1a1a1a', margin: '12px 0 4px' },
    period: { fontSize: 13, color: '#888' },
    hr: { border: 'none', borderTop: '1px solid #f0f0e8', margin: '20px 0' },
    feature: { fontSize: 13, color: '#444', marginBottom: 10 },
    btn: (featured, disabled) => ({ width: '100%', fontSize: 14, fontWeight: 600, padding: 12, borderRadius: 8, border: featured ? 'none' : '1px solid #e0e0d8', background: disabled ? '#ccc' : featured ? '#1a1a1a' : '#fff', color: featured ? '#fff' : '#1a1a1a', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: 20 })
  }

  const handleSubscribe = async () => {
    if (!session) { router.push('/login'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('エラーが発生しました: ' + data.error)
    } catch(e) { alert('エラーが発生しました') }
    finally { setLoading(false) }
  }

  const freeFeatures = ['1日5回まで翻訳', '5言語対応', 'トーン選択（5種類）', '翻訳履歴（直近10件）']
  const proFeatures = ['翻訳回数 無制限', '5言語対応', 'トーン選択（5種類）', '翻訳履歴（無制限）', '音声入力・カメラ翻訳', 'メール文作成・メニュー翻訳', '優先サポート']

  return (
    <div style={s.page}>
      <h1 style={s.h1}>料金プラン</h1>
      <p style={s.sub}>まず無料で試して、気に入ったらアップグレード</p>
      <div style={s.cards}>
        <div style={s.card(false)}>
          <div style={s.planName}>無料プラン</div>
          <div style={s.price}>¥0</div>
          <div style={s.period}>ずっと無料</div>
          <hr style={s.hr}/>
          {freeFeatures.map((f, i) => <div key={i} style={s.feature}>✓ {f}</div>)}
          <button style={s.btn(false, false)} onClick={() => router.push('/')}>無料で始める</button>
        </div>
        <div style={s.card(true)}>
          <div style={s.badge}>おすすめ</div>
          <div style={s.planName}>Proプラン</div>
          <div style={s.price}>¥980</div>
          <div style={s.period}>/ 月（税込）</div>
          <hr style={s.hr}/>
          {proFeatures.map((f, i) => <div key={i} style={s.feature}>✓ {f}</div>)}
          <button style={s.btn(true, loading || isSubscribed)} onClick={handleSubscribe} disabled={loading || isSubscribed}>
            {isSubscribed ? '現在ご利用中' : loading ? '処理中...' : 'Proにアップグレード'}
          </button>
        </div>
      </div>
    </div>
  )
}
