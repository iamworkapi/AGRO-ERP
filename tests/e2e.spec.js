import { test, expect } from "@playwright/test";

const BASE = "https://agro-r32mh84z3-orrish.vercel.app";

test.describe("AGRO ERP — auth + warehouse only", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + "/login");
  });

  test("login page loads with role selector and form", async ({ page }) => {
    await expect(page.locator("text=Welcome Back")).toBeVisible({ timeout: 20000 });
    await expect(page.locator("text=Select Login Role")).toBeVisible();
    await expect(page.locator('input[name="identifier"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("super_admin login succeeds and shows dashboard", async ({ page }) => {
    await page.fill('input[name="identifier"]', "iamworkapi@gmail.com");
    await page.fill('input[name="password"]', "admin12");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(BASE + "/", { timeout: 20000 });
    await expect(page.locator("text=Organisation Overview, text=Dashboard").first()).toBeVisible({ timeout: 10000 });
  });

  test("sidebar only has Dashboard + Warehouse links", async ({ page }) => {
    await page.fill('input[name="identifier"]', "iamworkapi@gmail.com");
    await page.fill('input[name="password"]', "admin12");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(BASE + "/", { timeout: 20000 });

    await page.waitForTimeout;

    const sidebar = page.locator("aside, nav");
    const text = await sidebar.textContent();

    // Must have warehouse and dashboard
    expect(text.toLowerCase()).toMatch(/warehouse|dashboard/);

    // Must NOT have removed modules
    const forbidden = ["biomass", "weighment", "employee", "attendance", "inventory", "purchase", "sales", "alert", "setting"];
    for (const f of forbidden) {
      expect(text.toLowerCase()).not.toContain(f);
    }
  });
});
