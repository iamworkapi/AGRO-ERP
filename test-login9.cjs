const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
    else if (msg.type() === 'warning') console.log('CONSOLE WARN:', msg.text());
  });
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  // Track ALL requests with detailed info
  page.on('request', async req => {
    const url = req.url();
    if (url.includes('localhost:3000') || url.includes('/api/')) {
      console.log(`>> REQ: ${req.method()} ${url.split('/').slice(-2).join('/')}`);
    }
  });
  
  const seenUrls = new Set();
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('localhost:3000') || url.includes('/api/')) {
      seenUrls.add(url);
      const status = response.status();
      let body = '';
      try { body = await response.text(); } catch(e) {}
      console.log(`<< RESP ${status}: ${url.split('/').slice(-2).join('/')}  body: ${body.substring(0, 150)}`);
      if (status >= 400) console.log('   ERROR BODY:', body.substring(0, 300));
    }
  });
  
  page.on('requestfailed', req => {
    if (req.url().includes('localhost:3000')) {
      console.log('!! REQ FAILED:', req.url(), req.failure()?.errorText);
    }
  });
  
  console.log('=== Navigating to login page ===');
  await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  // Wait for React to render fully
  await page.waitForTimeout;
  
  console.log('\n=== Current URL:', page.url());
  
  // Check localStorage (this should work since we're on localhost)
  const storageResult = await page.evaluate(() => {
    try {
      return {
        token: localStorage.getItem('agro_auth_token'),
        allKeys: Object.keys(localStorage)
      };
    } catch(e) { return { error: e.message }; }
  });
  console.log('Storage:', storageResult);
  
  // Select Super Admin role
  console.log('\n=== Clicking Super Admin role ===');
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;
  
  // Fill form
  console.log('=== Filling form ===');
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');
  
  // Submit
  console.log('=== Clicking submit ===');
  await page.click('button[type="submit"]');
  await page.waitForTimeout;
  
  console.log('\n=== After submit ===');
  console.log('URL:', page.url());
  
  // Check for toasts
  const toastTexts = await page.$$eval('.p-toast-message .p-toast-message-content', 
    els => els.map(e => e.textContent?.trim().substring(0, 200)));
  console.log('Toasts:', toastTexts.length ? toastTexts : 'none');
  
  // Check page for error text
  const bodyText = await page.textContent('body');
  console.log('Body text (last 300):', bodyText?.substring(bodyText.length - 300));
  
  await browser.close();
})();
