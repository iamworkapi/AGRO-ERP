const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const apiResponses = [];
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('localhost:3000') || (url.includes('/api/v1/') && !url.includes('5174'))) {
      let body = '';
      try { body = await response.text(); } catch(e) {}
      apiResponses.push({ url: url.split('/').pop(), status: response.status(), body: body.substring(0, 200) });
      console.log(`<< ${response.status()}: ${url.split('/').slice(-2).join('/')}  ${body.substring(0, 80)}`);
    }
  });
  
  page.on('requestfailed', req => {
    if (req.url().includes('localhost:3000')) {
      console.log('!! FAILED:', req.url().split('/').pop(), req.failure()?.errorText);
    }
  });
  
  await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout;
  
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;
  
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');
  await page.click('button[type="submit"]');
  await page.waitForTimeout;
  
  console.log('\nAll API responses:', apiResponses);
  console.log('URL:', page.url());
  
  await browser.close();
})();
