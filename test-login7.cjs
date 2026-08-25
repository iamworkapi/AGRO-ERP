const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
    if (msg.text().includes('Error') || msg.text().includes('error')) console.log('CONSOLE:', msg.type(), msg.text().substring(0, 200));
  });
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  // Monitor all network requests
  page.on('request', req => {
    if (req.url().includes('/api/')) {
      console.log('REQ:', req.method(), req.url().split('/').slice(-2).join('/'));
    }
  });
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      console.log(`RESP ${response.status()}: ${response.url().split('/').slice(-2).join('/')}`);
    }
  });
  
  console.log('Navigating...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout;
  
  // Check React component state via form value
  const formState = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    return Array.from(inputs).map(i => ({
      type: i.type,
      value: i.value.substring(0, 50),
      disabled: i.disabled
    }));
  });
  console.log('\nForm inputs:', formState);
  
  // Now test the login button click specifically
  console.log('\nClicking submit button...');
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForTimeout;
    console.log('URL after click:', page.url());
    
    // Get all network calls after click
    const bodyText = await page.textContent('body');
    console.log('Body (first 300):', bodyText?.substring(0, 300));
  }
  
  // Also try triggering form submission programmatically
  console.log('\n--- Testing form submit programmatically ---');
  const result = await page.evaluate(() => {
    // Simulate what validateOrToast does
    const identifier = document.querySelector('input[placeholder="Phone or Email Address"]')?.value;
    const password = document.querySelector('input[placeholder="Password"]')?.value;
    return { identifier, password };
  });
  console.log('Field values:', result);
  
  await browser.close();
})();
