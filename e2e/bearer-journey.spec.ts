import { expect, test } from "@playwright/test";

test.describe("Bearer E2E Journey (14.23)", () => {
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";
  const TEST_EMAIL = `bearer-e2e-${Date.now()}@example.com`;
  const TEST_PASSWORD = "e2e-test-pass-123";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
  });

  test("register → login → shorten → list → logout", async ({ page }) => {
    // Register
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Password").fill(TEST_PASSWORD);
    await page.getByLabel("Name").fill("Bearer E2E User");
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/links$/);

    // Shorten a URL
    await page.getByLabel("Original URL").fill("https://bearer-e2e.example.com/test");
    await page.getByRole("button", { name: "Shorten" }).click();
    await expect(page.getByText(/https:\/\/.*\.example\.com\/test/)).toBeVisible();
    // const shortUrl = await page.getByRole("textbox", { name: /short url/i }).inputValue();

    // List links
    await page.getByRole("link", { name: "Links" }).click();
    await expect(page.getByText("bearer-e2e.example.com/test")).toBeVisible();

    // Logout
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("invalid URL rejected client-side (no API call)", async ({ page }) => {
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/links$/);

    await page.getByLabel("Original URL").fill("not-a-url");
    await page.getByRole("button", { name: "Shorten" }).click();
    await expect(page.getByText("Invalid URL")).toBeVisible();
    // No network request should have been made for invalid URL
  });
});
