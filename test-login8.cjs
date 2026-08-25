const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
    else if (msg.text().includes('Invalid') || msg.text().includes('login') || msg.text().includes('credential')) 
      console.log('CONSOLE:', msg.text());
  });
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  // Track ALL network responses (no filter)
  const allApiResponses = [];
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('localhost:3000') || url.includes('/api/')) {
      let body = '';
      try { body = await response.text(); } catch(e) {}
      allApiResponses.push({ url, status: response.status(), body: body.substring(0, 300) });
      console.log(`HTTP ${response.status()}: ${url.split('/').pop()}`);
      if (response.status() >= 400) console.log('  BODY:', body.substring(0, 200));
    }
  });
  
  // Track request failures
  page.on('requestfailed', req => {
    console.log('REQ FAILED:', req.url(), req.failure()?.errorText);
  });
  
  console.log('Navigating...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout;
  
  console.log('\n--- Bootstrapped, now logging in ---');
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;
  
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');
  
  // Click submit and wait
  await page.click('button[type="submit"]');
  await page.waitForTimeout;
  
  console.log('\nAll API responses:', allApiResponses);
  console.log('URL after submit:', page.url());
  
  // Get any visible error text
  const errorTexts = await page.$$eval('*', els => 
    els.filter(e => e.textContent?.includes('Invalid') || e.textContent?.includes('error') || e.textContent?.includes('wrong'))
      .map(e => e.textContent?.trim().substring(0, 100))
  ).then(arr => [...new Set(arr)]);
  console.log('Error text in page:', errorTexts.length ? errorTexts : 'none');
  
  await browser.close();
})();
