import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8000'

test.describe('Ajaia Docs Live Smoke Test Suite', () => {
  test.use({ baseURL: BASE_URL })

  test('smoke test: create, format, reload, share alice -> bob, charlie denied, revoke', async ({ page }) => {
    // Navigate to base URL
    await page.goto('/')

    // Ensure Alice is selected
    await page.selectOption('#user-select', 'alice@ajaia.ai')

    // 1. Create document
    await page.click('#btn-new-document')
    await expect(page.locator('#doc-title-input')).toBeVisible()

    // 2. Format title and content
    const titleInput = page.locator('#doc-title-input')
    const testTitle = `Live Smoke Verification ${Date.now()}`
    await titleInput.fill(testTitle)

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.fill('')
    await page.keyboard.type('Live deployment smoke verification.')

    // 3. Save and reload
    await page.click('#btn-save')
    await expect(page.locator('#save-status-indicator')).toContainText('Saved')

    await page.reload()
    await expect(page.locator('#doc-title-input')).toHaveValue(testTitle)
    await expect(editor).toContainText('Live deployment smoke verification.')

    // 4. Share Alice -> Bob
    await page.click('#btn-share')
    const emailInput = page.locator('input[placeholder*="Teammate\'s email"]')
    await emailInput.fill('bob@ajaia.ai')
    await page.click('#btn-modal-share')
    await expect(page.locator('.shared-user-email')).toHaveText('bob@ajaia.ai')
    await page.click('button:has-text("Done")')

    // 5. Verify Bob can view
    await page.selectOption('#user-select', 'bob@ajaia.ai')
    await expect(page.locator('.sidebar-content')).toContainText(testTitle)
    await page.locator(`.doc-item:has-text("${testTitle}")`).click()
    await expect(page.locator('#badge-shared')).toBeVisible()

    // 6. Verify Charlie is denied
    await page.selectOption('#user-select', 'charlie@ajaia.ai')
    await expect(page.locator('.sidebar-content')).not.toContainText(testTitle)

    // 7. Revoke Bob's access
    await page.selectOption('#user-select', 'alice@ajaia.ai')
    await page.locator(`.doc-item:has-text("${testTitle}")`).click()
    await page.click('#btn-share')
    await page.click('.btn-revoke:has-text("Revoke")')
    await expect(page.locator('.shared-user-item:has-text("bob@ajaia.ai")')).not.toBeVisible()
    await page.click('button:has-text("Done")')

    // Verify Bob no longer has access
    await page.selectOption('#user-select', 'bob@ajaia.ai')
    await expect(page.locator('.sidebar-content')).not.toContainText(testTitle)
  })
})
