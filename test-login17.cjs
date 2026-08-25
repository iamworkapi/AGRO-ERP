const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Intercept and show what /api/v1/auth/login actually returns
  page.on('response', async response => {
    const url = response.url();
    // Look for any request to 5174/api or 3000/api
    if ((url.includes('5174/api') || url.includes('localhost:3000')) && !url.includes('5174/src/')) {
      const body = await response.text();
      console.log(`[${response.status()}] ${url}: ${body.substring(0, 300)}`);
    }
  });
  
  page.on('requestfailed', req => {
    const url = req.url();
    if (url.includes('api') || url.includes('login')) {
      console.log('[FAILED]', req.url(), req.failure()?.errorText);
    }
  });
  
  // Also intercept fetch/XHR
  page.on('request', req => {
    const url = req.url();
    if (url.includes('/api/') && !url.includes('5174/src/')) {
      console.log('[API REQ]', req.method(), url);
    }
  });
  
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout;
  
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;
  
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');
  await page.click('button[type="submit"]');
  
  // Wait longer - the API might take time
  await page.waitForTimeout;
  
  // Check if URL changed
  console.log('URL after submit:', page.url());
  
  // Check what the button text is (was it loading?)
  const btnText = await page.textContent('button[type="submit"]');
  console.log('Button text:', btnText?.trim().substring(0, 50));
  
  await browser.close();
})();
