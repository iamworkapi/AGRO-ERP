const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  
  console.log('Navigating...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout;
  
  // Get toast messages
  const toasts = await page.$$eval('.p-toast-message', els => els.map(e => ({
    text: e.textContent?.trim(),
    severity: e.getAttribute('data-pc-name')
  })));
  console.log('Toast messages:', toasts);
  
  // Get role buttons
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;
  
  // Fill form using placeholder selectors
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');
  await page.click('button[type="submit"]');
  
  // Wait for navigation or errors
  await page.waitForTimeout;
  
  console.log('URL after submit:', page.url());
  console.log('Errors:', errors);
  
  // Check for toast messages after login attempt
  const postToasts = await page.$$eval('.p-toast-message', els => els.map(e => e.textContent?.trim().substring(0, 200)));
  console.log('Post-login toasts:', postToasts);
  
  // Get body text to see what's displayed
  const bodyText = await page.textContent('body');
  console.log('Body text (first 500):', bodyText?.substring(0, 500));
  
  await browser.close();
})();
