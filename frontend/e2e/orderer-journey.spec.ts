import { test, expect } from '@playwright/test'

// Full orderer lifecycle, end to end through the browser. The runner journey is
// already covered (accept → tracking); this closes the orderer side, which
// previously stopped at the post-order success overlay.
//
// NOTE on scope: the tracking state machine is per-page-load and the 4→5
// "確認收餐" transition is driven by the *runner* in the mock (state is not yet
// shared across roles — that arrives with the backend). So the lifecycle splits
// into the two transitions an orderer can actually drive solo: create→track, and
// the post-completion rating submit. Both are asserted below.

test.describe('orderer lifecycle', () => {
  test('creates an order and lands on live tracking', async ({ page }) => {
    await page.goto('/post-order?role=orderer')

    // Fill the request for a menu-less shop (free-text items path).
    await page.locator('#restaurant').fill('小確幸早餐店')
    await page.locator('#freeItems').fill('蛋餅 ×1、奶茶微糖少冰 ×1')
    await page.locator('#time').selectOption({ label: '12:30 前' })

    // Review → success overlay with the system-calculated fee.
    await page.getByRole('button', { name: '檢視並確認' }).click()
    const success = page.locator('#successScreen')
    await expect(success).toBeVisible()
    await expect(success.getByText('訂餐成功')).toBeVisible()
    await expect(page.locator('#sumFee')).toContainText('$')

    // Confirm → order tracking (client-side, no full reload).
    await page.getByRole('button', { name: '查看訂單進度' }).click()
    await expect(page).toHaveURL(/order-tracking/)

    // Tracking renders the live order: heading, partner, computed fee, and the
    // orderer-facing status note.
    await expect(page.getByRole('heading', { name: '即時進度' })).toBeVisible()
    await expect(page.locator('#partnerName')).toContainText('帶餐者')
    await expect(page.locator('#tkFee')).toContainText('$')
    await expect(page.locator('#ctxNote')).not.toBeEmpty()
  })

  test('submits a star rating and sees the completion state', async ({ page }) => {
    await page.goto('/rating?role=orderer')

    const stars = page.locator('#starWidget')
    await expect(stars).toHaveAttribute('role', 'radiogroup')
    // Submit is disabled until a rating is chosen.
    await expect(page.locator('#submitBtn')).toBeDisabled()

    // Drive the radiogroup with the keyboard to a 4-star rating.
    await stars.locator('[role="radio"]').first().focus()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect(stars).toHaveAttribute('data-value', '4')

    // Optionally pick a quick tag, then submit.
    await page.locator('#quickTags .qt').first().click()
    const submit = page.locator('#submitBtn')
    await expect(submit).toBeEnabled()
    await submit.click()

    // The form collapses into the done state and confirms via toast.
    await expect(page.locator('#donePane')).toBeVisible()
    await expect(page.locator('#ratePane')).toBeHidden()
    await expect(page.locator('.toast-wrap')).toContainText('已送出')
  })
})
