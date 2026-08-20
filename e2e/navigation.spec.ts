import { expect, test } from "@playwright/test";
import { gotoReady, HEADINGS, NAV_ITEMS, primaryNav, sidebar } from "./utils";

test.describe("navigation", () => {
  test("root redirects to /overview", async ({ page }) => {
    await gotoReady(page, "/");
    await expect(page).toHaveURL(/\/overview$/);
  });

  for (const item of NAV_ITEMS) {
    test(`${item.href} loads with heading, brand and full nav`, async ({
      page,
    }, testInfo) => {
      const response = await page.goto(item.href);
      await page.waitForLoadState("networkidle");

      expect(response?.status()).toBe(200);

      await expect(
        page.getByRole("heading", { level: 1, name: HEADINGS[item.href] }),
      ).toBeVisible();

      const aside = sidebar(page);
      await expect(aside).toBeAttached();

      const isDesktop = testInfo.project.name === "Desktop Chrome";

      if (isDesktop) {
        await expect(
          aside.getByText("CONVERSION", { exact: true }),
        ).toBeVisible();
        await expect(aside.getByText("PULSE", { exact: true })).toBeVisible();

        const nav = primaryNav(page);
        for (const navItem of NAV_ITEMS) {
          await expect(
            nav.getByRole("link", { name: new RegExp(navItem.label) }),
          ).toBeVisible();
        }
      } else {
        await expect(aside).toBeHidden();
        await expect(
          page.getByRole("button", { name: "Abrir menu" }),
        ).toBeVisible();
      }
    });
  }
});
