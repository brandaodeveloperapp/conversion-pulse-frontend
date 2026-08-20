import path from "node:path";
import { expect, test } from "@playwright/test";
import { gotoReady, sidebar } from "./utils";

test.describe("responsive drawer", () => {
  test.skip(
    () => test.info().project.name === "Desktop Chrome",
    "fixed sidebar only collapses into a drawer below the lg breakpoint",
  );

  test("fixed sidebar is hidden and hamburger opens the drawer", async ({
    page,
  }) => {
    await gotoReady(page, "/overview");

    await expect(sidebar(page)).toBeHidden();

    const hamburger = page.getByRole("button", { name: "Abrir menu" });
    await expect(hamburger).toBeVisible();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeHidden();

    await hamburger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("CONVERSION", { exact: true })).toBeVisible();
    await expect(dialog.getByText("PULSE", { exact: true })).toBeVisible();
  });

  test("drawer traps focus", async ({ page }) => {
    await gotoReady(page, "/overview");

    await page.getByRole("button", { name: "Abrir menu" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
    }

    const focusStillInsideDialog = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      return dlg ? dlg.contains(document.activeElement) : false;
    });
    expect(focusStillInsideDialog).toBe(true);
  });

  test("drawer closes on Escape", async ({ page }) => {
    await gotoReady(page, "/overview");

    await page.getByRole("button", { name: "Abrir menu" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("drawer closes on backdrop click", async ({ page }) => {
    await gotoReady(page, "/overview");

    await page.getByRole("button", { name: "Abrir menu" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const viewportWidth = page.viewportSize()?.width ?? 390;
    const backdrop = page.getByRole("button", { name: "Fechar menu" });
    await backdrop.click({ position: { x: viewportWidth - 20, y: 100 } });

    await expect(dialog).toBeHidden();
  });
});

test.describe("full-page screenshots", () => {
  const routes: Array<{ path: string; slug: string }> = [
    { path: "/overview", slug: "overview" },
    { path: "/channels", slug: "channels" },
  ];

  for (const route of routes) {
    test(`captures ${route.slug}`, async ({ page }, testInfo) => {
      await gotoReady(page, route.path);

      const projectSlug = testInfo.project.name
        .toLowerCase()
        .replace(/\s+/g, "-");
      const fileName = `${route.slug}-${projectSlug}.png`;
      const outputPath = path.join(
        testInfo.config.rootDir,
        "e2e",
        "__screenshots__",
        fileName,
      );

      await page.screenshot({ path: outputPath, fullPage: true });
      await testInfo.attach(fileName, { path: outputPath, contentType: "image/png" });
    });
  }
});
