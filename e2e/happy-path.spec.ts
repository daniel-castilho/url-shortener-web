import { expect, test, type Page } from "@playwright/test";

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

const ORIGINAL_URL = `https://example.com/?e2e=${Date.now()}`;

async function authenticate(page: Page): Promise<void> {
  if (E2E_EMAIL && E2E_PASSWORD) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(E2E_EMAIL);
    await page.getByLabel("Password").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Login" }).click();
  } else {
    await page.goto("/register");
    await page.getByLabel("Name").fill("E2E User");
    await page.getByLabel("Email").fill(`e2e-${Date.now()}@example.com`);
    await page.getByLabel("Password").fill("supersecret123");
    await page.getByRole("button", { name: "Register" }).click();
  }
  await expect(page).toHaveURL(/\/links$/);
}

test("happy path: authenticate → shorten → list → detail → archive", async ({ page }) => {
  await authenticate(page);

  await page.goto("/");
  await page.getByLabel("URL").fill(ORIGINAL_URL);
  await page.getByRole("button", { name: "Shorten" }).click();
  await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();

  await page.getByRole("link", { name: "Links" }).click();
  const row = page.locator("li").filter({ hasText: ORIGINAL_URL });
  await expect(row).toBeVisible();
  await row.getByRole("link").click();

  const heading = page.locator("h1, [class*='text-xl']");
  await expect(heading.first()).toBeVisible();

  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Archive" }).click();
  await expect(page.getByText("Archived.")).toBeVisible();
});
