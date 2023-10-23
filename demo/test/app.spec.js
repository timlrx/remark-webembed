// @ts-check
import { test, expect } from '@playwright/test'

test('should work in a client env', async ({ page }) => {
  await page.goto('http://localhost:5173')
  const locator = page.locator('id=results')
  const wrapper = page.locator('#webembed-wrapper')
  const iframe = page.frameLocator('iframe').locator('#webembed-iframe')
  await expect(locator).toBeTruthy()
  await expect(wrapper).toBeTruthy()
  await expect(iframe).toBeTruthy()
})
