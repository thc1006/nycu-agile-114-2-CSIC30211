import { useEffect, useState } from 'react'
import { getUserRating, type UserRatingResponse } from '../lib/api/ratings'
import { ApiError } from '../lib/api/client'
import { useRequireAuth } from '../lib/session'

function friendly(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.status !== 0 ? err.detail : fallback
}

/** Five static glyphs reflecting a rounded score. */
function renderStars(average: number) {
  const filled = Math.round(average)
  return [1, 2, 3, 4, 5].map((n) => (
    <span key={n} className={`star-static${n <= filled ? ' is-on' : ''}`} aria-hidden="true">
      ★
    </span>
  ))
}

/**
 * Real, API-wired reputation view for the orderer. The mock fabricated a star
 * distribution, compliment counts and individual reviews; the backend exposes
 * only an aggregate (average + count), so we show that prominently and state
 * plainly that per-review detail is not yet available — no fabricated reviews.
 */
export default function OrdererReviews() {
  const { user, loading } = useRequireAuth()

  const [rating, setRating] = useState<UserRatingResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let alive = true
    void getUserRating(user.id)
      .then((r) => {
        if (alive) setRating(r)
      })
      .catch((err) => {
        if (alive) setError(friendly(err, '載入評分失敗,請稍後再試'))
      })
    return () => {
      alive = false
    }
  }, [user])

  if (loading) return <p className="muted">載入中…</p>

  const hasRating = rating !== null && rating.count > 0
  const average = rating?.average ?? 0
  const countLine = error
    ? error
    : hasRating
      ? `來自 ${rating?.count ?? 0} 則帶餐者評價`
      : '尚無評價'

  return (
    <>
      <div className="page__head">
        <p className="crumb">
          <a href="profile.html">我的</a> · 我的評價
        </p>
        <h1>我的評價</h1>
      </div>

      <div className="rev-grid">
        <aside className="rev-aside">
          <div className="card">
            <div className="score-hero">
              <div className="big">{hasRating ? average.toFixed(1) : '—'}</div>
              <span className="stars stars--lg" aria-hidden="true">
                {renderStars(average)}
              </span>
              <div className="count">{countLine}</div>
            </div>
          </div>
        </aside>

        <section>
          <p className="sec-label">評價明細</p>
          <div className="card">
            <p className="body-sm muted" style={{ margin: '0' }}>
              目前顯示總體評分,單筆評價明細尚未開放。
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
