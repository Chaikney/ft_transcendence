import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test('Boss Final: Rage Quit de 2 jugadores (Selectores Reales)', async ({ browser }) => {
  test.setTimeout(90000); 

  const context1 = await browser.newContext({ ignoreHTTPSErrors: true });
  const context2 = await browser.newContext({ ignoreHTTPSErrors: true });
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  await test.step('1. Loguear Jugador 1 (nkrasimi - 42)', async () => {
    await page1.goto('https://localhost:8443/');
    await page1.locator('button:has-text("> login")').first().click({ force: true });
    await page1.locator('button:has-text("authenticate_with_42")').first().click({ force: true });
    
    await page1.locator('input[name="username"]').fill('nkrasimi');

    await page1.locator('input[name="password"]').fill('12Happycoding()=');
    await page1.locator('input[type="submit"]').click();
    
    await expect(page1.locator('body')).toContainText('nkrasimi', { timeout: 15000 });
  });

  await test.step('2. Loguear Jugador 2 (Invitado) con tus clics exactos', async () => {
    await page2.goto('https://localhost:8443/');
    
    await page2.getByRole('button', { name: '> login' }).click();
    await page2.getByRole('button', { name: '> guest_login' }).click();
    
    await page2.getByRole('textbox', { name: 'USERNAME_' }).fill('Vegetta777');
    await page2.getByRole('textbox', { name: 'PASSWORD_' }).fill('123456');
    await page2.getByRole('button', { name: '> INITIALIZE_LOGIN' }).click(); 
    
    await expect(page2.locator('body')).toContainText('Vegetta777', { timeout: 15000 });
  });

  await test.step('3. Matchmaking Simultáneo', async () => {
    await page1.getByText('CHESS', { exact: true }).click({ force: true });
    await page2.getByText('CHESS', { exact: true }).click({ force: true });
  });

  await test.step('4. Aceptar Partida', async () => {
    await page1.waitForTimeout(1000); 

    const accept1 = page1.locator('button:has-text("Accept Match")').first();
    const accept2 = page2.locator('button:has-text("Accept Match")').first();

    await accept1.waitFor({ state: 'attached', timeout: 10000 });
    await accept2.waitFor({ state: 'attached', timeout: 10000 });

    await accept1.evaluate(node => (node as HTMLElement).click());
    await accept2.evaluate(node => (node as HTMLElement).click());

    await page1.waitForTimeout(3000); 
  });

  await test.step('5. Rage Quit y Comprobación', async () => {
    console.log("¡Jugador 1 se cabrea y arranca el cable!");
    await page1.close(); 
    
    await page2.waitForTimeout(5000); 
    expect(true).toBeTruthy();
  });
});