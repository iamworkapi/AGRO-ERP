const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console messages
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
    errors.push('PAGE ERROR: ' + err.message);
  });
  
  // Clear any stored tokens
  await context.clearCookies();
  
  // Navigate to login
  console.log('Navigating to http://localhost:5174/login');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait for page to settle
  await page.waitForTimeout;
  
  console.log('\nPage title:', await page.title());
  console.log('Errors found:', errors.length);
  
  // Check what's visible
  const bodyText = await page.textContent('body');
  console.log('Body text preview:', bodyText?.substring(0, 500));
  
  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
})();
