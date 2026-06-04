import { useCallback, useEffect, useMemo, useState } from 'react'
import { listMyOrders, type MyOrdersRole, type OrderResponse } from '../lib/api/orders'
import { ApiError } from '../lib/api/client'
import { currentRole, useRequireAuth } from '../lib/session'

type Status = OrderResponse['status']
type Filter = 'all' | 'active' | 'done'

const POLL_MS = 5000
// Statuses that still need attention vs. closed out (COMPLETED / CANCELLED).
const ACTIVE_STATUSES: Status[] = ['OPEN', 'ACCEPTED', 'BUYING', 'DELIVERED']

const STATUS_LABEL: Record<Status, string> = {
  OPEN: '待接單',
  ACCEPTED: '已接單',
  BUYING: '購買中',
  DELIVERED: '已送達',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}
const STATUS_BADGE: Record<Status, string> = {
  OPEN: 'badge--open',
  ACCEPTED: 'badge--matched',
  BUYING: 'badge--buying',
  DELIVERED: 'badge--delivering',
  COMPLETED: 'badge--done',
  CANCELLED: 'badge--cancelled',
}

function friendly(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.status !== 0 ? err.detail : fallback
}

/** Locale time for the expected-delivery window; guards an unparseable ISO. */
function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '時間未定'
  return date.toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Keep long meal strings from blowing out the card; full text stays in title. */
function truncate(text: string, max = 40): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '進行中' },
  { key: 'done', label: '已完成' },
]

/**
 * Real, API-wired "my orders" list (AG-010). Shared by both roles and
 * self-segregated by the UI role: a runner sees the orders they accepted
 * ("我的帶單"), an orderer the ones they posted ("我的訂單"). Polls so server-side
 * status advances (the other party acting on the order) surface here too.
 */
export default function MyOrders() {
  const { loading } = useRequireAuth()
  const role = currentRole()
  const apiRole: MyOrdersRole = role === 'runner' ? 'runner' : 'customer'

  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const refresh = useCallback(async () => {
    try {
      setOrders(await listMyOrders(apiRole))
      setError('')
    } catch (err) {
      setError(friendly(err, '載入訂單失敗,請稍後再試'))
    } finally {
      setLoaded(true)
    }
  }, [apiRole])

  useEffect(() => {
    void refresh()
    const timer = setInterval(() => void refresh(), POLL_MS)
    return () => clearInterval(timer)
  }, [refresh])

  const visible = useMemo(() => {
    if (filter === 'active') return orders.filter((o) => ACTIVE_STATUSES.includes(o.status))
    if (filter === 'done') return orders.filter((o) => o.status === 'COMPLETED' || o.status === 'CANCELLED')
    return orders
  }, [orders, filter])

  const heading = role === 'runner' ? '我的帶單' : '我的訂單'
  const ownerLabel = role === 'runner' ? '我接的' : '我發布'
  const emptyText = role === 'runner' ? '還沒有接單,去看看待接列表' : '還沒有訂單,去發一張吧'

  if (loading) return <p className="mo-loading">載入中…</p>

  return (
    <>
      <div className="page__head">
        <h1>{heading}</h1>
      </div>

      <div className="seg-tabs" role="group" aria-label="訂單篩選">
        {FILTERS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={filter === tab.key ? 'is-active' : undefined}
            aria-pressed={filter === tab.key}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mo-error">
          {error}
        </p>
      )}

      {!loaded && !error && <p className="mo-loading">載入中…</p>}

      {loaded && visible.length === 0 && !error ? (
        <div className="empty" style={{ gridColumn: '1/-1' }}>
          <div className="empty__mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 4h11l3 3v13H6zM9 4v4h7" />
            </svg>
          </div>
          <h3>{emptyText}</h3>
        </div>
      ) : (
        <div className="order-grid">
          {visible.map((order) => (
            <a
              key={order.id}
              className="card card--link"
              href={`order-tracking.html?id=${encodeURIComponent(order.id)}&role=${role}`}
            >
              <div className="order-card__top">
                <div>
                  <div className="order-card__rest" title={order.meal}>
                    {order.restaurant} · {truncate(order.meal)}
                  </div>
                  <div className="ro" style={{ marginTop: '4px' }}>
                    {ownerLabel} · {formatTime(order.expected_time)} · {order.pickup_location}
                  </div>
                </div>
                <span className={`badge ${STATUS_BADGE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
              </div>
              <div className="order-card__foot">
                <span className="meta">{order.pickup_location}</span>
                <span className="fee">${order.delivery_fee}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  )
}
