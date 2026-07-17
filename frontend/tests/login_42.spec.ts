import { test, expect } from '@playwright/test';

test.use({
  ignoreHTTPSErrors: true
});

test('Login con 42 y acceso al perfil', async ({ page }) => {
  // 1. Navegación inicial
  await page.goto('https://localhost:8443/');
  
  await page.getByRole('button', { name: '> login' }).click();
  await page.getByRole('button', { name: 'authenticate_with_42' }).click();
  
  await page.getByRole('textbox', { name: 'Login or email' }).fill('nkrasimi');
  await page.getByRole('textbox', { name: 'Password' }).fill('CONTRASEÑA');
  await page.getByRole('button', { name: 'Sign In' }).click();


  await expect(page.locator('div').filter({ hasText: /^nkrasimi$/ })).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Profile EDIT' }).click();
  
  await expect(page.locator('div').filter({ hasText: '// user_profile.tsprofile —' }).nth(5)).toBeVisible();
});
