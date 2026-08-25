const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const apiCalls = [];
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/api/')) {
      try {
        const body = await resp.text();
        apiCalls.push({ status: resp.status(), url, body: body.substring(0, 200) });
      } catch(e) {}
    }
  });

  page.on('console', msg => {
    const t = msg.type();
    const text = msg.text();
    if (t === 'error') console.log('[ERROR]', text);
  });
  page.on('pageerror', err => console.log('[PAGEERROR]', err.message));

  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Submitting login...');
  await page.click('button[type="submit"]');

  let lastTextLen = 0;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText).catch(() => 'ERR');
    const textLen = text.length;

    if (textLen !== lastTextLen) {
      console.log(`t=${i+1}s url=${url} textLen=${textLen}`);
      if (textLen > 50) console.log('  text:', JSON.stringify(text.substring(0, 150)));
      lastTextLen = textLen;
    }

    if (textLen > 200 && !text.includes('Sign In')) {
      console.log('DASHBOARD LOADED');
      break;
    }
  }

  console.log('\n--- API Calls ---');
  apiCalls.forEach(c => console.log(`[${c.status}] ${c.url}`, c.body));

  console.log('\nFinal text:', (await page.evaluate(() => document.body.innerText).catch(() => 'ERR')).substring(0, 300));
  await page.screenshot({ path: 'D:/ORISH/AGRO-ERP/Project/dash-login-test.png', fullPage: true });

  await browser.close();
})();
