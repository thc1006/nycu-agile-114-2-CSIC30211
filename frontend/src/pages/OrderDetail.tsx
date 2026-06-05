import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { getOrder, acceptOrder, type OrderResponse } from '../lib/api/orders'
import { ApiError } from '../lib/api/client'
import { useRequireAuth } from '../lib/session'

type Status = OrderResponse['status']

const STATUS_LABEL: Record<Status, string> = {
  OPEN: '待接單',
  ACCEPTED: '已接單',
  BUYING: '購買・配送中',
  DELIVERED: '已送達',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

function statusLabel(status: Status): string {
  return STATUS_LABEL[status] ?? status
}

function friendly(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.status !== 0 ? err.detail : fallback
}

/** Format an ISO time as a short zh-TW label, guarding invalid dates. */
function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/**
 * Real, API-wired order detail + accept view (AG-004), replacing the mock whose
 * accept button only flipped local state. Reads ?id=, loads GET /orders/{id},
 * and lets a runner claim an OPEN order via POST /orders/{id}/accept, then routes
 * to the live tracking page. Already-taken orders show a notice instead.
 */
export default function OrderDetail() {
  const { user, loading } = useRequireAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const id = params.get('id')

  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    if (!id) return
    try {
      setOrder(await getOrder(id))
      setError('')
    } catch (err) {
      setError(friendly(err, '載入訂單失敗，請稍後再試'))
    }
  }, [id])

  useEffect(() => {
    if (loading || !id) return
    void refresh()
  }, [loading, id, refresh])

  async function accept() {
    if (!id || busy) return
    setBusy(true)
    setError('')
    try {
      await acceptOrder(id)
      navigate(`/order-tracking?id=${encodeURIComponent(id)}&role=runner`)
    } catch (err) {
      setError(friendly(err, '接單失敗，請稍後再試'))
      setBusy(false)
      void refresh()
    }
  }

  if (loading) return <p className="count">載入中…</p>

  // No id → nothing to show; offer a way back to the feed.
  if (!id) {
    return (
      <section className="stack-5" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h1>找不到訂單</h1>
        <p className="muted">缺少訂單編號，無法顯示詳情。</p>
        <p>
          <a className="btn btn-black btn--lg" href="feed.html?role=runner">
            回到待接訂單
          </a>
        </p>
      </section>
    )
  }

  if (!order && !error) return <p className="count">載入中…</p>

  if (!order) {
    return (
      <section className="stack-5" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h1>找不到訂單</h1>
        <p role="alert" className="form-error">
          {error}
        </p>
        <p>
          <a className="btn btn-black btn--lg" href="feed.html?role=runner">
            回到待接訂單
          </a>
        </p>
      </section>
    )
  }

  const isOpen = order.status === 'OPEN'
  const isMine = Boolean(user && order.runner_id === user.id)
  const isOwner = Boolean(user && order.customer_id === user.id)

  return (
    <div className="detail-grid">
      <div className="stack-5" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div className="between">
          <span className={`badge ${isOpen ? 'badge--open' : ''}`}>{statusLabel(order.status)}</span>
        </div>
        <div>
          <div className="detail-rest">{order.restaurant}</div>
          <p className="muted" style={{ marginTop: '4px' }}>
            {order.meal}
          </p>
        </div>
        <dl style={{ margin: '0' }}>
          <div className="kv">
            <dt>取餐地點</dt>
            <dd>{order.pickup_location}</dd>
          </div>
          <div className="kv">
            <dt>期望送達</dt>
            <dd>{formatTime(order.expected_time)} 前</dd>
          </div>
          <div className="kv">
            <dt>狀態</dt>
            <dd>{statusLabel(order.status)}</dd>
          </div>
        </dl>
      </div>

      <aside className="accept-card">
        <div className="card stack-4">
          <div className="between">
            <span className="muted">帶餐費</span>
            <span className="fee" style={{ fontSize: 'var(--text-2xl)' }}>
              ${order.delivery_fee}
            </span>
          </div>

          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}

          {isOwner ? (
            <>
              <p className="lockmsg">這是你發布的訂單 · 目前狀態：{statusLabel(order.status)}</p>
              <a
                className="btn btn-black btn--block btn--lg"
                href={`order-tracking.html?id=${encodeURIComponent(order.id)}&role=orderer`}
              >
                前往訂單追蹤
              </a>
            </>
          ) : isOpen ? (
            <>
              <p className="lockmsg" id="lockNote">
                <svg viewBox="0 0 24 24">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                接單後立即鎖定，其他人無法重複接
              </p>
              <button
                type="button"
                className="btn btn-black btn--block btn--lg"
                onClick={() => void accept()}
                disabled={busy}
              >
                {busy ? '鎖定訂單中…' : `接下這筆訂單 · $${order.delivery_fee}`}
              </button>
            </>
          ) : isMine ? (
            <>
              <p className="lockmsg">這筆訂單已是你的 · 目前狀態：{statusLabel(order.status)}</p>
              <a className="btn btn-black btn--block btn--lg" href={`order-tracking.html?id=${encodeURIComponent(order.id)}&role=runner`}>
                前往配送流程
              </a>
            </>
          ) : (
            <>
              <p className="lockmsg">這筆訂單已被接單 · 目前狀態：{statusLabel(order.status)}</p>
              <a className="btn btn-black btn--block btn--lg" href="feed.html?role=runner">
                回到待接訂單
              </a>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
