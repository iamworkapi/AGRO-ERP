const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('pageerror', err => console.log('[PAGEERROR] ' + err.message));

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Login page loaded');

  // Screenshot initial state
  await page.screenshot({ path: 'D:/ORISH/AGRO-ERP/Project/step1-initial.png', fullPage: true });

  // Wait a bit for React hydration
  await new Promise(r => setTimeout(r, 2000));
  console.log('Waited 2s for hydration');

  // Check what buttons exist
  const buttons = await page.$$eval('button', btns => btns.map(b => b.textContent.trim().substring(0, 40)));
  console.log('Buttons on page:', JSON.stringify(buttons));

  // Check if Super Admin button exists
  const superAdminBtn = await page.$('button:has-text("Super Admin")');
  console.log('Super Admin button found:', !!superAdminBtn);

  if (superAdminBtn) {
    await superAdminBtn.click();
    await new Promise(r => setTimeout(r, 500));
    console.log('Clicked Super Admin');
  }

  // Check input fields
  const inputs = await page.$$eval('input', inputs => inputs.map(i => ({ type: i.type, placeholder: i.placeholder, value: i.value })));
  console.log('Inputs found:', JSON.stringify(inputs));

  await page.screenshot({ path: 'D:/ORISH/AGRO-ERP/Project/step2-after-role.png', fullPage: true });

  // Try filling the form
  const idField = await page.$('input[placeholder="Phone or Email Address"]');
  const pwField = await page.$('input[placeholder="Password"]');
  console.log('ID field found:', !!idField, 'PW field found:', !!pwField);

  if (idField) {
    await idField.fill('iamworkapi@gmail.com');
    console.log('Filled identifier');
  }
  if (pwField) {
    await pwField.fill('admin12');
    console.log('Filled password');
  }

  await page.screenshot({ path: 'D:/ORISH/AGRO-ERP/Project/step3-filled.png', fullPage: true });

  // Submit
  await page.click('button[type="submit"]');
  console.log('Submitted');

  // Poll for dashboard
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const currentUrl = page.url();
    const bodyLen = await page.evaluate(() => document.body.innerText.length).catch(() => 0);
    console.log('Poll ' + (i+1) + 's: url=' + currentUrl + ' bodyLen=' + bodyLen);
    if (currentUrl.includes('dashboard') && bodyLen > 200) {
      console.log('Dashboard loaded!');
      break;
    }
  }

  try {
    await page.screenshot({ path: 'D:/ORISH/AGRO-ERP/Project/dashboard-screenshot.png', fullPage: true, timeout: 30000 });
    console.log('Dashboard screenshot saved!');
  } catch(e) {
    console.log('Screenshot failed:', e.message);
  }

  await browser.close();
})();
