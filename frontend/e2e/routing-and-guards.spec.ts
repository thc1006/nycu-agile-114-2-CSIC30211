import { test, expect } from '@playwright/test'

test.describe('routing', () => {
  test('renders the landing page at the root', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/CampusEats/)
    await expect(page.getByRole('heading', { name: /沒空買飯/ })).toBeVisible()
  })

  test('resolves a legacy .html deep link through the SPA router', async ({ page }) => {
    await page.goto('/feed.html?role=runner')
    await expect(page).toHaveURL(/\/feed/)
    await expect(page.getByRole('heading', { name: '待接訂單' })).toBeVisible()
  })

  test('redirects an unknown path back to the landing root', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')
    await expect(page).toHaveURL(/\/$/)
  })
})

test.describe('role guards keep orderer and runner separate', () => {
  test('an orderer cannot land on the runner feed', async ({ page }) => {
    await page.goto('/feed?role=orderer')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('a runner cannot land on the orderer dashboard', async ({ page }) => {
    await page.goto('/dashboard?role=runner')
    await expect(page).toHaveURL(/\/feed/)
  })
})
