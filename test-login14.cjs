const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Log everything
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[${msg.type()}]`, text.substring(0, 300));
  });
  
  page.on('pageerror', err => console.log('[PAGEERROR]', err.message));
  
  page.on('request', req => {
    console.log('[REQ]', req.method(), req.url().split('/').slice(-3).join('/'));
  });
  
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    const short = url.split('/').slice(-3).join('/');
    let body = '';
    try { body = await response.text(); } catch(e) {}
    if (body.length > 0) console.log(`[RESP ${status}] ${short}: ${body.substring(0, 200)}`);
    else console.log(`[RESP ${status}] ${short}: (empty)`);
  });
  
  page.on('requestfailed', req => {
    console.log('[FAILED]', req.url().split('/').slice(-3).join('/'), req.failure()?.errorText);
  });
  
  console.log('=== Navigating ===');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('\n=== Page loaded, current URL:', page.url(), '===');
  await page.waitForTimeout;
  
  console.log('\n=== Selecting Super Admin ===');
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;
  
  console.log('\n=== Filling form ===');
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');
  
  // Check form values
  const formValues = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    return Array.from(inputs).map(i => ({ type: i.type, value: i.value, name: i.name }));
  });
  console.log('Form values:', formValues);
  
  console.log('\n=== Clicking submit ===');
  const beforeClickUrl = page.url();
  await page.click('button[type="submit"]');
  
  console.log('\n=== Immediately after click ===');
  console.log('URL changed?', page.url() !== beforeClickUrl, page.url());
  
  // Wait a bit
  await page.waitForTimeout;
  console.log('URL after 3s:', page.url());
  
  // Check if any network request was made
  await page.waitForTimeout;
  console.log('URL after 6s:', page.url());
  
  // Check if there's an error toast
  const toastContent = await page.$eval('.p-toast-message-content', el => el.textContent).catch(() => null);
  console.log('Toast content:', toastContent);
  
  // Get body to see if "Signing in..." is visible
  const bodyText = await page.textContent('body');
  console.log('Body text (last 200):', bodyText?.substring(bodyText.length - 200));
  
  await browser.close();
})();
