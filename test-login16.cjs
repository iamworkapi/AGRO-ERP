const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Track ALL requests and responses with full URLs
  page.on('request', req => console.log('[REQ]', req.method(), req.url()));
  page.on('response', async response => {
    const url = response.url();
    console.log('[RESP]', response.status(), url);
  });
  page.on('requestfailed', req => console.log('[FAILED]', req.url(), req.failure()?.errorText));
  
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout;
  
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;
  
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');
  await page.click('button[type="submit"]');
  await page.waitForTimeout;
  
  await browser.close();
})();
