import { expect, test } from "@playwright/test";
import {
  clickUntilUrlChanges,
  clickUntilUrlContains,
  gotoReady,
  kpiValue,
  parsePtBrPercent,
  primaryNav,
  waitForUrlToContain,
} from "./utils";

test.describe("filters", () => {
  test.skip(
    () => test.info().project.name !== "Desktop Chrome",
    "filter controls live in the desktop sidebar; drawer interaction is covered in responsive.spec.ts",
  );

  test("granularity Dia updates the URL", async ({ page }) => {
    await gotoReady(page, "/overview");

    await clickUntilUrlContains(
      page,
      page.getByRole("button", { name: "Dia", exact: true }),
      "granularity=day",
    );

    await expect(page).toHaveURL(/granularity=day/);
    await expect(
      page.getByRole("button", { name: "Dia", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("toggling a channel updates the URL and the chart subtitle", async ({
    page,
  }) => {
    await gotoReady(page, "/overview");

    const chartTitle = page.getByRole("heading", {
      level: 2,
      name: /Taxa de conversão —/,
    });
    await expect(chartTitle).toHaveText(/E-mail, Mobile, WhatsApp/);

    await clickUntilUrlContains(
      page,
      page.getByRole("button", { name: "WhatsApp", exact: true }),
      "channels=wpp",
    );

    await expect(page).toHaveURL(/channels=wpp/);
    await expect(chartTitle).toHaveText("Taxa de conversão — WhatsApp");
  });

  test("adding status Aberto raises the global conversion rate", async ({
    page,
  }) => {
    await gotoReady(page, "/overview");

    const baseline = parsePtBrPercent(
      await kpiValue(page, "Taxa de conversão"),
    );
    expect(baseline).toBeCloseTo(0.3, 1);

    await clickUntilUrlContains(
      page,
      page.getByRole("button", { name: "Aberto", exact: true }),
      "conversionStatuses=",
    );

    await expect(page).toHaveURL(/conversionStatuses=1%2C5/);

    await expect
      .poll(async () => parsePtBrPercent(await kpiValue(page, "Taxa de conversão")))
      .toBeGreaterThan(1);
  });

  test("filters persist across a view change", async ({ page }) => {
    await gotoReady(page, "/overview");

    await clickUntilUrlContains(
      page,
      page.getByRole("button", { name: "Dia", exact: true }),
      "granularity=day",
    );

    const tabelaLink = primaryNav(page).getByRole("link", {
      name: /Tabela/,
    });
    await expect(tabelaLink).toHaveAttribute(
      "href",
      /\/table\?granularity=day/,
    );

    const before = page.url();
    await clickUntilUrlContains(page, tabelaLink, "/table");
    expect(page.url()).not.toBe(before);

    await expect(page).toHaveURL(/\/table\?.*granularity=day/);
  });

  test("inverted date range surfaces the error panel", async ({ page }) => {
    await gotoReady(page, "/overview");

    await page.getByLabel("De", { exact: true }).fill("2025-06-01");
    await page.getByLabel("De", { exact: true }).blur();
    await waitForUrlToContain(page, "from=2025-06-01");

    await page.getByLabel("Até", { exact: true }).fill("2025-01-01");
    await page.getByLabel("Até", { exact: true }).blur();
    await waitForUrlToContain(page, "to=2025-01-01");

    await expect(
      page.getByText("Não foi possível carregar os dados."),
    ).toBeVisible();
    await expect(
      page.getByText("Recorte inválido — ajuste os filtros."),
    ).toBeVisible();
  });

  test("Copiar link and Limpar filtros controls exist and clearing works", async ({
    page,
  }) => {
    await gotoReady(page, "/overview?conversionStatuses=1%2C5");

    await expect(
      page.getByRole("button", { name: "Copiar link" }),
    ).toBeVisible();

    const limparButton = page.getByRole("button", { name: "Limpar filtros" });
    await expect(limparButton).toBeVisible();

    const before = page.url();
    await clickUntilUrlChanges(page, limparButton, before);
    await expect(page).toHaveURL(/\/overview$/);
  });
});
