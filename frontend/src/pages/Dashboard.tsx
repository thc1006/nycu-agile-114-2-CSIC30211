import { useCallback, useEffect, useState } from 'react'
import { cancelOrder, listMyOrders, type OrderResponse } from '../lib/api/orders'
import { getUserRating, type UserRatingResponse } from '../lib/api/ratings'
import { ApiError } from '../lib/api/client'
import { useRequireAuth } from '../lib/session'

type Status = OrderResponse['status']

const POLL_MS = 5000
// "進行中" = anything not yet closed out (COMPLETED / CANCELLED).
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

/**
 * Real, API-wired orderer home (AG-002 entry + live "進行中"). Lists the orders I
 * posted that are still in flight, lets me cancel an as-yet-unaccepted one, and
 * shows my real aggregate rating. Polls so a runner accepting / advancing an
 * order reflects without a manual refresh.
 */
export default function Dashboard() {
  const { user, loading } = useRequireAuth()

  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [rating, setRating] = useState<UserRatingResponse | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const mine = await listMyOrders('customer')
      setOrders(mine.filter((o) => ACTIVE_STATUSES.includes(o.status)))
      setError('')
    } catch (err) {
      setError(friendly(err, '載入訂單失敗，請稍後再試'))
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    void refresh()
    const timer = setInterval(() => void refresh(), POLL_MS)
    return () => clearInterval(timer)
  }, [user, refresh])

  // Aggregate rating is static enough to fetch once per user (no polling).
  useEffect(() => {
    if (!user) return
    let alive = true
    void getUserRating(user.id)
      .then((r) => {
        if (alive) setRating(r)
      })
      .catch(() => {
        // Non-fatal: the stats block just falls back to "尚無評價".
      })
    return () => {
      alive = false
    }
  }, [user])

  async function onCancel(id: string) {
    if (busyId) return
    setBusyId(id)
    setError('')
    try {
      await cancelOrder(id)
      await refresh()
    } catch (err) {
      setError(friendly(err, '取消訂單失敗，請稍後再試'))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <p className="db-loading">載入中…</p>

  const name = user?.name ?? '校園同學'

  return (
    <>
      <div className="page__head">
        <h1>嗨，{name} 👋 今天想找人帶什麼？</h1>
      </div>

      <div className="split split--wide-aside">
        <div className="stack-5" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <section data-od-id="active-order-block">
            <div className="sec-head">
              <h2 className="h-sec">進行中</h2>
              <a href="my-orders.html?role=orderer">全部訂單</a>
            </div>

            {error && (
              <p role="alert" className="db-error">
                {error}
              </p>
            )}

            {!loaded && !error && <p className="db-loading">載入中…</p>}

            {loaded && orders.length === 0 && !error && (
              <div className="empty">
                <div className="empty__mark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6 4h11l3 3v13H6zM9 4v4h7" />
                  </svg>
                </div>
                <h3>目前沒有進行中的訂單</h3>
              </div>
            )}

            {orders.map((order) => (
              <div key={order.id} className="card" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="order-card__top">
                  <div>
                    <div className="order-card__rest">
                      {order.restaurant} · {order.meal}
                    </div>
                    <div className="meta" style={{ marginTop: '4px' }}>
                      {order.pickup_location} · {formatTime(order.expected_time)}
                    </div>
                  </div>
                  <span className={`badge ${STATUS_BADGE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
                </div>
                <div className="order-card__foot">
                  <span className="meta">帶餐費 ${order.delivery_fee}</span>
                  <span className="rowflex" style={{ gap: 'var(--space-2)' }}>
                    {order.status === 'OPEN' && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => void onCancel(order.id)}
                        disabled={busyId === order.id}
                      >
                        {busyId === order.id ? '取消中…' : '取消訂單'}
                      </button>
                    )}
                    <a className="track-link" href={`order-tracking.html?id=${encodeURIComponent(order.id)}&role=orderer`}>
                      查看狀態時間軸
                      <svg viewBox="0 0 24 24">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </a>
                  </span>
                </div>
              </div>
            ))}
          </section>
        </div>

        <aside className="aside">
          <div className="hero-action" data-od-id="orderer-cta">
            <div>
              <h2>
                沒空買飯？
                <br />
                發一張帶餐需求
              </h2>
              <p>填好餐廳、餐點、取餐地點與時間，順路的同學就能接單。帶餐費由系統依份量與時段自動計算。</p>
            </div>
            <a className="btn btn-white" href="post-order.html?role=orderer">
              ＋ 發布帶餐需求
            </a>
          </div>
          <div className="ministat">
            <div>
              <div className="n">{rating && rating.count > 0 ? rating.average.toFixed(1) : '—'}</div>
              <div className="l">平均評分</div>
            </div>
            <div>
              <div className="n">{rating ? rating.count : '—'}</div>
              <div className="l">{rating && rating.count > 0 ? '筆評價' : '尚無評價'}</div>
            </div>
            <div>
              <div className="n">{loaded ? orders.length : '—'}</div>
              <div className="l">進行中訂單</div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
