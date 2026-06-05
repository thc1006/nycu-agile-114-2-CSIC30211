import { useEffect, useState } from 'react'
import { listMyOrders, type OrderResponse } from '../lib/api/orders'
import { ApiError } from '../lib/api/client'
import { useRequireAuth } from '../lib/session'

// Orders the runner has accepted but not yet completed still count as "in
// progress"; CANCELLED ones earn nothing and are excluded from both buckets.
const IN_PROGRESS: OrderResponse['status'][] = ['ACCEPTED', 'BUYING', 'DELIVERED']

function friendly(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.status !== 0 ? err.detail : fallback
}

/** Locale date for a completed run; guards an unparseable ISO. */
function formatWhen(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Real, API-wired runner earnings view. The mock fabricated a monthly total, a
 * weekly bar chart and a fee breakdown; the backend has none of that, so we
 * derive everything from the runner's own orders: earnings = sum of delivery_fee
 * over COMPLETED orders, plus a completed/in-progress count, and a list of the
 * completed runs with their fee. No fabricated numbers.
 */
export default function RunnerEarnings() {
  const { loading } = useRequireAuth()

  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    void listMyOrders('runner')
      .then((list) => {
        if (alive) setOrders(list)
      })
      .catch((err) => {
        if (alive) setError(friendly(err, '載入收入失敗，請稍後再試'))
      })
      .finally(() => {
        if (alive) setLoaded(true)
      })
    return () => {
      alive = false
    }
  }, [])

  const completed = orders.filter((o) => o.status === 'COMPLETED')
  const inProgress = orders.filter((o) => IN_PROGRESS.includes(o.status)).length
  const total = completed.reduce((sum, o) => sum + o.delivery_fee, 0)

  if (loading) return <p className="muted">載入中…</p>

  return (
    <>
      <div className="page__head">
        <p className="crumb">
          <a href="profile.html">我的</a> · 收入明細
        </p>
        <h1>收入明細</h1>
      </div>

      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}

      <div className="earn-grid">
        <aside className="earn-aside">
          <div className="card">
            <div className="earn-hero">
              <div className="period">已完成帶單收入</div>
              <div className="big">${total}</div>
              <div className="sub">{completed.length} 趟已完成</div>
            </div>
            <div className="mini">
              <div>
                <div className="n">{completed.length}</div>
                <div className="l">已完成</div>
              </div>
              <div>
                <div className="n">{inProgress}</div>
                <div className="l">進行中</div>
              </div>
              <div>
                <div className="n">${total}</div>
                <div className="l">總收入</div>
              </div>
            </div>
          </div>
        </aside>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="card">
            <p className="sec-label">已完成帶餐收入</p>
            {!loaded && !error ? (
              <p className="muted">載入中…</p>
            ) : completed.length === 0 ? (
              <p className="muted">尚無完成的帶單收入</p>
            ) : (
              completed.map((order) => (
                <div className="trip" key={order.id}>
                  <div className="meta-l">
                    <span className="tdot">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 11h18l-1.5 9h-15zM7 11V8a5 5 0 0 1 10 0v3" />
                      </svg>
                    </span>
                    <div>
                      <div className="store">{order.restaurant}</div>
                      <div className="when">
                        {formatWhen(order.updated_at)} · {order.pickup_location}
                      </div>
                    </div>
                  </div>
                  <span className="amt">+${order.delivery_fee}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  )
}
