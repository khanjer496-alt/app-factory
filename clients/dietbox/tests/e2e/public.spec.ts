import { test, expect } from "@playwright/test";

test("landing, menu and builder render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/eat for the/i);
  await page.goto("/menu");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/cooked this/i);
  await page.goto("/start?program=keto");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/daily target|training for/i);
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: /Dietbox privacy policy/i })).toBeVisible();
});

test("Arabic renders right-to-left", async ({ page }) => {
  await page.goto("/?lang=ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("كُل من أجل");
  await page.getByRole("button", { name: "English" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("private APIs reject anonymous users", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBeTruthy();
  for (const path of ["/api/plan", "/api/orders", "/api/account/export", "/api/admin/overview", "/api/admin/kitchen"]) {
    const response = await request.get(path);
    expect(response.status(), `${path} should reject anonymous access`).toBe(401);
  }
  expect((await request.post("/api/orders", { data: { program: "balance" } })).status()).toBe(401);
  expect((await request.post("/api/plan/days/2030-01-01/skip", { data: {} })).status()).toBe(401);
});
