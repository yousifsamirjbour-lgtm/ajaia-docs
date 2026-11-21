import { chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8000'
const ASSETS_DIR = path.resolve('deliverables', 'assets')
const VIDEO_PUBLIC_DIR = path.resolve('video', 'public')

async function run() {
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true })
  if (!fs.existsSync(VIDEO_PUBLIC_DIR)) fs.mkdirSync(VIDEO_PUBLIC_DIR, { recursive: true })

  console.log(`Connecting to app at ${BASE_URL}...`)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  })
  const page = await context.newPage()

  try {
    // 1. Initial Overview
    await page.goto(BASE_URL)
    await page.waitForSelector('#user-select')
    await page.selectOption('#user-select', 'alice@ajaia.ai')
    await page.waitForTimeout(600)

    const snap1 = path.join(ASSETS_DIR, 'screenshot_01_editor_overview.png')
    await page.screenshot({ path: snap1 })
    fs.copyFileSync(snap1, path.join(VIDEO_PUBLIC_DIR, 'screenshot_01_editor_overview.png'))
    console.log('Saved screenshot_01_editor_overview.png')

    // 2. Create document & rich format
    await page.click('#btn-new-document')
    await page.waitForSelector('#doc-title-input')
    const titleInput = page.locator('#doc-title-input')
    await titleInput.fill('Engineering Architecture Brief')

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await page.keyboard.type('High-Performance Full-Stack Platform')
    await page.keyboard.press('Enter')

    await page.click('button[title="Heading 1"]')
    await page.keyboard.type('Core Components')
    await page.keyboard.press('Enter')

    await page.click('button[title="Bullet List"]')
    await page.keyboard.type('FastAPI asynchronous execution')
    await page.keyboard.press('Enter')
    await page.keyboard.type('React 18 with TipTap rich text engine')
    await page.keyboard.press('Enter')
    await page.keyboard.type('Server-side nh3 Rust HTML sanitization')

    await page.click('#btn-save')
    await page.waitForSelector('#save-status-indicator:has-text("Saved")')

    const snap2 = path.join(ASSETS_DIR, 'screenshot_02_rich_formatting.png')
    await page.screenshot({ path: snap2 })
    fs.copyFileSync(snap2, path.join(VIDEO_PUBLIC_DIR, 'screenshot_02_rich_formatting.png'))
    console.log('Saved screenshot_02_rich_formatting.png')

    // 3. Auto-save status
    await editor.click()
    await page.keyboard.type(' [Verified Auto-Save]')
    await page.waitForTimeout(100)
    const snap3 = path.join(ASSETS_DIR, 'screenshot_03_autosave_indicator.png')
    await page.screenshot({ path: snap3 })
    fs.copyFileSync(snap3, path.join(VIDEO_PUBLIC_DIR, 'screenshot_03_autosave_indicator.png'))
    console.log('Saved screenshot_03_autosave_indicator.png')
    await page.keyboard.press('Control+s')
    await page.waitForSelector('#save-status-indicator:has-text("Saved")')

    // Get current doc ID
    const docUrl = page.url()
    const docId = docUrl.split('#')[1] || ''
    console.log(`Working with document ID: ${docId}`)

    // 4. Share Modal
    await page.click('#btn-share')
    await page.waitForSelector('#share-modal-title')
    const emailInput = page.locator('input[placeholder*="Teammate\'s email"]')
    await emailInput.fill('bob@ajaia.ai')
    await page.click('#btn-modal-share')
    await page.waitForSelector('.shared-user-email:has-text("bob@ajaia.ai")')

    const snap4 = path.join(ASSETS_DIR, 'screenshot_04_share_modal.png')
    await page.screenshot({ path: snap4 })
    fs.copyFileSync(snap4, path.join(VIDEO_PUBLIC_DIR, 'screenshot_04_share_modal.png'))
    console.log('Saved screenshot_04_share_modal.png')
    await page.click('button:has-text("Done")')
    await page.waitForTimeout(300)

    // 5. Bob's View (Shared with Me)
    await page.selectOption('#user-select', 'bob@ajaia.ai')
    await page.waitForTimeout(600)
    await page.waitForSelector('.section-shared-with-me')
    const bobDocItem = page.locator('.section-shared-with-me .doc-item:has-text("Engineering Architecture Brief")')
    if (await bobDocItem.count() > 0) {
      await bobDocItem.first().click()
    }
    await page.waitForSelector('#badge-shared', { timeout: 5000 })

    const snap5 = path.join(ASSETS_DIR, 'screenshot_05_shared_with_me.png')
    await page.screenshot({ path: snap5 })
    fs.copyFileSync(snap5, path.join(VIDEO_PUBLIC_DIR, 'screenshot_05_shared_with_me.png'))
    console.log('Saved screenshot_05_shared_with_me.png')

    // 6. Import Modal (Alice)
    await page.selectOption('#user-select', 'alice@ajaia.ai')
    await page.waitForTimeout(400)
    await page.click('#btn-import-document')
    await page.waitForSelector('#import-modal-title')

    const snap6 = path.join(ASSETS_DIR, 'screenshot_06_import_modal.png')
    await page.screenshot({ path: snap6 })
    fs.copyFileSync(snap6, path.join(VIDEO_PUBLIC_DIR, 'screenshot_06_import_modal.png'))
    console.log('Saved screenshot_06_import_modal.png')

    // 7. Invalid Import Error
    const fileInput = page.locator('input[type="file"]')
    const invalidPath = path.resolve('sample_imports', 'invalid_file.pdf')
    await fileInput.setInputFiles(invalidPath)
    await page.waitForSelector('.modal-alert.error')

    const snap7 = path.join(ASSETS_DIR, 'screenshot_07_invalid_import_error.png')
    await page.screenshot({ path: snap7 })
    fs.copyFileSync(snap7, path.join(VIDEO_PUBLIC_DIR, 'screenshot_07_invalid_import_error.png'))
    console.log('Saved screenshot_07_invalid_import_error.png')
    await page.click('button:has-text("Cancel")')
    await page.waitForTimeout(300)

    // 8. Access Denied (Charlie attempts to access Alice's document)
    if (docId) {
      await page.goto(`${BASE_URL}/#${docId}`)
      await page.waitForSelector('#user-select')
      await page.selectOption('#user-select', 'charlie@ajaia.ai')
      await page.waitForTimeout(500)
    }
    const snap8 = path.join(ASSETS_DIR, 'screenshot_08_access_denied.png')
    await page.screenshot({ path: snap8 })
    fs.copyFileSync(snap8, path.join(VIDEO_PUBLIC_DIR, 'screenshot_08_access_denied.png'))
    console.log('Saved screenshot_08_access_denied.png')

    console.log('All 8 screenshots captured successfully!')
  } finally {
    await browser.close()
  }
}

run().catch(err => {
  console.error('Capture error:', err)
  process.exit(1)
})
