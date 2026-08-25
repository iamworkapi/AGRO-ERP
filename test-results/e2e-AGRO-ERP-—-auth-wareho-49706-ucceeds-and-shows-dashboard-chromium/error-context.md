# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.js >> AGRO ERP — auth + warehouse only >> super_admin login succeeds and shows dashboard
- Location: tests\e2e.spec.js:17:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="identifier"]')

```

# Page snapshot

```yaml
- main [ref=e3]:
  - paragraph [ref=e4]:
    - generic [ref=e5]:
      - strong [ref=e6]: "404"
      - text: ": NOT_FOUND"
    - generic [ref=e7]:
      - text: "Code:"
      - code [ref=e8]: "`NOT_FOUND`"
    - generic [ref=e9]:
      - text: "ID:"
      - code [ref=e10]: "`bom1::24rmp-1787585686704-77d9f1b26342`"
  - link "Read our documentation to learn more about this error." [ref=e11] [cursor=pointer]:
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
  11 |     await expect(page.locator("text=Welcome Back")).toBeVisible({ timeout: 20000 });
  12 |     await expect(page.locator("text=Select Login Role")).toBeVisible();
  13 |     await expect(page.locator('input[name="identifier"]')).toBeVisible();
  14 |     await expect(page.locator('input[name="password"]')).toBeVisible();
  15 |   });
  16 | 
  17 |   test("super_admin login succeeds and shows dashboard", async ({ page }) => {
> 18 |     await page.fill('input[name="identifier"]', "iamworkapi@gmail.com");
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
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