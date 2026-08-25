const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Log ALL responses - no filtering
  page.on('response', async response => {
    const status = response.status();
    const url = response.url();
    console.log(`<< RESP ${status}: ${url.split('/').slice(-3).join('/')}`);
  });
  
  page.on('requestfailed', req => console.log('!! FAILED:', req.url().split('/').slice(-3).join('/'), req.failure()?.errorText));
  
  console.log('Navigating...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout;
  
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;
  
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');
  
  console.log('\n=== Clicking submit ===');
  await page.click('button[type="submit"]');
  await page.waitForTimeout;
  
  await page.waitForTimeout;
  console.log('URL after waiting:', page.url());
  
  await browser.close();
})();
