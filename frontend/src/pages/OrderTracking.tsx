import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  getOrder,
  createOrder,
  acceptOrder,
  startOrder,
  deliverOrder,
  confirmOrder,
  type OrderResponse,
} from '../lib/api/orders'
import { ApiError } from '../lib/api/client'

type Role = 'orderer' | 'runner'
type Status = OrderResponse['status']

// 5 visible steps mapping the backend FSM (no client-side state — status is the
// single source of truth on the server).
const STEPS: { status: Status; label: string }[] = [
  { status: 'OPEN', label: '已發布' },
  { status: 'ACCEPTED', label: '已接單' },
  { status: 'BUYING', label: '購買・配送中' },
  { status: 'DELIVERED', label: '已送達' },
  { status: 'COMPLETED', label: '已完成' },
]
const stepIndex = (s: Status) => STEPS.findIndex((x) => x.status === s)
const POLL_MS = 4000

function friendly(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.status !== 0 ? err.detail : fallback
}

/**
 * Real, API-wired order-tracking view (replaces the legacy mock timeline). Reads
 * the order id from ?id=, renders the live status, and lets the right party
 * advance the server FSM. "Real-time" is REST polling (no push — by design, see
 * spec). With no id it offers a self-contained demo order so the flow is
 * demoable without the (still-mock) post-order / feed pages.
 */
export default function OrderTracking() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const id = params.get('id')
  const role: Role = params.get('role') === 'runner' ? 'runner' : 'orderer'

  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    if (!id) return
    try {
      setOrder(await getOrder(id))
    } catch (err) {
      setError(friendly(err, '載入訂單失敗,請稍後再試'))
    }
  }, [id])

  // initial load + light polling for near-real-time updates
  useEffect(() => {
    if (!id) return
    void refresh()
    const timer = setInterval(() => void refresh(), POLL_MS)
    return () => clearInterval(timer)
  }, [id, refresh])

  async function act(fn: (orderId: string) => Promise<OrderResponse>) {
    if (!id || busy) return
    setBusy(true)
    setError('')
    try {
      setOrder(await fn(id))
    } catch (err) {
      setError(friendly(err, '操作失敗,請稍後再試'))
    } finally {
      setBusy(false)
    }
  }

  async function createDemoOrder() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const created = await createOrder({
        restaurant: '示範餐廳',
        meal: '示範餐點 ×1',
        pickup_location: '圖書館 1F 大廳',
        expected_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        delivery_fee: 20,
      })
      navigate(`/order-tracking?id=${encodeURIComponent(created.id)}&role=${role}`)
    } catch (err) {
      setError(friendly(err, '建立示範訂單失敗,請先登入再試'))
    } finally {
      setBusy(false)
    }
  }

  // No order selected → offer a self-contained demo order to track.
  if (!id) {
    return (
      <section className="track-empty">
        <h1>即時進度</h1>
        <p className="track-empty__lead">
          目前沒有追蹤中的訂單。建立一筆示範訂單,即可看到狀態隨按鈕即時更新(每幾秒自動刷新)。
        </p>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button type="button" className="btn btn-black btn--lg" onClick={createDemoOrder} disabled={busy}>
          {busy ? '建立中…' : '建立示範訂單'}
        </button>
      </section>
    )
  }

  const current = order ? stepIndex(order.status) : -1

  return (
    <section className="track">
      <h1>即時進度</h1>

      {!order && !error && <p>載入中…</p>}

      {order && (
        <>
          {order.status === 'CANCELLED' ? (
            <p className="ctx">這筆訂單已取消。</p>
          ) : (
            <ol className="timeline" aria-label="訂單進度">
              {STEPS.map((step, i) => (
                <li
                  key={step.status}
                  aria-current={i === current ? 'step' : undefined}
                  data-state={i < current ? 'done' : i === current ? 'current' : 'upcoming'}
                >
                  {step.label}
                </li>
              ))}
            </ol>
          )}

          <dl className="track-detail">
            <div className="kv"><dt>餐廳</dt><dd>{order.restaurant}</dd></div>
            <div className="kv"><dt>餐點</dt><dd>{order.meal}</dd></div>
            <div className="kv"><dt>取餐地點</dt><dd>{order.pickup_location}</dd></div>
            <div className="kv"><dt>帶餐費</dt><dd>${order.delivery_fee}</dd></div>
          </dl>

          {error && <p role="alert" className="form-error">{error}</p>}

          <div className="track-actions">
            {renderAction(order.status, role, busy, act)}
          </div>
        </>
      )}
    </section>
  )
}

function renderAction(
  status: Status,
  role: Role,
  busy: boolean,
  act: (fn: (orderId: string) => Promise<OrderResponse>) => void,
) {
  const btn = (label: string, fn: (orderId: string) => Promise<OrderResponse>) => (
    <button
      type="button"
      className="btn btn-black btn--block btn--lg"
      onClick={() => act(fn)}
      disabled={busy}
    >
      {busy ? '處理中…' : label}
    </button>
  )

  if (role === 'runner') {
    if (status === 'OPEN') return btn('接單', acceptOrder)
    if (status === 'ACCEPTED') return btn('開始購買', startOrder)
    if (status === 'BUYING') return btn('標記已送達', deliverOrder)
    if (status === 'DELIVERED') return <p className="ctx">已送達,等待訂餐者確認收餐…</p>
    if (status === 'COMPLETED') return <p className="ctx">交易完成,可互相評價。</p>
    return null
  }

  // orderer
  if (status === 'DELIVERED') return btn('確認收餐', confirmOrder)
  if (status === 'COMPLETED') return <p className="ctx">交易完成,可互相評價。</p>
  return <p className="ctx">帶餐者處理中,狀態會自動更新,不用一直私訊問進度。</p>
}
