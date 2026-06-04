import { useState } from 'react'
import { useNavigate } from 'react-router'
import { createOrder } from '../lib/api/orders'
import { ApiError } from '../lib/api/client'
import { useRequireAuth } from '../lib/session'

// Pickup spots and delivery windows are presented as fixed choices (the campus
// has a handful of real drop-offs); the meal itself is free text so any order
// can be expressed. The fee is computed by the platform (flat campus rate +
// peak surcharge) — orderers don't set it, matching the deployed UX.
const PICKUP_SPOTS = ['圖書館 1F 大廳', '工學院 3F 走廊', '綜合大樓 5F 實驗室'] as const
const TIME_OPTIONS = [
  '越快越好（30 分鐘內）',
  '11:30 前',
  '12:00 前',
  '12:30 前',
  '13:00 前',
  '14:00 前',
] as const

const BASE_FEE = 15
const PEAK_SURCHARGE = 5

/** Lunch-rush windows carry a small surcharge (mirrors the legacy fee UI). */
function isPeak(timeOption: string): boolean {
  return /越快|11:30|12:00|12:30|13:00/.test(timeOption)
}
function feeFor(timeOption: string): number {
  return BASE_FEE + (isPeak(timeOption) ? PEAK_SURCHARGE : 0)
}

/** Turn a display window ("12:30 前" / "越快越好…") into a concrete ISO time. */
function toExpectedISO(timeOption: string): string {
  const now = new Date()
  if (timeOption.startsWith('越快越好')) {
    return new Date(now.getTime() + 30 * 60 * 1000).toISOString()
  }
  const match = timeOption.match(/(\d{1,2}):(\d{2})/)
  if (!match) return new Date(now.getTime() + 60 * 60 * 1000).toISOString()
  const target = new Date(now)
  target.setHours(Number(match[1]), Number(match[2]), 0, 0)
  // If that time already passed today, the order is for tomorrow's same window.
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1)
  return target.toISOString()
}

function friendly(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.status !== 0 ? err.detail : fallback
}

/**
 * Real, API-wired "post an order" form (AG-002), replacing the mock that only
 * showed a success overlay. On submit it POSTs /orders and routes to the live
 * tracking page for the created order, so the order actually reaches the runner
 * feed and both screens can sync.
 */
export default function PostOrder() {
  const { loading } = useRequireAuth()
  const navigate = useNavigate()

  const [restaurant, setRestaurant] = useState('')
  const [meal, setMeal] = useState('')
  const [pickup, setPickup] = useState<string>(PICKUP_SPOTS[0])
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const fee = time ? feeFor(time) : BASE_FEE

  async function submit() {
    if (busy) return
    if (!restaurant.trim() || !meal.trim() || !time) {
      setError('請填寫餐廳、餐點內容並選擇期望送達時間。')
      return
    }
    setError('')
    setBusy(true)
    try {
      const created = await createOrder({
        restaurant: restaurant.trim(),
        meal: note.trim() ? `${meal.trim()}（備註：${note.trim()}）` : meal.trim(),
        pickup_location: pickup,
        expected_time: toExpectedISO(time),
        delivery_fee: feeFor(time),
      })
      navigate(`/order-tracking?id=${encodeURIComponent(created.id)}&role=orderer`)
    } catch (err) {
      setError(friendly(err, '發布訂單失敗,請稍後再試'))
      setBusy(false)
    }
  }

  if (loading) return <p className="po-loading">載入中…</p>

  return (
    <>
      <div className="page__head">
        <p className="crumb">發布帶餐需求</p>
        <h1>發布帶餐需求</h1>
        <p>
          標 <span style={{ color: 'var(--danger)' }}>*</span> 為必填。資訊越清楚,順路的同學越敢接單。
        </p>
      </div>

      <form
        className="post-grid"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <div className="stack-4">
          {error && (
            <p role="alert" className="po-error">
              {error}
            </p>
          )}

          <div className="field">
            <label htmlFor="po-restaurant">
              餐廳 / 店家<span className="req">*</span>
            </label>
            <input
              className="control"
              id="po-restaurant"
              placeholder="例：阿嬤的飯桶、拉亞漢堡、茶壜"
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="po-meal">
              餐點內容<span className="req">*</span>
            </label>
            <textarea
              className="control"
              id="po-meal"
              placeholder="例：雞腿便當 ×1（不要辣、加滷蛋）、紅茶微糖少冰 ×1"
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
            />
            <span className="hint">寫清楚品項、數量與客製(辣度、冰塊、加料),避免買錯。</span>
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="po-spot">
                取餐地點<span className="req">*</span>
              </label>
              <select
                className="control"
                id="po-spot"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              >
                {PICKUP_SPOTS.map((spot) => (
                  <option key={spot} value={spot}>
                    {spot}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="po-time">
                期望送達時間<span className="req">*</span>
              </label>
              <select
                className="control"
                id="po-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="">選擇時間</option>
                {TIME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="po-note">備註（選填）</label>
            <textarea
              className="control"
              id="po-note"
              placeholder="例：我會在大廳沙發區、找不到可以打電話給我"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <aside className="aside-fee">
          <div className="card stack-4">
            <div>
              <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                帶餐費
                <span
                  style={{
                    fontWeight: 500,
                    color: 'var(--meta)',
                    fontSize: 'var(--text-xs)',
                    marginLeft: 6,
                  }}
                >
                  系統自動計算
                </span>
              </span>
              <div className="fee-calc" style={{ marginTop: 8 }}>
                <div className="fee-calc__rows">
                  <div className="row">
                    <span>基本帶餐費</span>
                    <span className="amt">${BASE_FEE}</span>
                  </div>
                  {time && isPeak(time) && (
                    <div className="row">
                      <span>尖峰時段加成</span>
                      <span className="amt">+${PEAK_SURCHARGE}</span>
                    </div>
                  )}
                </div>
                <div className="fee-calc__total">
                  <span>帶餐費</span>
                  <span className="fee">${fee}</span>
                </div>
              </div>
              <p className="fee-note">
                校園統一費率,訂餐者無法自訂——和 Uber Eats 一樣由系統計算,確保價格透明、帶餐者收入公平。
              </p>
            </div>
            <button className="btn btn-black btn--block btn--lg" type="submit" disabled={busy}>
              {busy ? '發布中…' : '發布帶餐需求'}
            </button>
          </div>
        </aside>
      </form>
    </>
  )
}
