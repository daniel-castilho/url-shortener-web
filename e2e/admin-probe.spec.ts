import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_PASSWORD;
const SEED_PASSWORD = "probe-pass-123";
const GRID_SEED_COUNT = 25;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5173";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

// Live admin probe (Epic 13): runs against a real backend with APP_ADMIN_EMAILS
// set to an ADMIN account. Opt-in via E2E_EMAIL/E2E_PASSWORD admin credentials;
// every test skips without them. Every assert is written to fail if the flow it
// names does not happen.
//
// The probe WRITES REAL DATA over the REST API and there is no delete-user
// endpoint to undo it. Run it only against an isolated, disposable dev stack —
// never a shared or production backend. It refuses non-local base URLs unless
// E2E_ALLOW_REMOTE is set (only for disposable remote environments).
// Seeded records are marked for cleanup by these prefixes (recipe in
// docs/testing.md):
//   users: probe-grid-*, probe-block-*, probe-nav-* (@example.com)
//   links: https://admin-probe.example.com/<ts>, https://force-archive.example.com/<ts>

function requireDisposableTarget(): void {
  const host = new URL(BASE_URL).hostname;
  if (!LOCAL_HOSTS.has(host) && !process.env.E2E_ALLOW_REMOTE) {
    throw new Error(
      `admin probe refused to run against ${BASE_URL}: it seeds real users and links ` +
        "with no API undo. Point PLAYWRIGHT_BASE_URL at a disposable dev stack, " +
        "or set E2E_ALLOW_REMOTE=1 only on disposable remote environments.",
    );
  }
}

async function requireAdminEnv(): Promise<void> {
  requireDisposableTarget();
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    test.skip();
  }
}

async function authenticateAsAdmin(page: Page): Promise<void> {
  await requireAdminEnv();
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/links$/);
}

async function seedUser(request: APIRequestContext, email: string, name: string): Promise<void> {
  const res = await request.post("/api/v1/auth/register", {
    data: { name, email, password: SEED_PASSWORD },
  });
  if (!res.ok()) {
    throw new Error(`seed register failed for ${email}: ${res.status()}`);
  }
}

function userRow(page: Page, email: string) {
  return page.locator("div.grid-cols-12").filter({ hasText: email });
}

async function revealUserRow(page: Page, email: string) {
  const rows = page.locator("div.grid-cols-12");
  for (let attempt = 0; attempt < 25; attempt++) {
    const row = userRow(page, email);
    if ((await row.count()) > 0) {
      break;
    }
    const more = page.getByRole("button", { name: "Load more" });
    if (!(await more.isVisible())) {
      break;
    }
    const before = await rows.count();
    await more.click();
    await expect
      .poll(async () => rows.count(), { timeout: 20_000 })
      .toBeGreaterThan(before);
  }
  const row = userRow(page, email);
  await expect(row).toHaveCount(1);
  return row;
}

test("admin: users grid loads and paginates", async ({ page, request }) => {
  await authenticateAsAdmin(page);

  const prefix = `probe-grid-${Date.now()}`;
  for (let i = 0; i < GRID_SEED_COUNT; i++) {
    await seedUser(request, `${prefix}-${String(i).padStart(2, "0")}@example.com`, `Probe Grid ${i}`);
  }

  await page.goto("/admin/users");
  await expect(page.getByText("Users")).toBeVisible();
  for (const header of ["Email", "Name", "Role", "Status", "Created", "Actions"]) {
    await expect(page.getByText(header, { exact: true })).toBeVisible();
  }

  const seededLinks = page.getByRole("link", { name: new RegExp(`^${prefix}-`) });
  const firstPageCount = await seededLinks.count();
  expect(firstPageCount).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: "Load more" })).toBeVisible();

  for (let attempt = 0; attempt < 10; attempt++) {
    const count = await seededLinks.count();
    if (count >= GRID_SEED_COUNT) {
      break;
    }
    const more = page.getByRole("button", { name: "Load more" });
    if (!(await more.isVisible())) {
      break;
    }
    await more.click();
    await expect
      .poll(async () => seededLinks.count(), { timeout: 20_000 })
      .toBeGreaterThan(count);
  }
  await expect(seededLinks).toHaveCount(GRID_SEED_COUNT);
});

