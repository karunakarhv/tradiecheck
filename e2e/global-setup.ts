import { chromium, type FullConfig } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'
import { LoginPageLocators } from './locators/LoginPageLocators'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default async function globalSetup(config: FullConfig) {
  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD

  const authDir = path.join(__dirname, '.auth')
  const authFile = path.join(authDir, 'user.json')

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  if (!email || !password) {
    console.warn(
      '\n[global-setup] TEST_EMAIL / TEST_PASSWORD not set — writing empty auth state.' +
      '\n  Authenticated tests will fail. Add these to .env (local) or TEST_EMAIL/TEST_PASSWORD GitHub secrets (CI).\n'
    )
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }))
    return
  }

  const baseURL = config.projects[0].use.baseURL ?? 'http://localhost:5173'
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    await page.goto(`${baseURL}/login`)
    await page.locator(LoginPageLocators.emailInput).fill(email)
    await page.locator(LoginPageLocators.passwordInput).fill(password)
    await page.locator(LoginPageLocators.submitButton).click()
    await page.waitForURL(/.*welcome.*/, { timeout: 20000 })
    await page.context().storageState({ path: authFile })
    console.log('[global-setup] Auth state saved to e2e/.auth/user.json')
  } finally {
    await browser.close()
  }
}
