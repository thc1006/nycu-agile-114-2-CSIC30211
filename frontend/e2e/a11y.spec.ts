import { test, expect } from './fixtures'

// Full-page accessibility audit in a REAL browser (proper layout, so this is
// where comprehensive axe coverage lives — jsdom can't evaluate the heavy
// interior pages efficiently). axe-core is a project dependency; we inject the
// bundled build and run it in-page. color-contrast is asserted here (real paint)
// against serious/critical-impact rules so structural barriers fail the gate.
const AXE_PATH = 'node_modules/axe-core/axe.js'

const pages: Array<{ name: string; url: string }> = [
  { name: 'landing', url: '/' },
  { name: 'register', url: '/register' },
  { name: 'login', url: '/login?role=orderer' },
  { name: 'dashboard', url: '/dashboard?role=orderer' },
  { name: 'post-order', url: '/post-order?role=orderer' },
  { name: 'my-orders', url: '/my-orders?role=orderer' },
  { name: 'order-tracking', url: '/order-tracking?role=orderer' },
  { name: 'orderer-reviews', url: '/orderer-reviews?role=orderer' },
  { name: 'rating', url: '/rating?role=orderer' },
  { name: 'history-detail', url: '/history-detail?role=orderer&id=CE-2039' },
  { name: 'profile', url: '/profile?role=orderer' },
  { name: 'feed', url: '/feed?role=runner' },
  { name: 'order-detail', url: '/order-detail?role=runner' },
  { name: 'runner-earnings', url: '/runner-earnings?role=runner' },
  { name: 'runner-reviews', url: '/runner-reviews?role=runner' },
]

interface AxeViolation {
  id: string
  impact: string | null
  help: string
  nodes: Array<{ target: string[] }>
}

test.describe('accessibility — axe-core (real browser)', () => {
  for (const p of pages) {
    test(`${p.name} has no serious or critical violations`, async ({ page }) => {
      await page.goto(p.url)
      await page.addScriptTag({ path: AXE_PATH })
      const violations = (await page.evaluate(async () => {
        const axe = (window as unknown as { axe: { run: (ctx: Document, opts: unknown) => Promise<{ violations: AxeViolation[] }> } }).axe
        const res = await axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
        })
        return res.violations
      })) as AxeViolation[]

      const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      const summary = serious.map((v) => `${v.impact} ${v.id} (${v.help}) @ ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`).join('\n')
      expect(serious, `serious/critical a11y violations on ${p.name}:\n${summary}`).toEqual([])
    })
  }
})

test.describe('accessibility — keyboard interaction', () => {
  test('skip link is the first tab stop and jumps to main content', async ({ page }) => {
    await page.goto('/dashboard?role=orderer')
    await page.keyboard.press('Tab')
    const skip = page.locator('.skip-link')
    await expect(skip).toBeFocused()
    await expect(skip).toHaveAttribute('href', '#main')
    await expect(page.locator('#main')).toBeVisible()
  })

  test('the star rating widget is a radiogroup whose selection enables submit', async ({ page }) => {
    const json = (b: unknown) => ({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(b),
    })
    await page.route((u) => u.pathname.endsWith('/auth/me'), (r) =>
      r.fulfill(json({ id: 'u_me', email: 'me@campus.edu', name: '我' })),
    )
    await page.route((u) => u.pathname.endsWith('/orders/o_a'), (r) =>
      r.fulfill(
        json({
          id: 'o_a',
          customer_id: 'u_me',
          runner_id: 'u_runner',
          restaurant: '茶壜',
          meal: '珍奶 ×1',
          pickup_location: '資工系館',
          expected_time: '2026-06-10T12:30:00+08:00',
          delivery_fee: 20,
          status: 'COMPLETED',
          created_at: '2026-06-04T10:00:00+08:00',
          updated_at: '2026-06-04T13:00:00+08:00',
        }),
      ),
    )

    await page.goto('/rating?id=o_a&role=orderer')
    const group = page.getByRole('radiogroup')
    await expect(group).toBeVisible()
    // Choosing a star enables the submit button.
    await group.getByRole('radio', { name: /4 星/ }).click()
    await expect(page.getByRole('button', { name: '送出評價' })).toBeEnabled()
  })
})
