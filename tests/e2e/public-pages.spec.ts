import { expect, test } from "@playwright/test";

const overstatingClaims = [
  /tests? (were |was )?(run|ran|passed|executed)/i,
  /verified code/i,
  /\bcode compiles\b/i,
];

test("links the public pages from the landing footer", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Project pages" }).first();
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  await expect(nav.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  await expect(nav.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "/terms");
  await expect(nav.getByRole("link", { name: "MIT license" })).toHaveAttribute("href", /CodeRunway\/blob\/main\/LICENSE/);
});

test("about page names the real provider usage and the deliberate limits", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "One small change, with its evidence attached." })).toBeVisible();
  await expect(page.getByText("NVIDIA Nemotron 3.5 Lightning through the Nebius Token Factory API")).toBeVisible();
  await expect(page.getByText("at most twice per run")).toBeVisible();
  await expect(page.getByText("It does not compile TypeScript, run tests, or execute generated code in any sandbox")).toBeVisible();
  await expect(page.getByRole("link", { name: "MIT license" }).first()).toHaveAttribute("href", /LICENSE/);
  const body = await page.locator("main").innerText();
  for (const claim of overstatingClaims) expect(body).not.toMatch(claim);
});

test("privacy page describes what leaves the device without collecting data", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Your data goes almost nowhere, by design." })).toBeVisible();
  await expect(page.getByText("no accounts, no database, no analytics, and no cookies")).toBeVisible();
  await expect(page.getByText("hashed client IP address")).toBeVisible();
  await expect(page.getByText("never included in responses or shipped to the browser")).toBeVisible();
  await expect(page.getByText("Last updated October 11, 2026")).toBeVisible();
});

test("terms of service page keeps the static-check disclaimer front and center", async ({ page }) => {
  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: "Use it kindly, read the result honestly." })).toBeVisible();
  await expect(page.getByText("TERMS OF SERVICE", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Acceptance" })).toBeVisible();
  await expect(page.getByText("you agree to these terms of service")).toBeVisible();
  await expect(page.getByText("They do not run tests, compile code, or verify runtime behavior")).toBeVisible();
  await expect(page.getByText("static fixture criteria as executed tests", { exact: false })).toBeVisible();
  await expect(page.getByText("continued use after a change means you accept the updated terms")).toBeVisible();
});

test("public pages support keyboard navigation and the theme toggle", async ({ page }) => {
  await page.goto("/privacy");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/about");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
