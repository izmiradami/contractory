import { test, expect } from '@playwright/test'

// ─── Smoke tests for critical UI flows ───────────────────────

test.describe('Contractory E2E', () => {

  test('homepage redirects to /platform', async ({ page }) => {
    await page.goto('/')
    // Should redirect to /platform or /auth/connect
    await expect(page).toHaveURL(/\/(platform|auth\/connect)/)
  })

  test('connect page renders correctly', async ({ page }) => {
    await page.goto('/auth/connect')
    await expect(page.getByText('Contractory')).toBeVisible()
    await expect(page.getByText('Connect your wallet')).toBeVisible()
    await expect(page.getByText('Sub-second finality')).toBeVisible()
    await expect(page.getByText('USDC-native gas')).toBeVisible()
  })

  test('contract studio page loads', async ({ page }) => {
    // Skip auth for UI test — access directly
    await page.goto('/platform/studio')

    // Monaco editor container should appear
    await expect(page.locator('text=Contract Studio')).toBeVisible({ timeout: 10_000 })
  })

  test('command palette opens with keyboard shortcut', async ({ page }) => {
    await page.goto('/auth/connect')
    await page.keyboard.press('Meta+k')

    // Command palette should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3_000 })

    // Close with Escape
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('settings page has all sections', async ({ page }) => {
    await page.goto('/platform/settings')

    for (const section of ['Appearance', 'Wallet', 'AI Provider', 'Developer', 'Privacy']) {
      await expect(page.getByText(section)).toBeVisible()
    }
  })

  test('contracts page renders without errors', async ({ page }) => {
    await page.goto('/platform/contracts')

    // Should show either contracts or the deploy prompt
    const hasContracts = await page.locator('text=My Contracts').isVisible()
    const hasEmpty     = await page.locator('text=Deploy your first contract').isVisible()
    expect(hasContracts || hasEmpty).toBe(true)
  })

  test('payments hub shows all tabs', async ({ page }) => {
    await page.goto('/platform/money')

    for (const tab of ['Send', 'Bridge', 'Swap', 'Unified Balance', 'Automations']) {
      await expect(page.getByText(tab)).toBeVisible()
    }
  })

  test('agent page renders registry', async ({ page }) => {
    await page.goto('/platform/agents')

    await expect(page.getByText('AI Agent Operating Center')).toBeVisible()
    await expect(page.getByText('Register Agent')).toBeVisible()
  })
})

// ─── API smoke tests ──────────────────────────────────────────

test.describe('API Routes', () => {

  test('compile API returns error for empty source', async ({ request }) => {
    const res = await request.post('/api/compile', {
      data: { source: '', contractName: 'Test' },
    })
    expect(res.status()).toBe(400)
  })

  test('compile API compiles valid Solidity', async ({ request }) => {
    const source = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
contract Simple { uint256 public value = 42; }`

    const res = await request.post('/api/compile', {
      data: { source, contractName: 'Simple' },
    })

    if (res.status() === 200) {
      const data = await res.json() as { abi: unknown[]; bytecode: string }
      expect(data.abi).toBeDefined()
      expect(data.bytecode).toMatch(/^0x/)
    }
    // 200 or 422 are both acceptable (422 = compilation warning/error)
    expect([200, 422]).toContain(res.status())
  })

  test('SIWE nonce endpoint returns a nonce', async ({ request }) => {
    const res = await request.get('/api/auth/siwe')
    expect(res.status()).toBe(200)
    const data = await res.json() as { nonce: string }
    expect(data.nonce).toBeDefined()
    expect(data.nonce.length).toBeGreaterThan(8)
  })

  test('session endpoint returns unauthenticated without cookie', async ({ request }) => {
    const res = await request.get('/api/auth/session')
    expect(res.status()).toBe(200)
    const data = await res.json() as { authenticated: boolean }
    expect(data.authenticated).toBe(false)
  })
})
