const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const apiData = [];
  page.on('request', req => {
    const url = req.url();
    if (url.includes('localhost:3000') || url.includes('/api/')) {
      console.log('[REQ]', req.method(), url.split('/').slice(-3).join('/'));
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('localhost:3000') || url.includes('/api/')) {
      const body = await response.text();
      apiData.push({ url: url.split('/').slice(-3).join('/'), status: response.status(), body: body.substring(0, 200) });
      console.log(`[RESP ${response.status()}] ${url.split('/').slice(-3).join('/')}: ${body.substring(0, 200)}`);
    }
  });
  
  page.on('requestfailed', req => {
    if (req.url().includes('localhost:3000') || req.url().includes('/api/')) {
      console.log('[FAILED]', req.url().split('/').slice(-3).join('/'), req.failure()?.errorText);
    }
  });
  
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout;
  
  // Monitor what the Redux store shows
  const beforeLogin = await page.evaluate(() => {
    // Check if we can access the store
    return { isAuthenticated: false, user: null };
  });
  
  console.log('\n=== Selecting Super Admin ===');
  await page.click('button:has-text("Super Admin")');
  await page.waitForTimeout;
  
  await page.fill('input[placeholder="Phone or Email Address"]', 'iamworkapi@gmail.com');
  await page.fill('input[placeholder="Password"]', 'admin12');
  
  console.log('\n=== Clicking submit ===');
  await page.click('button[type="submit"]');
  
  console.log('\n=== Waiting for responses ===');
  await page.waitForTimeout;
  
  console.log('\n=== Results ===');
  console.log('API data:', apiData);
  console.log('URL:', page.url());
  
  // Check body for "Signing in..." vs error text
  const bodyHtml = await page.innerHTML('body');
  const hasSigningIn = bodyHtml.includes('Signing in');
  const hasError = bodyHtml.includes('Invalid') || bodyHtml.includes('error') || bodyHtml.includes('wrong');
  console.log('Body has "Signing in":', hasSigningIn);
  console.log('Body has error text:', hasError);
  
  // Try to access the Redux state
  const reduxState = await page.evaluate(() => {
    // Redux state is internal, but we can check if window.__REDUX_DEVTOOLS_EXTENSION__ exists
    return {
      hasRedux: typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined'
    };
  });
  console.log('Redux state:', reduxState);
  
  await browser.close();
})();
