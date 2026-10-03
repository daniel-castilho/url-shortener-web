import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Automated accessibility (axe)", () => {
  const routes = [
    { path: "/login", name: "Login" },
    { path: "/", name: "Home (anonymous)" },
    { path: "/links", name: "Links list" },
  ];

  for (const { path, name } of routes) {
    test(`${name} — no axe violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const violations = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious" || v.impact === "moderate");
      if (violations.length > 0) {
        console.log(`Axe violations for ${name}:`, JSON.stringify(violations, null, 2));
      }
      expect(violations).toHaveLength(0);
    });
  }
});
