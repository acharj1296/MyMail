import { expect, test } from "@playwright/test";

const routes = [
  "/", "/login", "/register", "/forgot-password", "/privacy", "/terms", "/app", "/app/inbox", "/app/sent", "/app/drafts", "/app/starred", "/app/archive", "/app/trash", "/app/compose", "/app/domains", "/app/domains/domain-northstar", "/app/contacts", "/app/analytics", "/app/activity", "/app/settings", "/app/settings/profile", "/app/settings/security", "/app/settings/appearance", "/app/settings/notifications", "/app/settings/mailboxes", "/app/team", "/app/team/invitations", "/app/admin",
];

test.describe("Mailflare demo navigation", () => {
  test.setTimeout(90_000);
  test("all public and workspace routes render", async ({ page }) => {
    for (const route of routes) {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("body")).not.toContainText("Internal Server Error");
    }
  });

  test("message starring, selection, archive, trash, and restore/delete controls work", async ({ page }) => {
    await page.goto("/app/inbox");
    const subject = "The new brand direction looks wonderful";
    await expect(page.getByText(subject, { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Unstar message" }).first().click();
    await expect(page.getByRole("button", { name: "Star message" }).first()).toBeVisible();

    await page.getByRole("button", { name: `Select message ${subject}` }).click();
    await page.getByRole("button", { name: "Archive selected" }).click();
    await page.goto("/app/archive");
    await expect(page.getByText(subject, { exact: true })).toBeVisible();

    await page.getByRole("button", { name: `Select message ${subject}` }).click();
    await page.getByRole("button", { name: "Delete selected" }).click();
    await page.goto("/app/trash");
    await expect(page.getByText(subject, { exact: true })).toBeVisible();
    await page.getByRole("button", { name: `Select message ${subject}` }).click();
    await page.getByRole("button", { name: "Restore selected" }).click();
    await page.goto("/app/inbox");
    await expect(page.getByText(subject, { exact: true })).toBeVisible();
  });

  test("composer saves a draft and adds a simulated message to Sent", async ({ page }) => {
    await page.goto("/app/compose");
    await page.locator("#compose-to").fill("reader@example.test");
    await page.locator("#compose-subject").fill("Playwright draft check");
    await page.locator("#compose-body").fill("A local-only message body.");
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText("Draft saved")).toBeVisible();
    await page.goto("/app/drafts");
    await expect(page.getByText("Playwright draft check", { exact: true })).toBeVisible();
    await page.getByText("Playwright draft check", { exact: true }).click();
    await expect(page).toHaveURL(/\/app\/compose\?draft=/);
    await expect(page.locator("#compose-to")).toHaveValue("reader@example.test");
    await page.locator("#compose-body").fill("Updated after resuming this local draft.");
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText("Draft saved")).toBeVisible();

    await page.goto("/app/compose");
    await page.locator("#compose-to").fill("reader@example.test");
    await page.locator("#compose-subject").fill("Playwright sent check");
    await page.locator("#compose-body").fill("Nothing should leave the browser.");
    await page.getByRole("button", { name: "Send in demo" }).click();
    await expect(page).toHaveURL(/\/app\/sent$/);
    await expect(page.getByText("Playwright sent check", { exact: true })).toBeVisible();
  });

  test("domain wizard creates a mock domain and simulates verification", async ({ page }) => {
    await page.goto("/app/domains");
    await page.getByRole("button", { name: "Add domain" }).click();
    await page.locator("#domain").fill("playwright-demo.example");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Review example records" }).click();
    await page.getByRole("button", { name: "Add to demo workspace" }).click();
    await page.getByRole("button", { name: "Simulate verification" }).click();
    await expect(page.getByText("playwright-demo.example is ready in your demo")).toBeVisible();
    await page.getByRole("button", { name: "View domain" }).click();
    await expect(page).toHaveURL(/\/app\/domains\/domain-/);
    await expect(page.getByText("Ready in demo", { exact: true })).toBeVisible();
    await expect(page.getByText(/This app does not connect to Cloudflare or verify DNS/)).toBeVisible();
  });


  test("contacts can be created, searched, edited, and removed", async ({ page }) => {
    await page.goto("/app/contacts");
    await page.getByRole("button", { name: "Add contact" }).click();
    await page.locator("#contact-name").fill("Taylor Example");
    await page.locator("#contact-email").fill("taylor@example.test");
    await page.locator("#contact-company").fill("Demo Company");
    await page.locator("#contact-tags").fill("Client, QA");
    await page.getByRole("button", { name: "Add contact" }).last().click();
    await expect(page.getByRole("heading", { name: "Taylor Example" })).toBeVisible();
    await expect(page.getByText("Demo Company", { exact: true }).last()).toBeVisible();
    const contactSearch = page.getByRole("textbox", { name: "Search contacts" });
    await contactSearch.fill("Taylor");
    await expect(page.getByRole("button", { name: /Taylor Example/ })).toBeVisible();
    await contactSearch.fill("no-match");
    await expect(page.getByRole("button", { name: /Taylor Example/ })).toHaveCount(0);
    await contactSearch.fill("Taylor");

    await page.getByRole("button", { name: "Contact actions" }).click();
    await page.getByRole("menuitem", { name: "Edit contact" }).click();
    await page.locator("#contact-company").fill("Updated Demo Co.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Updated Demo Co.", { exact: true }).last()).toBeVisible();

    await page.getByRole("button", { name: "Contact actions" }).click();
    await page.getByRole("menuitem", { name: "Delete contact" }).click();
    await page.getByRole("button", { name: "Delete contact" }).click();
    await expect(page.getByText("Taylor Example", { exact: true })).toHaveCount(0);
  });

  test("theme choice persists across reload", async ({ page }) => {
    await page.goto("/app/settings/appearance");
    await page.getByRole("button", { name: /Dark/ }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("mobile navigation opens, navigates, and closes without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/app");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const inboxLink = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Inbox" });
    await expect(inboxLink).toBeVisible();
    await inboxLink.click();
    await expect(page).toHaveURL(/\/app\/inbox$/);
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const widthsFit = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      expect(widthsFit, `horizontal overflow at ${width}px`).toBeTruthy();
    }
  });
});
