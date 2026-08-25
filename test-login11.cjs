const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // visible browser
  const page = await browser.newPage();
  
  // Log ALL console messages
  page.on('console', msg => {
    console.log(`[${msg.type().toUpperCase()}]`, msg.text().substring(0, 300));
  });
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  // Log ALL requests (no filter)
  page.on('request', req => {
    console.log('>> REQ:', req.method(), req.url().split('/').slice(-3).join('/'));
  });
  
  // Log ALL responses
  page.on('response', async response => {
    const status = response.status();
    const endUrl = response.url().split('/').slice(-3).join('/');
    let body = '';
    try { body = await response.text(); } catch(e) {}
    if (body.length > 0) console.log(`<< RESP ${status}: ${endUrl}  body: ${body.substring(0, 150)}`);
    else console.log(`<< RESP ${status}: ${endUrl} (no body)`);
  });
  
  page.on('requestfailed', req => {
    console.log('!! REQ FAILED:', req.url(), req.failure()?.errorText);
  });
  
  console.log('=== Navigating ===');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout;
  
  console.log('\n=== Current URL:', page.url(), '===');
  
  // Select role
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;
  
  // Fill form
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');
  
  // Submit
  console.log('\n=== Submitting ===');
  await page.click('button[type="submit"]');
  await page.waitForTimeout;
  
  console.log('\n=== After submit ===');
  console.log('URL:', page.url());
  
  await page.waitForTimeout;
  console.log('URL after 5s:', page.url());
  
  await browser.close();
})();
