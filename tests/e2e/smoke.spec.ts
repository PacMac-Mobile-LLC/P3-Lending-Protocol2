import { test, expect } from '@playwright/test';

test('landing page renders core beta messaging', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Early Access Beta')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Get Early Access' })).toBeVisible();
});
