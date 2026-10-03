import { expect, test } from "@playwright/test";

test("renders the quiet product landing page", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/")) apiRequests.push(request.url());
  });

  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  expect(apiRequests).toEqual([]);
  await expect(page.getByRole("heading", { name: "Move from a coding issue to proof." })).toBeVisible();
  await expect(page.getByText("A CLEARER WAY TO FINISH ONE USEFUL CHANGE.", { exact: true })).toBeVisible();
  await expect(page.locator(".landing-hero")).not.toContainText(/\bAI\b/i);
  await expect(page.locator(".landing-note")).toContainText("No progress is claimed until evidence arrives.");

  const runway = page.getByRole("list", { name: "Six checkpoint sample path" });
  await expect(runway.getByRole("listitem")).toHaveCount(6);
  await expect(page.getByText("Not started", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start with the sample issue" })).toHaveAttribute("href", "/issue");

  const themeToggle = page.getByRole("button", { name: "Switch to dark mode" });
  await themeToggle.focus();
  await expect(themeToggle).toBeFocused();
  await themeToggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  const howItWorks = page.getByRole("link", { name: "See how it works" });
  await expect(howItWorks).toHaveAttribute("href", "#how-it-works");
  await howItWorks.click();
  await expect(page).toHaveURL(/\/#how-it-works$/);

  await page.goto("/");
  await page.getByRole("link", { name: "Start with the sample issue" }).click();
  await expect(page).toHaveURL(/\/issue$/);
  await expect(page.getByRole("heading", { name: "Name the small change you want to make." })).toBeVisible();
});

test("keeps the landing page readable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Move from a coding issue to proof." })).toBeVisible();
  const mobileCta = page.getByRole("link", { name: "Start with the sample issue" });
  await mobileCta.focus();
  await expect(mobileCta).toBeFocused();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("completes the safe fallback workflow", async ({ page }) => {
  await page.goto("/issue");
  await expect(page.getByRole("heading", { name: "Name the small change you want to make." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Add password-strength validation" })).toBeVisible();
  const issueLearning = page.locator("summary").filter({ hasText: "Three ideas to carry forward" });
  await expect(issueLearning).toHaveAttribute("aria-expanded", "false");
  await issueLearning.click();
  await expect(page.getByText("State-derived validation: use input to determine a clear, visible status.", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Make a plan/ }).click();
  await expect(page).toHaveURL(/\/plan$/);
  await page.getByRole("button", { name: "Inspect Plan checkpoint" }).click();
  await expect(page.getByText("An ordered plan is ready for your approval.", { exact: true })).toBeVisible();
  const checkpointLearning = page.locator("summary").filter({ hasText: "Why this checkpoint matters" });
  await expect(checkpointLearning).toHaveAttribute("aria-expanded", "false");
  await checkpointLearning.click();
  await expect(checkpointLearning).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Which checkpoint would show you that the change is ready to review", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve this plan" })).toBeVisible();
  await page.getByRole("button", { name: "Approve this plan" }).click();
  await expect(page).toHaveURL(/\/run$/);
  await expect(page.getByRole("button", { name: "Start the run" })).toBeVisible();
  await expect(page.getByText("Evidence received", { exact: true })).toBeVisible();
  await expect(page.getByText("Agent activity", { exact: true })).toBeVisible();
  const runLearning = page.locator("summary").filter({ hasText: "Translate a request into a user outcome." });
  await runLearning.click();
  await expect(page.getByText("A concrete outcome gives the change a boundary and makes later evidence easier to judge.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Start the run" }).click();
  await expect(page.getByRole("button", { name: "Pause the run" })).toBeVisible();
  const progressBeforePause = await page.getByRole("progressbar").getAttribute("aria-valuenow");
  await page.getByRole("button", { name: "Pause the run" }).click();
  await expect(page.getByRole("button", { name: /Resume from checkpoint/ })).toBeVisible();
  const progressAfterPause = await page.getByRole("progressbar").getAttribute("aria-valuenow");
  expect(Number(progressAfterPause ?? "0")).toBeGreaterThanOrEqual(Number(progressBeforePause ?? "0"));
  await page.getByRole("button", { name: /Resume from checkpoint/ }).click();

  await expect(page.getByRole("button", { name: /Review the change/ })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  await page.getByRole("button", { name: /Review the change/ }).click();
  await expect(page).toHaveURL(/\/review$/);
  await expect(page.getByRole("heading", { name: "2 changed files" })).toBeVisible();
  await expect(page.getByText("Why it works", { exact: true })).toBeVisible();
  const fileLearning = page.locator("summary").filter({ hasText: "State-derived validation and accessible feedback." });
  await expect(fileLearning).toHaveAttribute("aria-expanded", "false");
  await fileLearning.click();
  await expect(page.getByText("The form can explain its current state before submission and expose that explanation to assistive technology.", { exact: false })).toBeVisible();
  await expect(page.getByRole("tab", { name: "signup.test.tsx" })).toBeVisible();
  await page.getByRole("tab", { name: "signup.test.tsx" }).click();
  await expect(page.getByText("--- a/src/signup.test.tsx", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy patch" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download" })).toBeVisible();
  await page.getByRole("button", { name: "Continue to verify" }).click();
  await expect(page).toHaveURL(/\/verify$/);
  await expect(page.getByRole("heading", { name: "3/3 checks passed" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy run summary" })).toBeVisible();
  await expect(page.getByText("src/signup.tsx", { exact: true })).toBeVisible();
  const testLearning = page.locator("summary").filter({ hasText: "Understand this check" }).first();
  await testLearning.click();
  await expect(page.getByText("The password field exposes its strength status and associates the field with its feedback.", { exact: false })).toBeVisible();
  const takeawayDisclosure = page.locator("summary").filter({ hasText: "Put the change in your own words" });
  await takeawayDisclosure.click();
  await page.getByLabel("What changed, in one sentence?").fill("The form explains weak passwords and protects the submit action.");
  await page.getByRole("button", { name: "Copy run summary" }).click();
  await expect(page.getByRole("button", { name: /Copy run summary|Summary copied/ })).toBeVisible();
  await page.getByRole("button", { name: "Start another run" }).click();
  await expect(page).toHaveURL(/\/issue(?:\?reset=1)?$/);
  await expect(page.getByRole("heading", { name: "Name the small change you want to make." })).toBeVisible();
});

test("redirects locked pages to a truthful reset notice", async ({ page }) => {
  await page.goto("/review");
  await expect(page).toHaveURL(/\/issue\?reset=1$/);
  await expect(page.getByText("This browser session was reset safely. No progress was claimed.", { exact: true })).toBeVisible();
});

test("refreshing a workflow page resets the in-memory session", async ({ page }) => {
  await page.goto("/issue");
  await page.getByRole("button", { name: /Make a plan/ }).click();
  await expect(page).toHaveURL(/\/plan$/);
  await page.reload();
  await expect(page).toHaveURL(/\/issue\?reset=1$/);
  await expect(page.getByText("This browser session was reset safely. No progress was claimed.", { exact: true })).toBeVisible();
});