test("admin: code search finds link by short code", async ({ page }) => {
  await authenticateAsAdmin(page);

  const original = `https://admin-probe.example.com/${Date.now()}`;
  await page.goto("/");
  await page.getByLabel("URL").fill(original);
  await page.getByRole("button", { name: "Shorten" }).click();
  await expect(page.locator("p.break-all")).toBeVisible({ timeout: 10_000 });

  const shortUrlText = (await page.locator("p.break-all").textContent()) ?? "";
  const shortCode = shortUrlText.match(/\/([A-Za-z0-9_-]+)$/)?.[1];
  if (!shortCode) {
    throw new Error(`could not extract a short code from "${shortUrlText}"`);
  }

  await page.goto("/admin/users");
  await page.getByLabel("Search by short code").fill(shortCode);
  await expect(page.getByText(new RegExp(`Found: .*/${shortCode}$`))).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(`Owner: ${ADMIN_EMAIL}`)).toBeVisible();
  await expect(page.getByText(`Original: ${original}`)).toBeVisible();
});

test("admin: force-archive archives the user's link", async ({ page }) => {
  await authenticateAsAdmin(page);

  const original = `https://force-archive.example.com/${Date.now()}`;
  await page.goto("/");
  await page.getByLabel("URL").fill(original);
  await page.getByRole("button", { name: "Shorten" }).click();
  await expect(page.locator("p.break-all")).toBeVisible({ timeout: 10_000 });

  await page.goto("/admin/users");
  const adminRow = await revealUserRow(page, ADMIN_EMAIL!);
  await adminRow.getByRole("link", { name: ADMIN_EMAIL! }).click();
  await expect(page.getByText("User's links")).toBeVisible();

  const linkRow = page.locator("div.grid-cols-12").filter({ hasText: original });
  await expect(linkRow).toHaveCount(1);
  await expect(linkRow.getByText("Active", { exact: true })).toBeVisible();

  await linkRow.getByRole("button", { name: "Archive" }).click();
  await expect(page.getByRole("dialog").getByText("Force-archive this link?")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Archive" }).click();

  await expect(linkRow.getByText("Archived", { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(linkRow.getByRole("button", { name: "Archive" })).toHaveCount(0);
});

test("admin: block and unblock a user", async ({ page, request }) => {
  await authenticateAsAdmin(page);

  const victimEmail = `probe-block-${Date.now()}@example.com`;
  await seedUser(request, victimEmail, "Probe Block Victim");

  await page.goto("/admin/users");
  const selfRow = await revealUserRow(page, ADMIN_EMAIL!);
  await expect(selfRow.getByRole("button")).toHaveCount(0);

  const victimRow = await revealUserRow(page, victimEmail);
  await expect(victimRow.getByText("Active", { exact: true })).toBeVisible();

  await victimRow.getByRole("button", { name: "Block", exact: true }).click();
  await expect(page.getByRole("dialog").getByText("Block this user?")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Block", exact: true }).click();

  await expect(victimRow.getByText("Blocked", { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(victimRow.getByRole("button", { name: "Block", exact: true })).toHaveCount(0);

  await victimRow.getByRole("button", { name: "Unblock", exact: true }).click();
  await expect(page.getByRole("dialog").getByText("Unblock this user?")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Unblock", exact: true }).click();

  await expect(victimRow.getByText("Active", { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(victimRow.getByRole("button", { name: "Unblock", exact: true })).toHaveCount(0);
});

test("admin: nav link visible for ADMIN", async ({ page }) => {
  await authenticateAsAdmin(page);
  await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
});

test("admin: USER gets no Admin nav and is redirected from /admin/users", async ({ page, request }) => {
  await requireAdminEnv();

  const email = `probe-nav-${Date.now()}@example.com`;
  await seedUser(request, email, "Probe Nav User");

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(SEED_PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/links$/);

  await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/$/);
});
