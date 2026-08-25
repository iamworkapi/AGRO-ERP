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
  
  page.on('response', async response => {
    if (response.status() >= 400) {
      const url = response.url();
      console.log('HTTP ERROR:', response.status(), url);
      errors.push(`HTTP ${response.status()}: ${url}`);
    }
  });
  
  // Navigate to login
  console.log('Navigating to http://localhost:5174/login');
  await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  // Wait a bit for bootstrap
  await page.waitForTimeout;
  
  console.log('\nPage title:', await page.title());
  console.log('Errors found:', errors.length);
  errors.forEach(e => console.log(' -', e));
  
  // Check what's visible
  const bodyText = await page.textContent('body');
  console.log('Body text:', bodyText?.substring(0, 800));
  
  await browser.close();
  process.exit(0);
})();
