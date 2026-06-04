import { useEffect, useState } from 'react'
import { getUserRating, type UserRatingResponse } from '../lib/api/ratings'
import { ApiError } from '../lib/api/client'
import { currentRole, useLogout, useRequireAuth } from '../lib/session'
import { APP_VERSION } from '../lib/appInfo'

function friendly(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.status !== 0 ? err.detail : fallback
}

/** First glyph of the name for the avatar (falls back to a generic mark). */
function initial(name: string | undefined): string {
  const trimmed = (name ?? '').trim()
  return trimmed ? trimmed.slice(0, 1) : '學'
}

/**
 * Real, API-wired profile ("我的"). Replaces the mock that fabricated reputation
 * stats and a hard-coded name/email. Shows the authenticated user plus their
 * aggregate rating (average + count) from the server, and a working 登出 wired
 * to useLogout(). Preference rows that have no backend (付款方式 / 常用取餐地點)
 * are dropped rather than faked; the navigational rows that point at real pages
 * are kept.
 */
export default function Profile() {
  const { user, loading } = useRequireAuth()
  const role = currentRole()
  const logout = useLogout()

  const [rating, setRating] = useState<UserRatingResponse | null>(null)
  const [ratingError, setRatingError] = useState('')

  useEffect(() => {
    if (!user) return
    let alive = true
    void getUserRating(user.id)
      .then((r) => {
        if (alive) setRating(r)
      })
      .catch((err) => {
        if (alive) setRatingError(friendly(err, '載入評分失敗'))
      })
    return () => {
      alive = false
    }
  }, [user])

  if (loading || !user) return <p className="muted">載入中…</p>

  const roleName = role === 'runner' ? '帶餐者' : '訂餐者'
  const repCaption = role === 'runner' ? '· 訂餐者給你的評價' : '· 帶餐者給你的評價'
  const recordsLabel = role === 'runner' ? '帶單紀錄' : '訂單紀錄'
  const summary = rating && rating.count > 0 ? `${rating.average.toFixed(1)} · ${rating.count} 則` : null

  return (
    <>
      <div className="page__head">
        <h1>我的</h1>
      </div>

      <div className="prof-grid">
        <aside>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="prof-head">
              <span className="avatar avatar--lg">{initial(user.name)}</span>
              <div>
                <div className="name">{user.name}</div>
                <div className="email">{user.email}</div>
              </div>
              <div className="rowflex" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                {summary ? (
                  <>
                    <span className="num" style={{ fontWeight: '700' }}>
                      {summary}
                    </span>
                    <span className="ro" style={{ whiteSpace: 'nowrap' }}>
                      {repCaption}
                    </span>
                  </>
                ) : (
                  <span className="ro">{ratingError || '尚無評價'}</span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-white btn--block"
            style={{ marginTop: 'var(--space-4)' }}
            onClick={logout}
          >
            登出
          </button>
        </aside>

        <div>
          <section className="prof-section">
            <h2 className="h-card">{roleName}</h2>
            <div>
              {role === 'runner' ? (
                <>
                  <a className="rowlink" href="runner-earnings.html">
                    <span className="rowflex">
                      <span className="rowlink__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </span>
                      收入明細
                    </span>
                    <span className="rowlink__chev">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </span>
                  </a>
                  <a className="rowlink" href="runner-reviews.html">
                    <span className="rowflex">
                      <span className="rowlink__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 18.2 6.1 21.3l1.2-6.6L2.5 9l6.6-.9z" />
                        </svg>
                      </span>
                      收到的評價
                    </span>
                    <span className="rowlink__chev">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </span>
                  </a>
                </>
              ) : (
                <a className="rowlink" href="orderer-reviews.html">
                  <span className="rowflex">
                    <span className="rowlink__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 18.2 6.1 21.3l1.2-6.6L2.5 9l6.6-.9z" />
                      </svg>
                    </span>
                    收到的評價
                  </span>
                  <span className="rowflex">
                    <span className="ro">{summary ?? '尚無評價'}</span>
                    <span className="rowlink__chev">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </span>
                  </span>
                </a>
              )}
            </div>
          </section>

          <section className="prof-section">
            <h2 className="h-card">設定</h2>
            <div>
              <a className="rowlink" href="my-orders.html">
                <span className="rowflex">
                  <span className="rowlink__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 4h11l3 3v13H6zM9 4v4h7" />
                    </svg>
                  </span>
                  {recordsLabel}
                </span>
                <span className="rowlink__chev">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
              </a>
              <div className="rowlink">
                <span className="rowflex">
                  <span className="rowlink__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    </svg>
                  </span>
                  通知
                </span>
                <span className="ro">站內 · 已開啟</span>
              </div>
              <a className="rowlink" href="about.html">
                <span className="rowflex">
                  <span className="rowlink__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                  </span>
                  關於 CampusEats
                </span>
                <span className="rowflex">
                  <span className="ro">v{APP_VERSION}</span>
                  <span className="rowlink__chev">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
