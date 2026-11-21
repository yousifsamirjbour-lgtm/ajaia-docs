import { chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8000'
const RECORDINGS_DIR = path.resolve('video', 'public', 'recordings')
const ASSETS_DIR = path.resolve('deliverables', 'assets')

async function run() {
  if (!fs.existsSync(RECORDINGS_DIR)) fs.mkdirSync(RECORDINGS_DIR, { recursive: true })
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true })

  console.log(`Starting real demo recording against ${BASE_URL}...`)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1920, height: 1080 }
    }
  })

  const page = await context.newPage()

  try {
    // 1. Navigate & setup
    await page.goto(BASE_URL)
    await page.waitForSelector('#user-select')
    await page.selectOption('#user-select', 'alice@ajaia.ai')
    await page.waitForTimeout(1000)

    // 2. Create doc & inline rename
    await page.click('#btn-new-document')
    await page.waitForFunction(() => {
      const el = document.querySelector('#doc-title-input')
      return el && el.value === 'Untitled Document'
    }, { timeout: 10000 })
    const titleInput = page.locator('#doc-title-input')
    await titleInput.fill('Ajaia Strategic Architecture')
    await titleInput.evaluate(el => el.blur())
    await page.waitForTimeout(600)

    // 3. Formatting: bold, italic, underline, headings, lists
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await page.keyboard.type('High-Performance Document Platform')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Heading 1
    await page.click('button[title="Heading 1"]')
    await page.keyboard.type('Architecture Core')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Bullet List
    await page.click('button[title="Bullet List"]')
    await page.keyboard.type('FastAPI asynchronous microservices')
    await page.keyboard.press('Enter')
    await page.keyboard.type('TipTap rich-text editing engine')
    await page.keyboard.press('Enter')
    await page.keyboard.type('Server-side nh3 Rust sanitization')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(600)

    // 4. Auto-save & manual save
    await page.click('#btn-save')
    await page.waitForSelector('#save-status-indicator:has-text("Saved")')
    await page.waitForTimeout(1000)

    // 5. Reload persistence
    await page.reload()
    await page.waitForSelector('#doc-title-input')
    await page.waitForTimeout(1000)

    // 6. Sharing flow: Alice shares with Bob
    await page.click('#btn-share')
    await page.waitForSelector('#share-modal-title')
    await page.waitForTimeout(800)

    const emailInput = page.locator('input[placeholder*="Teammate\'s email"]')
    await emailInput.fill('bob@ajaia.ai')
    await page.waitForTimeout(500)
    await page.click('#btn-modal-share')
    await page.waitForSelector('.shared-user-email:has-text("bob@ajaia.ai")')
    await page.waitForTimeout(800)
    await page.click('button:has-text("Done")')
    await page.waitForTimeout(800)

    // 7. Switch to Bob
    await page.selectOption('#user-select', 'bob@ajaia.ai')
    await page.waitForTimeout(1000)
    const bobDoc = page.locator('.section-shared-with-me .doc-item:has-text("Ajaia Strategic Architecture")')
    await bobDoc.waitFor({ timeout: 10000 })
    await bobDoc.click()
    await page.waitForSelector('#badge-shared', { timeout: 5000 })
    await page.waitForTimeout(800)

    // Bob edits
    await editor.click()
    await page.keyboard.type(' [Bob Reviewed & Approved]')
    await page.click('#btn-save')
    await page.waitForSelector('#save-status-indicator:has-text("Saved")')
    await page.waitForTimeout(1000)

    // 8. Switch to Charlie (Denied)
    await page.selectOption('#user-select', 'charlie@ajaia.ai')
    await page.waitForTimeout(1200)

    // 9. Switch back to Alice & revoke Bob
    await page.selectOption('#user-select', 'alice@ajaia.ai')
    await page.waitForTimeout(1000)
    const aliceDoc = page.locator('.section-my-docs .doc-item:has-text("Ajaia Strategic Architecture")')
    await aliceDoc.waitFor({ timeout: 10000 })
    await aliceDoc.click()
    await page.waitForTimeout(600)
    await page.click('#btn-share')
    await page.waitForSelector('.shared-user-item:has-text("bob@ajaia.ai")')
    await page.waitForTimeout(800)
    await page.click('.btn-revoke:has-text("Revoke")')
    await page.waitForTimeout(800)
    await page.click('button:has-text("Done")')
    await page.waitForTimeout(800)

    // 10. Import flow
    await page.click('#btn-import-document')
    await page.waitForSelector('#import-modal-title')
    await page.waitForTimeout(600)

    const sampleMd = path.resolve('sample_imports', 'welcome_guide.md')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(sampleMd)
    await page.waitForTimeout(800)
    await page.click('button:has-text("Import Document")')
    await page.waitForFunction(() => document.querySelector('#doc-title-input')?.value.includes('welcome_guide'), { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Invalid import test
    await page.click('#btn-import-document')
    await page.waitForSelector('#import-modal-title')
    const invalidPdf = path.resolve('sample_imports', 'invalid_file.pdf')
    await fileInput.setInputFiles(invalidPdf)
    await page.waitForSelector('.modal-alert.error')
    await page.waitForTimeout(1000)
    await page.click('button:has-text("Cancel")')
    await page.waitForTimeout(1000)

    const videoPath = await page.video()?.path()
    console.log('Real demo flow recorded successfully! Video path:', videoPath)

    await page.close()
    await context.close()
    await browser.close()

    if (videoPath && fs.existsSync(videoPath)) {
      const dest = path.join(ASSETS_DIR, 'demo_recording.webm')
      fs.copyFileSync(videoPath, dest)
      console.log('Copied recording to deliverables/assets/demo_recording.webm')
    }
  } catch (err) {
    await page.close().catch(() => {})
    await context.close().catch(() => {})
    await browser.close().catch(() => {})
    throw err
  }
}

run().catch(err => {
  console.error('Recording error:', err)
  process.exit(1)
})
