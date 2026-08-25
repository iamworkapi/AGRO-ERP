const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Monitor ALL console messages (very verbose)
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Error') || text.includes('error') || text.includes('auth') || text.includes('login') || text.includes('token') || text.includes('Navigate')) {
      console.log(`[${msg.type().toUpperCase()}]`, text.substring(0, 200));
    }
  });
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  // Monitor specific API requests
  const apiCalls = [];
  page.on('request', async req => {
    if (req.url().includes('/api/v1/')) {
      const postData = req.postData();
      apiCalls.push({ url: req.url(), method: req.method(), postData: postData?.substring(0, 100) });
      console.log('API REQ:', req.method(), req.url().split('/').slice(-2).join('/'), postData?.substring(0, 50));
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/v1/')) {
      const status = response.status();
      let body = '';
      try { body = await response.text(); } catch(e) {}
      console.log(`API RESP ${status}: ${url.split('/').slice(-2).join('/')}  body: ${body.substring(0, 200)}`);
      if (status >= 400) console.log('   ERROR:', body.substring(0, 300));
    }
  });
  
  console.log('=== Navigating to login ===');
  await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout;
  
  console.log('\n=== URL:', page.url(), '===');
  
  // Select Super Admin
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;
  
  // Fill form
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');
  
  console.log('\n=== Submitting form ===');
  await page.click('button[type="submit"]');
  
  // Wait longer and check for results
  await page.waitForTimeout;
  
  console.log('\n=== After submit ===');
  console.log('URL:', page.url());
  console.log('API calls:', apiCalls.length, apiCalls);
  
  // Check for errors
  const toastMessages = await page.$$eval('[class*="toast"]', els => els.map(e => e.textContent?.trim().substring(0, 200)));
  console.log('Toast messages:', toastMessages.length ? toastMessages : 'none');
  
  await browser.close();
})();
