const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Intercept ALL requests to see where /api/v1/auth/login goes
  page.on('request', req => {
    const url = req.url();
    if (url.includes('5174/api') || url.includes('3000/api') || url.includes('/api/v1')) {
      console.log('[REQ]', req.method(), url);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('5174/api') || url.includes('3000/api') || url.includes('/api/v1')) {
      const body = await response.text();
      console.log('[RESP ' + response.status() + '] ' + url + ': ' + body.substring(0, 200));
    }
  });

  page.on('requestfailed', req => {
    const url = req.url();
    if (url.includes('5174/api') || url.includes('3000/api')) {
      console.log('[FAILED]', url, req.failure() ? req.failure().errorText : '');
    }
  });

  console.log('Navigating to login page...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout;

  console.log('Selecting Super Admin role...');
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;

  console.log('Filling form...');
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');

  console.log('Clicking submit...');
  await page.click('button[type="submit"]');

  // Wait for ALL network activity to complete
  await page.waitForTimeout;

  console.log('\n=== FINAL URL: ' + page.url() + ' ===');

  await browser.close();
})();
