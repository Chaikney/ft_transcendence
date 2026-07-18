import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test('Seguridad: Bloqueo de intrusos en rutas protegidas', async ({ page }) => {
  await test.step('Intentar colarse en rutas privadas', async () => {
    await page.goto('https://localhost:8443/chat');
    
    // Verificamos que el botón de login general sigue ahí, ergo, estamos fuera.
    const botonLogin = page.locator('button:has-text("> login")').first();
    await expect(botonLogin).toBeVisible();
  });
});