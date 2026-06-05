import { useCallback, useEffect, useState } from 'react'
import { listOpenOrders, type OpenOrderResponse } from '../lib/api/orders'
import { ApiError } from '../lib/api/client'
import { useRequireAuth } from '../lib/session'

const POLL_MS = 5000

function friendly(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.status !== 0 ? err.detail : fallback
}

/** Format an ISO time as a short zh-TW label, guarding invalid dates. */
function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Keep the backend's expected_time-ascending order stable. */
function byExpectedTime(a: OpenOrderResponse, b: OpenOrderResponse): number {
  return new Date(a.expected_time).getTime() - new Date(b.expected_time).getTime()
}

/**
 * Real, API-wired runner feed (AG-003), replacing the mock card list. Loads
 * GET /orders/open on mount and polls every few seconds so orders posted by
 * orderers appear without a manual refresh. Each card deep-links to the order
 * detail with the REAL order id.
 */
export default function Feed() {
  const { loading } = useRequireAuth()
  const [orders, setOrders] = useState<OpenOrderResponse[] | null>(null)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const open = await listOpenOrders()
      setOrders([...open].sort(byExpectedTime))
      setError('')
    } catch (err) {
      setError(friendly(err, '載入待接訂單失敗，請稍後再試'))
    }
  }, [])

  // initial load + light polling so newly-posted orders surface automatically
  useEffect(() => {
    if (loading) return
    void refresh()
    const timer = setInterval(() => void refresh(), POLL_MS)
    return () => clearInterval(timer)
  }, [loading, refresh])

  if (loading) return <p className="count">載入中…</p>

  return (
    <>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}

      {!orders && !error && <p className="count">載入中…</p>}

      {orders && (
        <>
          <p className="count">
            <strong className="num">{orders.length}</strong> 筆待接 · 依取餐截止時間排序
          </p>

          {orders.length === 0 ? (
            <div className="empty" data-od-id="feed-empty">
              <div className="empty__mark">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4-4" />
                </svg>
              </div>
              <h3>目前沒有可接訂單</h3>
              <p>稍後再回來看看。尖峰時段（11:30–13:00）通常最多單。</p>
            </div>
          ) : (
            <div className="order-grid">
              {orders.map((order) => (
                <a
                  key={order.id}
                  className="card card--link"
                  href={`order-detail.html?id=${encodeURIComponent(order.id)}&role=runner`}
                >
                  <div className="order-card__top">
                    <div>
                      <div className="order-card__rest">
                        {order.restaurant} · {order.meal_summary}
                      </div>
                    </div>
                    <span className="fee">
                      ${order.delivery_fee}
                      <small>/單</small>
                    </span>
                  </div>
                  <div className="order-card__meta">
                    <div className="order-line">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                      {order.pickup_location}
                    </div>
                    <div className="order-line">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                      {formatTime(order.expected_time)} 前
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
