const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const apiResponses = [];
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/')) {
      const status = response.status();
      let body = null;
      try { body = await response.json(); } catch(e) {}
      apiResponses.push({ url, status, body });
      console.log(`HTTP ${status}: ${url.split('/').slice(-2).join('/')}`, body ? JSON.stringify(body).substring(0, 200) : '');
    }
  });
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  console.log('Navigating...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout;
  
  console.log('\n--- Selecting Super Admin ---');
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;
  
  console.log('--- Filling form and submitting ---');
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');
  
  // Submit
  await page.click('button[type="submit"]');
  await page.waitForTimeout;
  
  console.log('\nURL after submit:', page.url());
  console.log('Total API responses during flow:', apiResponses.length);
  
  // Check for any errors
  const errorTexts = await page.$$eval('.p-toast-message', els => els.map(e => e.textContent?.trim()));
  console.log('Toast messages:', errorTexts.length ? errorTexts : 'none');
  
  // Get body text
  const bodyText = await page.textContent('body');
  console.log('Body text:', bodyText?.substring(0, 400));
  
  await browser.close();
})();
