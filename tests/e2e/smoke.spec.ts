import { test, expect } from "@playwright/test";

test.describe("CertPath AI — critical flows", () => {
  test("landing page renders the hero and primary CTA", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Pass Certifications Faster/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Generate My Roadmap/i }).first()).toBeVisible();
  });

  test("generate page gates roadmap creation behind an API key", async ({ page }) => {
    await page.goto("/generate");
    // With no key configured, the RequireApiKey gate should prompt for settings.
    await expect(page.getByText(/Add your API key to generate/i)).toBeVisible();
    await page.getByRole("link", { name: /Open Settings/i }).click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByText(/AI Provider/i).first()).toBeVisible();
  });

  test("settings page lets a user enter and persist a key field", async ({ page }) => {
    await page.goto("/settings");
    const keyInput = page.getByLabel("API Key");
    await keyInput.fill("test-key-123");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText(/Settings saved/i)).toBeVisible();
  });

  test("roadmap page shows an empty state with no roadmap", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page.getByText(/No roadmap yet/i)).toBeVisible();
  });
});
