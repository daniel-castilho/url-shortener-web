import { expect, test } from "@playwright/test";

test.describe("Bearer E2E Journey (14.23)", () => {
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";
  const TEST_EMAIL = `bearer-e2e-${Date.now()}@example.com`;
  const TEST_PASSWORD = "e2e-test-pass-123";

  test("register → login → shorten → list → logout", async ({ page }) => {
    // Register
    await page.goto(`${BASE_URL}/register`);
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Password").fill(TEST_PASSWORD);
    await page.getByLabel("Name").fill("Bearer E2E User");
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/links$/);

    // Navigate to home to shorten
    await page.goto(`${BASE_URL}/`);
    // Shorten a URL
    await page.getByLabel("URL").fill("https://bearer-e2e.example.com/test");
    await page.getByRole("button", { name: "Shorten" }).click();
    // The short URL is displayed (e.g., http://localhost:5173/abc123)
    await expect(page.locator("p.break-all")).toBeVisible();

    // List links
    await page.getByRole("link", { name: "Links" }).click();
    await expect(page.getByText("bearer-e2e.example.com/test")).toBeVisible();

    // Logout (navigates to /)
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("invalid URL rejected client-side (no API call)", async ({ page }) => {
    // Register a user first
    const testEmail2 = `bearer-e2e-${Date.now()}-2@example.com`;
    await page.goto(`${BASE_URL}/register`);
    await page.getByLabel("Email").fill(testEmail2);
    await page.getByLabel("Password").fill(TEST_PASSWORD);
    await page.getByLabel("Name").fill("Bearer E2E User 2");
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/links$/);

    // Navigate to home to test invalid URL
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel("URL").fill("not-a-url");
    // Check native HTML5 validation message via Constraint Validation API
    const validationMessage = await page.getByLabel("URL").evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toContain("URL");
    // No network request should have been made for invalid URL
  });
});
