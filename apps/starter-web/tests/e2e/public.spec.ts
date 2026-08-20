import { test, expect } from "@playwright/test";
import { productConfig } from "../../product.config";

test("public shell and legal pages load", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: productConfig.description })).toBeVisible();
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: new RegExp(`${productConfig.name} privacy policy`, "i") })).toBeVisible();
  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: new RegExp(`${productConfig.name} terms of service`, "i") })).toBeVisible();
});

test("API health is available and private starter APIs reject anonymous users", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBeTruthy();
  expect((await health.json()).status).toBe("ok");

  for (const path of ["/api/files", "/api/account/export", "/api/admin/overview"]) {
    const response = await request.get(path);
    expect(response.status(), `${path} should reject anonymous access`).toBe(401);
  }

  const checkout = await request.post("/api/billing/checkout", { data: { plan: "pro-monthly" } });
  expect(checkout.status()).toBe(401);
});
