import { expect, test, type Page } from "@playwright/test";

const checkNames = ["Accessible strength feedback", "Weak password guidance", "Regression coverage"];

/**
 * Streams a run_completed result whose static criteria do not all match. The
 * response is served entirely from the browser, so no Token Factory request is
 * made and no credits are spent.
 */
async function mockRunWithChecks(page: Page, statuses: Array<"passed" | "failed">) {
  const checks = checkNames.map((name, index) => ({
    name,
    status: statuses[index] ?? "failed",
    details: "Static inspection checks the returned fixture content.",
    evidenceSource: "static-fixture",
  }));
  const allPassed = checks.every((check) => check.status === "passed");
  const result = {
    mode: "fallback",
    model: "Deterministic sample agent",
    explanation: "The sample change adds accessible strength feedback.",
    filesChanged: ["src/signup.tsx", "src/signup.test.tsx"],
    diffsByFile: { "src/signup.tsx": "sample diff", "src/signup.test.tsx": "sample test diff" },
    diff: "sample diff",
    checks,
    verification: { kind: "static-fixture", status: allPassed ? "passed" : "failed", testsExecuted: false },
    nextStep: allPassed
      ? "The fixed fixture criteria matched the returned file contents. No code or test process ran; review the diff and apply it in a real repository before relying on it."
      : "One or more static fixture criteria did not match. Review the patch and treat it as unverified; no code or test process ran.",
  };
  const events = [
    { type: "run_started", taskId: "signup-validation", mode: "fallback", model: "Deterministic sample agent" },
    { type: "milestone_updated", milestoneId: "generate", state: "complete", completedCount: 3, progress: 40, evidence: "Patch prepared." },
    { type: "file_changed", path: "src/signup.tsx", summary: "Added strength feedback.", diff: "--- a/src/signup.tsx\n+++ b/src/signup.tsx" },
    { type: "milestone_updated", milestoneId: "inspect", state: "complete", completedCount: 4, progress: 60, evidence: "Diff ready for review." },
    ...checks.map((check) => ({ type: "check_result", result: check })),
    allPassed
      ? { type: "milestone_updated", milestoneId: "test", state: "complete", completedCount: 5, progress: 80, evidence: "Static fixture criteria matched; no test was run." }
      : { type: "milestone_updated", milestoneId: "test", state: "failed", completedCount: 4, progress: 60, evidence: "One or more static fixture criteria did not match." },
    allPassed
      ? { type: "milestone_updated", milestoneId: "verify", state: "complete", completedCount: 6, progress: 100, evidence: "Static fixture checks matched." }
      : { type: "milestone_updated", milestoneId: "verify", state: "failed", completedCount: 5, progress: 80, evidence: "Verification is incomplete." },
    { type: "run_completed", result },
  ];
  const body = events
    .map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`)
    .join("");

  await page.route("**/api/agent/run", (route) =>
    route.fulfill({
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
      body,
    }),
  );
}

async function startRun(page: Page) {
  await page.goto("/issue");
  await page.getByRole("button", { name: /Make a plan/ }).click();
  await expect(page).toHaveURL(/\/plan$/);
  await page.getByRole("button", { name: "Approve this plan" }).click();
  await expect(page).toHaveURL(/\/run$/);
  await page.getByRole("button", { name: "Start the run" }).click();
  await expect(page.getByRole("button", { name: /Review the (change|result)/ })).toBeVisible({ timeout: 15_000 });
}

async function reachVerify(page: Page) {
  await startRun(page);
  await page.getByRole("button", { name: /Review the (change|result)/ }).click();
  await expect(page).toHaveURL(/\/review$/);
  await page.getByRole("button", { name: "Continue to verify" }).click();
  await expect(page).toHaveURL(/\/verify$/);
}

test("never reports a failed static criterion as passed", async ({ page }) => {
  await mockRunWithChecks(page, ["passed", "failed", "failed"]);
  await reachVerify(page);

  await expect(page.getByRole("heading", { name: "1/3 fixture checks matched" })).toBeVisible();
  await expect(page.getByText("The sample task needs another look.", { exact: true })).toBeVisible();
  await expect(page.getByText("Every fixed content criterion matched.")).toHaveCount(0);
  await expect(page.locator(".verify-summary-mark")).toHaveText("!");

  // The two unmatched criteria are marked failed, not passed.
  const rows = page.locator(".test-row");
  await expect(rows).toHaveCount(3);
  await expect(rows.filter({ hasText: "Accessible strength feedback" }).locator(".test-pass")).toHaveCount(1);
  await expect(rows.filter({ hasText: "Weak password guidance" }).locator(".test-fail")).toHaveCount(1);
  await expect(rows.filter({ hasText: "Regression coverage" }).locator(".test-fail")).toHaveCount(1);

  // The incomplete verdict is stated rather than smoothed over.
  await expect(page.getByText("Review the failed checks before treating this change as complete.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pause before you move on." })).toBeVisible();
});

test("keeps the static-only labeling intact when a criterion fails", async ({ page }) => {
  await mockRunWithChecks(page, ["failed", "failed", "failed"]);
  await reachVerify(page);

  await expect(page.getByRole("heading", { name: "0/3 fixture checks matched" })).toBeVisible();
  await expect(page.getByText("Static fixture criteria (not executed tests)")).toBeVisible();
  await expect(page.getByText("no code execution", { exact: true })).toBeVisible();
  await expect(page.getByText("These content checks are not a substitute for compiling and running tests in your own project.")).toBeVisible();
});

test("does not advance the goal gradient to complete when a criterion fails", async ({ page }) => {
  await mockRunWithChecks(page, ["passed", "failed", "passed"]);
  await reachVerify(page);

  await expect(page.getByRole("heading", { name: "2/3 fixture checks matched" })).toBeVisible();
  await expect(page.getByText("Every fixed content criterion matched.")).toHaveCount(0);
});

test("holds the run incomplete on the run page when a criterion fails", async ({ page }) => {
  await mockRunWithChecks(page, ["passed", "failed", "failed"]);
  await startRun(page);

  // The incomplete run must not report 6/6 verified or a 100% goal gradient.
  await expect(page.getByText("6/6 verified")).toHaveCount(0);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "80");
  // The failure is surfaced on the run page, not only at the end of the flow.
  await expect(page.getByText("Checks need attention")).toBeVisible();
  await expect(page.getByText("One or more static fixture criteria did not match.", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Verification: static fixture criteria only. No code or test process ran.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Review the result" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Review the change" })).toHaveCount(0);
});

test("keeps a failed result free of executed-test claims on every page", async ({ page }) => {
  await mockRunWithChecks(page, ["passed", "failed", "failed"]);
  await reachVerify(page);

  // No page may describe the evaluator as running tests or verifying code.
  const overstatingClaims = [
    /tests? (were |was )?(run|ran|passed|executed)/i,
    /all tests pass/i,
    /verified code/i,
    /\bcode compiles\b/i,
  ];

  for (const stage of ["/run", "/review", "/verify"]) {
    await page.goto(stage);
    await expect(page).toHaveURL(new RegExp(`${stage}$`));
    const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    for (const claim of overstatingClaims) {
      expect(body, `${stage} should not claim ${claim}`).not.toMatch(claim);
    }
  }
});

test("reports the incomplete static criteria honestly in the copied summary", async ({ page }) => {
  await mockRunWithChecks(page, ["passed", "failed", "failed"]);
  await reachVerify(page);

  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copy run summary" }).click();
  await expect(page.getByRole("button", { name: "Summary copied" })).toBeVisible();

  const summary = await page.evaluate(() => navigator.clipboard.readText());
  expect(summary).toContain("Static fixture criteria: 1/3 matched");
  expect(summary).toContain("Execution: no code or test process ran");
  expect(summary).toMatch(/unverified/i);
  expect(summary).not.toMatch(/tests? passed/i);
});

test("keeps live-provider failure states actionable without contacting Nebius", async ({ page }) => {
  await page.route("**/api/health", (route) => route.fulfill({ json: {
    status: "ok",
    provider: {
      mode: "live", preference: "live", configured: true, modelCredentialsConfigured: true,
      model: "nvidia/Nemotron-3_5-Lightning", baseUrl: "https://api.tokenfactory.nebius.com/v1", liveReady: true,
      limits: { maxOutputTokens: 8192, timeoutMs: 120000, perClientPerMinute: 5, perApplicationPerHour: 20, concurrentRequests: 2 },
    },
  } }));
  await page.route("**/api/agent/plan", (route) => route.fulfill({ json: {
    error: "Token Factory declined this request because an account limit was reached.",
    code: "PROVIDER_LIMIT",
  }, status: 502 }));

  await page.goto("/issue");
  await page.getByRole("button", { name: /Make a plan/ }).click();

  const error = page.locator(".error-box");
  await expect(error).toBeVisible();
  await expect(error).toContainText("Token Factory declined this request because an account limit was reached.");
  await expect(page).toHaveURL(/\/issue$/);
  await expect(page.getByRole("button", { name: "Make a plan" })).toBeEnabled();
  // A provider failure must not silently become passing evidence.
  await expect(page.getByRole("progressbar")).toHaveCount(0);
});

test("surfaces the provider-not-configured message for an unconfigured live mode", async ({ page }) => {
  await page.route("**/api/health", (route) => route.fulfill({ json: {
    status: "ok",
    provider: {
      mode: "live", preference: "live", configured: false, modelCredentialsConfigured: false,
      model: "nvidia/Nemotron-3_5-Lightning", baseUrl: "https://api.tokenfactory.nebius.com/v1", liveReady: false,
      limits: { maxOutputTokens: 8192, timeoutMs: 120000, perClientPerMinute: 5, perApplicationPerHour: 20, concurrentRequests: 2 },
    },
  } }));
  await page.route("**/api/agent/plan", (route) => route.fulfill({ json: {
    error: "Live mode needs a valid server-side NEBIUS_API_KEY.",
  }, status: 503 }));

  await page.goto("/issue");
  await page.getByRole("button", { name: /Make a plan/ }).click();
  await expect(page.locator(".error-box")).toContainText("Live mode needs a valid server-side NEBIUS_API_KEY.");
});

test("rejects a run request that carries a plan the server did not approve", async ({ request }) => {
  // The browser flow already covers the approved-plan contract. This covers the
  // server guard that a client cannot reach through the UI.
  const response = await request.post("/api/agent/run", {
    data: {
      taskId: "signup-validation",
      plan: {
        id: "plan-signup-validation-live",
        taskId: "signup-validation",
        goal: "Invented plan",
        mode: "live",
        model: "nvidia/Nemotron-3_5-Lightning",
        milestones: [],
        createdAt: new Date().toISOString(),
      },
    },
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({ error: expect.stringMatching(/malformed|expired|invalid/i) });
});