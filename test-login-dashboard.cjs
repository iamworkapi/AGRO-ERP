const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') console.log('[ERROR]', text);
    else if (text.includes('Dashboard') || text.includes('login') || text.includes('Redirect') || text.includes('Auth'))
      console.log('[CONSOLE]', text);
  });
  page.on('pageerror', err => console.log('[PAGEERROR]', err.message));

  const apiResponses = [];
  page.on('response', async (resp) => {
    if (resp.url().includes('/api/')) {
      try {
        const body = await resp.text();
        apiResponses.push({ status: resp.status(), url: resp.url().replace('http://localhost:5174', ''), body: body.substring(0, 150) });
      } catch(e) {}
    }
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  console.log('Login loaded, filling form...');
  await page.fill('input[type="text"]', 'iamworkapi@gmail.com');
  await page.fill('input[type="password"]', 'admin12');

  console.log('Clicking submit...');
  // Don't wait for anything, just click
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });
  console.log('Submit executed via evaluate');

  // Wait and poll
  for (let i = 0; i < 35; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText).catch(() => 'ERR');
    const textLen = text.length;

    if (textLen !== 0 || i === 0 || i % 5 === 0) {
      console.log(`t=${i+1}s url=${url.substring(0, 50)} textLen=${textLen}`);
    }

    if (textLen > 200 && !text.includes('Sign In')) {
      console.log('\nDASHBOARD LOADED at t=' + (i+1) + 's!');
      console.log('Text:', text.substring(0, 200));
      await page.screenshot({ path: 'D:/ORISH/AGRO-ERP/Project/dash-success.png', fullPage: true });
      console.log('\nAPI Calls:', JSON.stringify(apiResponses, null, 2));
      await browser.close();
      process.exit(0);
    }
  }

  console.log('\n=== FAILED ===');
  const finalText = await page.evaluate(() => document.body.innerText).catch(() => 'ERR');
  console.log('Final URL:', page.url());
  console.log('Final text:', finalText.substring(0, 300));
  console.log('\nAPI Calls:', JSON.stringify(apiResponses, null, 2));
  await page.screenshot({ path: 'D:/ORISH/AGRO-ERP/Project/dash-failed.png', fullPage: true });
  await browser.close();
  process.exit(1);
})();
