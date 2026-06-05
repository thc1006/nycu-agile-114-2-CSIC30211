import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getOrder, type OrderResponse } from '../lib/api/orders'
import { rateOrder } from '../lib/api/ratings'
import { ApiError } from '../lib/api/client'
import { actorRoleFor, useRequireAuth, type UiRole } from '../lib/session'

const STAR_LABELS: Record<number, string> = {
  1: '需要改進',
  2: '普通',
  3: '還可以',
  4: '很好',
  5: '非常滿意',
}

function friendly(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.status !== 0 ? err.detail : fallback
}

/** The label for the party being rated, given which side the current user is on. */
function rateeLabel(myRole: UiRole | null): string {
  // I'm the orderer → I rate the runner (帶餐者), and vice-versa.
  return myRole === 'runner' ? '訂餐者' : '帶餐者'
}

/**
 * Real, API-wired one-time rating screen (AG-007), replacing the mock that only
 * flipped a "done" pane. Reads ?id= for the order to rate, loads it for context
 * (restaurant/meal + which party I'm rating, derived from the server's
 * customer_id/runner_id vs my own id — not the URL), and POSTs a 1–5 star
 * rating. Ratings are immutable, so on success we show a confirmed read-only
 * state with no edit affordance. The legacy quick-tags / free-text comment are
 * dropped because the backend only stores stars.
 */
export default function Rating() {
  const { user, loading } = useRequireAuth()
  const [params] = useSearchParams()
  const id = params.get('id')

  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loadError, setLoadError] = useState('')
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    let alive = true
    void getOrder(id)
      .then((o) => {
        if (alive) setOrder(o)
      })
      .catch((err) => {
        if (alive) setLoadError(friendly(err, '載入訂單失敗，請稍後再試'))
      })
    return () => {
      alive = false
    }
  }, [id])

  async function submit() {
    if (!id || busy || stars === 0) return
    setBusy(true)
    setError('')
    try {
      await rateOrder(id, { stars })
      setSubmitted(true)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // 409 covers both "already rated" and "not completed" — surface the
        // backend's own message, which distinguishes the two cases.
        setError(/already/i.test(err.detail) ? '你已經評價過這筆訂單' : '訂單完成後才能評價')
      } else {
        setError(friendly(err, '送出評價失敗，請稍後再試'))
      }
      setBusy(false)
    }
  }

  if (loading) return <p className="muted">載入中…</p>

  // No order selected → nothing to rate.
  if (!id) {
    return (
      <div className="rate-wrap">
        <div className="card rate-card">
          <div className="who">找不到要評價的訂單</div>
          <div className="sub">請從訂單紀錄選擇一筆已完成的訂單再評價。</div>
          <a className="btn btn-black btn--lg" href="my-orders.html">
            查看訂單紀錄
          </a>
        </div>
      </div>
    )
  }

  const myRole = order ? actorRoleFor(order, user?.id) : null
  const target = rateeLabel(myRole)
  const display = hover || stars

  return (
    <div className="rate-wrap">
      <h1 className="sr-only">評價</h1>

      {submitted ? (
        <div className="center stack-4" style={{ paddingBlock: 'var(--space-12)' }}>
          <div className="done-mark">
            <svg viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="h-page">已送出評價</h2>
          <div className="stars stars--lg" aria-label={`你給了 ${stars} 星`}>
            {renderStaticStars(stars)}
          </div>
          <p className="muted">
            {stars} 星 · {STAR_LABELS[stars]}
          </p>
          <p className="muted">評價送出後即無法修改，謝謝你讓校園帶餐更值得信任。</p>
          <div
            className="stack-3"
            style={{ maxWidth: '360px', marginInline: 'auto', marginTop: 'var(--space-4)' }}
          >
            <a className="btn btn-black btn--block btn--lg" href="my-orders.html">
              回到訂單紀錄
            </a>
          </div>
        </div>
      ) : (
        <div
          className="stack-5"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
        >
          {order && (
            <p className="meta center" style={{ margin: '0' }}>
              {order.restaurant} · {order.meal}
            </p>
          )}
          {loadError && (
            <p role="alert" className="form-error">
              {loadError}
            </p>
          )}

          <div className="card rate-card">
            <div>
              <div className="who">給{target}評價</div>
              <div className="sub">交易已完成 · 為這次合作打個分數</div>
            </div>

            <div className="stars stars--lg" role="radiogroup" aria-label="星等">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={stars === value}
                  aria-label={`${value} 星 · ${STAR_LABELS[value]}`}
                  className={`star-btn${value <= display ? ' is-on' : ''}`}
                  onMouseEnter={() => setHover(value)}
                  onMouseLeave={() => setHover(0)}
                  onFocus={() => setHover(value)}
                  onBlur={() => setHover(0)}
                  onClick={() => setStars(value)}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="rate-val">{stars === 0 ? '點選星等' : `${stars} 星 · ${STAR_LABELS[stars]}`}</div>
          </div>

          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}

          <button
            type="button"
            className="btn btn-black btn--block btn--lg"
            disabled={stars === 0 || busy}
            onClick={() => void submit()}
          >
            {busy ? '送出中…' : '送出評價'}
          </button>
        </div>
      )}
    </div>
  )
}

/** Five static glyphs reflecting a fixed score (for the confirmed state). */
function renderStaticStars(value: number) {
  return [1, 2, 3, 4, 5].map((n) => (
    <span key={n} className={`star-static${n <= value ? ' is-on' : ''}`} aria-hidden="true">
      ★
    </span>
  ))
}
