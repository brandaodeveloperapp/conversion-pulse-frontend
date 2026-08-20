import { expect, test } from "@playwright/test";
import { CHANNEL_COLORS, chartLinePath, gotoReady, kpiValue } from "./utils";

test.describe("overview KPIs and chart", () => {
  test.skip(
    () => test.info().project.name !== "Desktop Chrome",
    "content assertions only need to run once, on desktop",
  );

  test("KPI cards show real numbers", async ({ page }) => {
    await gotoReady(page, "/overview");

    await expect
      .poll(async () => kpiValue(page, "Envios"))
      .toBe("9.525.993");

    await expect
      .poll(async () => kpiValue(page, "Taxa de conversão"))
      .toBe("0,30%");
  });

  test("chart renders 3 line paths with brand stroke colors", async ({
    page,
  }) => {
    await gotoReady(page, "/overview");

    for (const color of Object.values(CHANNEL_COLORS)) {
      await expect(chartLinePath(page, color)).toBeVisible();
    }
  });

  test("WhatsApp line has a gap (null periods), email line does not", async ({
    page,
  }) => {
    await gotoReady(page, "/overview");

    const emailPath = chartLinePath(page, CHANNEL_COLORS.email);
    const wppPath = chartLinePath(page, CHANNEL_COLORS.wpp);

    await expect(emailPath).toBeVisible();
    await expect(wppPath).toBeVisible();

    const emailD = await emailPath.getAttribute("d");
    const wppD = await wppPath.getAttribute("d");

    expect(emailD).toBeTruthy();
    expect(wppD).toBeTruthy();

    const emailSubpaths = emailD?.match(/M/g)?.length ?? 0;
    const wppSubpaths = wppD?.match(/M/g)?.length ?? 0;

    expect(emailSubpaths).toBe(1);
    expect(wppSubpaths).toBeGreaterThan(emailSubpaths);
  });
});
