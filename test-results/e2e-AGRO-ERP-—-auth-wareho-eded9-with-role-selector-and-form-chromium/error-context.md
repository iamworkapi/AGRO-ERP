# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.js >> AGRO ERP — auth + warehouse only >> login page loads with role selector and form
- Location: tests\e2e.spec.js:10:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Welcome Back')
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for locator('text=Welcome Back')

```

```yaml
- main:
  - paragraph:
    - strong: "404"
    - text: ": NOT_FOUND Code:"
    - code: "`NOT_FOUND`"
    - text: "ID:"
    - code: "`bom1::bmnm2-1787585665130-7f9f695b641d`"
  - link "Read our documentation to learn more about this error.":
    - /url: https://vercel.com/docs/errors/NOT_FOUND
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | const BASE = "https://agro-r32mh84z3-orrish.vercel.app";
  4  | 
  5  | test.describe("AGRO ERP — auth + warehouse only", () => {
  6  |   test.beforeEach(async ({ page }) => {
  7  |     await page.goto(BASE + "/login");
  8  |   });
  9  | 
  10 |   test("login page loads with role selector and form", async ({ page }) => {
> 11 |     await expect(page.locator("text=Welcome Back")).toBeVisible({ timeout: 20000 });
     |                                                     ^ Error: expect(locator).toBeVisible() failed
  12 |     await expect(page.locator("text=Select Login Role")).toBeVisible();
  13 |     await expect(page.locator('input[name="identifier"]')).toBeVisible();
  14 |     await expect(page.locator('input[name="password"]')).toBeVisible();
  15 |   });
  16 | 
  17 |   test("super_admin login succeeds and shows dashboard", async ({ page }) => {
  18 |     await page.fill('input[name="identifier"]', "iamworkapi@gmail.com");
  19 |     await page.fill('input[name="password"]', "admin12");
  20 |     await page.click('button[type="submit"]');
  21 | 
  22 |     await expect(page).toHaveURL(BASE + "/", { timeout: 20000 });
  23 |     await expect(page.locator("text=Organisation Overview, text=Dashboard").first()).toBeVisible({ timeout: 10000 });
  24 |   });
  25 | 
  26 |   test("sidebar only has Dashboard + Warehouse links", async ({ page }) => {
  27 |     await page.fill('input[name="identifier"]', "iamworkapi@gmail.com");
  28 |     await page.fill('input[name="password"]', "admin12");
  29 |     await page.click('button[type="submit"]');
  30 |     await expect(page).toHaveURL(BASE + "/", { timeout: 20000 });
  31 | 
  32 |     await page.waitForTimeout;
  33 | 
  34 |     const sidebar = page.locator("aside, nav");
  35 |     const text = await sidebar.textContent();
  36 | 
  37 |     // Must have warehouse and dashboard
  38 |     expect(text.toLowerCase()).toMatch(/warehouse|dashboard/);
  39 | 
  40 |     // Must NOT have removed modules
  41 |     const forbidden = ["biomass", "weighment", "employee", "attendance", "inventory", "purchase", "sales", "alert", "setting"];
  42 |     for (const f of forbidden) {
  43 |       expect(text.toLowerCase()).not.toContain(f);
  44 |     }
  45 |   });
  46 | });
  47 | 
```