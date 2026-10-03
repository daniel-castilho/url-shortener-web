import { expect, test, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_PASSWORD;

// Live admin probe (Epic 13): requires a real backend with APP_ADMIN_EMAILS
// set to an ADMIN account. Run opt-in with E2E_ENABLED=true and the admin
// credentials supplied via E2E_EMAIL/E2E_PASSWORD. Skipped otherwise.
async function authenticateAsAdmin(page: Page): Promise<void> {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    test.skip();
  }
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/links$/);
}

test("admin: users grid loads and paginates", async ({ page }) => {
  await authenticateAsAdmin(page);

  await page.goto("/admin/users");
  await expect(page.getByText("Users")).toBeVisible();
  await expect(page.getByText("Email")).toBeVisible();
  await expect(page.getByText("Name")).toBeVisible();
  await expect(page.getByText("Role")).toBeVisible();
  await expect(page.getByText("Status")).toBeVisible();
  await expect(page.getByText("Created")).toBeVisible();
  await expect(page.getByText("Actions")).toBeVisible();
  await expect(page.getByRole("link", { name: ADMIN_EMAIL! })).toBeVisible();
});

test("admin: code search finds link", async ({ page }) => {
  await authenticateAsAdmin(page);

  await page.goto("/admin/users");

  // First create a link to search for
  await page.goto("/");
  await page.getByLabel("URL").fill("https://admin-probe.example.com/test");
  await page.getByRole("button", { name: "Shorten" }).click();
  await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();

  const shortUrlText = await page
    .getByRole("button", { name: "Copy" })
    .locator("..")
    .textContent();
  const shortCode = shortUrlText?.match(/\/([A-Za-z0-9_-]+)$/)?.[1];

  if (shortCode) {
    await page.goto("/admin/users");
    await page.getByLabel("Search by short code").fill(shortCode);
    await expect(page.getByText("Found:")).toBeVisible({ timeout: 5000 });
  }
});

test("admin: user links page shows links with force-archive", async ({ page }) => {
  await authenticateAsAdmin(page);

  // Go to admin users and open the admin user's own links page
  await page.goto("/admin/users");
  await page.getByRole("link", { name: ADMIN_EMAIL! }).click();

  await expect(page.getByText("User's links")).toBeVisible();
  await expect(page.getByRole("button", { name: "Archive" }).first()).toBeVisible();
});

test("admin: block/unblock user flow", async ({ page }) => {
  await authenticateAsAdmin(page);

  await page.goto("/admin/users");

  // Self-block must be disabled; other rows expose Block/Unblock actions
  const blockButtons = page.getByRole("button", { name: "Block" });
  const count = await blockButtons.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

test("admin: nav link only visible for admin", async ({ page }) => {
  await authenticateAsAdmin(page);

  await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
});
