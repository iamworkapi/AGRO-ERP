const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const allResponses = [];
  const allErrors = [];
  
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    if (url.includes('/auth/') || url.includes('/api/')) {
      allResponses.push({ url, status });
      if (status >= 400) console.log(`HTTP ${status}: ${url}`);
    }
  });
  
  page.on('pageerror', err => {
    allErrors.push(err.message);
    console.log('PAGE ERROR:', err.message);
  });
  
  console.log('Navigating to http://localhost:5174/login');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Check localStorage after page loads
  const token = await page.evaluate(() => localStorage.getItem('agro_auth_token'));
  console.log('Token in localStorage:', token ? 'EXISTS' : 'none');
  
  console.log('Page errors:', allErrors.length ? allErrors : 'none');
  console.log('/auth/ responses:', allResponses);
  
  // Try to login with test credentials (super_admin)
  try {
    await page.fill('input[name="identifier"]', 'iamworkapi@gmail.com');
    await page.fill('input[name="password"]', 'admin12');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout;
    
    console.log('\nAfter login URL:', page.url());
    
    const postResponses = [];
    page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      if (url.includes('/auth/') || url.includes('/api/')) {
        postResponses.push({ url, status });
        if (status >= 400) console.log(`POST-LOGIN HTTP ${status}: ${url}`);
      }
    });
    console.log('Post-login responses:', postResponses);
  } catch (e) {
    console.log('Login attempt error:', e.message);
  }
  
  await browser.close();
})();
