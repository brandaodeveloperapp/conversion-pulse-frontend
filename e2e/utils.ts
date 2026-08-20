import { expect, type Locator, type Page } from "@playwright/test";

export const NAV_ITEMS = [
  { href: "/overview", label: "Visão geral" },
  { href: "/channels", label: "Por canal" },
  { href: "/table", label: "Tabela" },
  { href: "/compare", label: "Comparação" },
  { href: "/about", label: "Sobre os dados" },
] as const;

export const HEADINGS: Record<string, string> = {
  "/overview": "Visão geral",
  "/channels": "Por canal",
  "/table": "Tabela",
  "/compare": "Comparação",
  "/about": "Sobre os dados",
};

export const CHANNEL_COLORS = {
  email: "#f28b04",
  mobile: "#cc3366",
  wpp: "#2dd4bf",
} as const;

export async function gotoReady(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

export async function kpiValue(page: Page, label: string) {
  const value = await page
    .getByText(label, { exact: true })
    .locator("xpath=following-sibling::p[1]")
    .first()
    .innerText();
  return value.trim();
}

export function primaryNav(page: Page) {
  return page.getByRole("navigation", { name: "Navegação principal" });
}

export function sidebar(page: Page) {
  return page.locator("aside");
}

export function chartLinePath(page: Page, color: string) {
  return page
    .locator(`svg path.recharts-line-curve[stroke="${color}"]`)
    .first();
}

export async function clickUntilUrlContains(
  page: Page,
  locator: Locator,
  substring: string,
  maxAttempts = 5,
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await locator.click();
    try {
      await page.waitForURL((url) => url.toString().includes(substring), {
        timeout: 1500,
      });
      return;
    } catch {
      // hydration not ready yet on this attempt, retry
    }
  }
  await expect(page).toHaveURL(new RegExp(escapeRegExp(substring)));
}

export async function clickUntilUrlChanges(
  page: Page,
  locator: Locator,
  previousUrl: string,
  maxAttempts = 5,
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await locator.click();
    try {
      await page.waitForURL((url) => url.toString() !== previousUrl, {
        timeout: 1500,
      });
      return;
    } catch {
      // retry
    }
  }
  expect(page.url()).not.toBe(previousUrl);
}

export async function waitForUrlToContain(
  page: Page,
  substring: string,
  timeout = 3000,
) {
  await page.waitForURL((url) => url.toString().includes(substring), {
    timeout,
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parsePtBrPercent(value: string) {
  return Number(value.replace("%", "").replace(",", "."));
}
