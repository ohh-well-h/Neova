import { expect, test, type Page } from '@playwright/test';

const DEMO_SESSION_KEY = '@neova/demo-session/v1';
const PENDING_KEY = '@neova/safety-pending/v1/demo-user-maya';
const CRISIS_URL = /\/crisis-resources\?required=1$/;

async function seedPendingDemo(page: Page) {
  await page.addInitScript(
    ({ demoSessionKey, pendingKey }) => {
      window.localStorage.setItem(demoSessionKey, '1');
      window.localStorage.setItem(pendingKey, '1');
    },
    { demoSessionKey: DEMO_SESSION_KEY, pendingKey: PENDING_KEY },
  );
}

async function openBlockedRoute(page: Page, route = '/profile') {
  await page.goto(route);
  await expect(page).toHaveURL(CRISIS_URL);
  await expect(page.getByText('Support resources')).toBeVisible();
  await expect(page.getByText('I have seen these resources')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await seedPendingDemo(page);
});

test('Escape cannot dismiss a pending crisis acknowledgment', async ({ page }) => {
  await openBlockedRoute(page);
  await page.keyboard.press('Escape');

  await expect(page).toHaveURL(CRISIS_URL);
  await expect(page.getByText('I have seen these resources')).toBeVisible();
});

test('an outside pointer interaction cannot dismiss the resources screen', async ({ page }) => {
  await openBlockedRoute(page);
  const canceled = await page.evaluate(() =>
    !document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })),
  );

  expect(canceled).toBe(true);
  await expect(page).toHaveURL(CRISIS_URL);
  await expect(page.getByText('I have seen these resources')).toBeVisible();
});

test('browser back and forward cannot leave the required resources route', async ({ page }) => {
  await openBlockedRoute(page);
  await page.evaluate(() => window.history.back());

  await expect(page).toHaveURL(CRISIS_URL);
  await expect(page.getByText('I have seen these resources')).toBeVisible();

  await page.evaluate(() => window.history.forward());
  await expect(page).toHaveURL(CRISIS_URL);
  await expect(page.getByText('I have seen these resources')).toBeVisible();
});

test('offline reload restores demo pending state and lands on crisis resources', async ({ context, page }) => {
  await openBlockedRoute(page, '/an-unlisted-route');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
      });
    }
  });
  const offlineShellReady = await page.evaluate(async () => ({
    cacheNames: await caches.keys(),
    hasIndex: Boolean(await caches.match('/index.html')),
    hasRoot: Boolean(await caches.match('/')),
    controlled: Boolean(navigator.serviceWorker.controller),
  }));
  expect(offlineShellReady).toEqual(expect.objectContaining({ controlled: true, hasIndex: true, hasRoot: true }));
  await context.setOffline(true);
  try {
    await page.reload();

    await expect(page).toHaveURL(CRISIS_URL);
    await expect(page.getByText('I have seen these resources')).toBeVisible();
    await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), PENDING_KEY)).toBe('1');
  } finally {
    await context.setOffline(false);
  }
});

test('a failed acknowledgment save keeps pending state and the resources screen', async ({ page }) => {
  await page.addInitScript((pendingKey) => {
    const originalRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function removeItem(key: string) {
      if (key === pendingKey) throw new Error('Simulated local persistence failure');
      return originalRemoveItem.call(this, key);
    };
  }, PENDING_KEY);
  await openBlockedRoute(page);

  let dialogMessage = '';
  page.once('dialog', async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.dismiss();
  });
  await page.getByText('I have seen these resources').click();
  expect(dialogMessage).toContain('Keep this screen open');

  await expect(page).toHaveURL(CRISIS_URL);
  await expect(page.getByText('I have seen these resources')).toBeVisible();
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), PENDING_KEY)).toBe('1');
});
