import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Ajaia Docs End-to-End Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Ensure active user is reset to alice@ajaia.ai
    await page.selectOption('#user-select', 'alice@ajaia.ai')
  })

  test('create, inline rename, format, and verify reload persistence', async ({ page }) => {
    // 1. Create document
    await page.click('#btn-new-document')
    await expect(page.locator('#doc-title-input')).toBeVisible()

    // 2. Inline rename
    const titleInput = page.locator('#doc-title-input')
    await titleInput.fill('Q4 Strategic Roadmap')
    await titleInput.press('Enter')

    // 3. Format in TipTap Editor
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.fill('')

    // Type text and format
    await page.keyboard.type('Executive Summary')
    await page.keyboard.press('Enter')

    // Select Heading 1 from toolbar
    await page.click('button[title="Heading 1"]')
    await page.keyboard.type('Main Objectives')
    await page.keyboard.press('Enter')

    // Click Bullet List
    await page.click('button[title="Bullet List"]')
    await page.keyboard.type('Accelerate platform adoption')
    await page.keyboard.press('Enter')
    await page.keyboard.type('Ensure zero regression')

    // 4. Save and verify status indicator
    await page.click('#btn-save')
    await expect(page.locator('#save-status-indicator')).toContainText('Saved')

    // 5. Reload and check persistence
    await page.reload()
    await expect(page.locator('#doc-title-input')).toHaveValue('Q4 Strategic Roadmap')
    await expect(editor.locator('h1')).toHaveText('Main Objectives')
    await expect(editor.locator('ul li').first()).toHaveText('Accelerate platform adoption')
  })

  test('auto-save indicator and Ctrl+S keyboard shortcut', async ({ page }) => {
    // Create new doc
    await page.click('#btn-new-document')
    const titleInput = page.locator('#doc-title-input')
    await titleInput.fill('AutoSave Verification Document')

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await page.keyboard.type('Testing debounced auto-save behavior.')

    // Check status turns to Unsaved or Saving
    const indicator = page.locator('#save-status-indicator')
    await expect(indicator).toBeVisible()

    // Press Ctrl+S
    await page.keyboard.press('Control+s')
    await expect(indicator).toContainText('Saved')

    // Verify persisted
    await page.reload()
    await expect(page.locator('#doc-title-input')).toHaveValue('AutoSave Verification Document')
    await expect(editor).toContainText('Testing debounced auto-save behavior.')
  })

  test('document import valid .md and rejection of unsupported files', async ({ page }) => {
    // 1. Open Import Modal
    await page.click('#btn-import-document')
    const importModal = page.locator('#import-modal-title')
    await expect(importModal).toBeVisible()

    // 2. Upload valid markdown file
    const sampleMdPath = path.resolve('sample_imports', 'welcome_guide.md')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(sampleMdPath)

    await page.click('button:has-text("Import Document")')

    // Document should load in workspace
    await expect(page.locator('#doc-title-input')).toHaveValue('welcome_guide')
    const editor = page.locator('.ProseMirror')
    await expect(editor.locator('h1')).toHaveText('Ajaia Collaborative Docs Guide')
    await expect(editor.locator('ul li').first()).toContainText('Fast Execution')

    // 3. Test invalid file rejection in UI
    await page.click('#btn-import-document')
    const invalidPdfPath = path.resolve('sample_imports', 'invalid_file.pdf')
    await fileInput.setInputFiles(invalidPdfPath)

    // Should immediately display error alert
    const errorAlert = page.locator('.modal-alert.error')
    await expect(errorAlert).toBeVisible()
    await expect(errorAlert).toContainText('Unsupported file type')

    // Cancel modal
    await page.click('button:has-text("Cancel")')
  })

  test('sharing access control: alice shares with bob, bob edits, charlie denied, revoke', async ({ page }) => {
    const titanTitle = `Project Titan Architecture ${Date.now()}`

    // 1. Alice creates a new document
    await page.click('#btn-new-document')
    const titleInput = page.locator('#doc-title-input')
    await expect(titleInput).toBeVisible()
    await titleInput.fill(titanTitle)
    await page.click('#btn-save')
    await expect(page.locator('#save-status-indicator')).toContainText('Saved')

    // Verify Alice has Owner badge and Share/Delete controls
    await expect(page.locator('#badge-owner')).toBeVisible()
    await expect(page.locator('#btn-share')).toBeVisible()
    await expect(page.locator('#btn-delete')).toBeVisible()

    // 2. Alice shares with Bob
    await page.click('#btn-share')
    const shareModal = page.locator('#share-modal-title')
    await expect(shareModal).toBeVisible()

    const emailInput = page.locator('input[placeholder*="Teammate\'s email"]')
    await emailInput.fill('bob@ajaia.ai')
    await page.click('#btn-modal-share')

    // Verify Bob appears in list
    await expect(page.locator('.shared-user-email')).toHaveText('bob@ajaia.ai')
    await page.click('button:has-text("Done")')

    // 3. Switch user to Bob
    await page.selectOption('#user-select', 'bob@ajaia.ai')

    // Bob should see Titan Architecture under "Shared with Me"
    const sharedSection = page.locator('.section-shared-with-me')
    await expect(sharedSection).toContainText(titanTitle)

    const titanDocItem = sharedSection.locator(`.doc-item:has-text("${titanTitle}")`)
    await titanDocItem.click()

    // Verify Bob sees "Shared by alice" badge and NO Share or Delete buttons
    await expect(page.locator('#badge-shared')).toBeVisible()
    await expect(page.locator('#badge-shared')).toContainText('Shared by alice')
    await expect(page.locator('#btn-share')).not.toBeVisible()
    await expect(page.locator('#btn-delete')).not.toBeVisible()

    // Bob can edit and save
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await page.keyboard.type('Bob reviewed and approved the architecture specs.')
    await page.click('#btn-save')
    await expect(page.locator('#save-status-indicator')).toContainText('Saved')

    // 4. Switch user to Charlie
    await page.selectOption('#user-select', 'charlie@ajaia.ai')

    // Charlie must NOT see Project Titan in his lists
    await expect(page.locator('.sidebar-content')).not.toContainText(titanTitle)

    // 5. Switch back to Alice
    await page.selectOption('#user-select', 'alice@ajaia.ai')
    const aliceTitanItem = page.locator(`.section-my-docs .doc-item:has-text("${titanTitle}")`)
    await aliceTitanItem.click()

    // Verify Bob's edit is visible to Alice
    await expect(editor).toContainText('Bob reviewed and approved the architecture specs.')

    // Alice revokes Bob's share
    await page.click('#btn-share')
    await expect(page.locator('.shared-user-item:has-text("bob@ajaia.ai")')).toBeVisible()
    await page.click('.btn-revoke:has-text("Revoke")')
    await expect(page.locator('.shared-user-item:has-text("bob@ajaia.ai")')).not.toBeVisible()
    await page.click('button:has-text("Done")')

    // 6. Switch back to Bob: document should be gone
    await page.selectOption('#user-select', 'bob@ajaia.ai')
    await expect(page.locator('.sidebar-content')).not.toContainText(titanTitle)
  })
})
