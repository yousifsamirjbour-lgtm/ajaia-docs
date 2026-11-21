import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const PORT = 8000
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'deliverables/assets/test-reports', open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on',
    screenshot: 'on',
    video: 'off',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.BASE_URL ? undefined : {
    command: '.venv\\Scripts\\python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000',
    url: 'http://127.0.0.1:8000/api/health',
    reuseExistingServer: true,
    timeout: 30000,
    env: {
      DATABASE_URL: 'sqlite+aiosqlite:///./backend/e2e_fresh_test.db',
      ALLOWED_ORIGINS: '*'
    }
  }
})
