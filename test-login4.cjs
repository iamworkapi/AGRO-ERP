const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  console.log('Navigating...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout;
  
  // Get all input fields
  const inputs = await page.$$eval('input', els => els.map(e => ({
    name: e.name,
    type: e.type,
    placeholder: e.placeholder,
    id: e.id,
    className: e.className
  })));
  console.log('All inputs found:', inputs.length);
  inputs.forEach(i => console.log(JSON.stringify(i)));
  
  // Get all buttons
  const buttons = await page.$$eval('button', els => els.map(e => ({
    text: e.textContent?.trim().substring(0, 60),
    type: e.type,
    disabled: e.disabled
  })));
  console.log('\nAll buttons:', buttons);
  
  // Get the full body HTML
  const html = await page.innerHTML('body');
  console.log('\nBody HTML (first 2000):', html.substring(0, 2000));
  
  await browser.close();
})();
