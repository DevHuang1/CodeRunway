import { afterEach, describe, expect, it, vi } from "vitest";
import { createFallbackPlan, createFallbackResult, runAgent, staticFixtureChecks } from "@/lib/agent";
import { DEMO_TASK } from "@/lib/demo-data";

describe("Token Factory patch generation and static evaluation", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("labels fallback results as static fixture criteria and never as executed tests", () => {
    const result = createFallbackResult(DEMO_TASK);
    expect(result.verification).toEqual({ kind: "static-fixture", status: "passed", testsExecuted: false });
    expect(result.checks).toHaveLength(3);
    expect(result.checks.every((check) => check.evidenceSource === "static-fixture")).toBe(true);
    expect(result.nextStep).toMatch(/no code or test process ran/i);
  });

  it("makes one model request per live run and then checks only fixed fixture criteria", async () => {
    vi.stubEnv("NEBIUS_API_KEY", "test-only-key");
    const generate = vi.fn(async () => ({
      output: {
        edits: DEMO_TASK.files.map((file) => ({ path: file.path, after: file.after, summary: "Fixture edit" })),
        explanation: "A focused sample change.",
      },
      usage: { inputTokens: 80, outputTokens: 120 },
    }));
    const plan = {
      ...createFallbackPlan(DEMO_TASK),
      id: "plan-signup-validation-live",
      mode: "live" as const,
      model: "nvidia/Nemotron-3_5-Lightning",
    };

    const result = await runAgent(DEMO_TASK, plan, {}, { generate });

    expect(generate).toHaveBeenCalledTimes(1);
    expect(result.mode).toBe("live");
    expect(result.model).toBe("nvidia/Nemotron-3_5-Lightning");
    expect(result.verification.testsExecuted).toBe(false);
    expect(result.checks.every((check) => check.status === "passed")).toBe(true);
    expect(result.usage).toEqual({ inputTokens: 80, outputTokens: 120 });
  });

  it("does not mark criteria as passed when expected fixture content is missing", () => {
    const checks = staticFixtureChecks(DEMO_TASK, [
      { path: "src/signup.tsx", after: "export function SignupForm() {}", summary: "No feedback" },
      { path: "src/signup.test.tsx", after: "describe('signup', () => {});", summary: "No coverage" },
    ]);
    expect(checks.some((check) => check.status === "failed")).toBe(true);
  });
});
