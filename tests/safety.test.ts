import { afterEach, describe, expect, it, vi } from "vitest";
import { DEMO_TASK } from "@/lib/demo-data";
import { getProviderSettings, getSafeProviderStatus, getLiveConfigurationIssues, resolveAgentMode } from "@/lib/provider";
import { assertSafeEdits, assertSafePlanText, parseModelPatchOutput, parseModelPlanOutput } from "@/lib/validation";

const validPlan = {
  goal: "Make weak password feedback clear",
  milestones: [{ id: "understand", label: "Understand", detail: "Read the issue", evidence: "Issue confirmed" }],
};

const validPatch = {
  edits: [{ path: "src/signup.tsx", after: "safe content", summary: "Updated signup feedback" }],
  explanation: "The change explains weak input.",
};

describe("safe Token Factory agent boundaries", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("parses the separate plan and patch contracts", () => {
    expect(parseModelPlanOutput(validPlan).goal).toBe("Make weak password feedback clear");
    expect(parseModelPatchOutput(validPatch).explanation).toContain("weak input");
  });

  it("rejects paths outside the sample workspace", () => {
    expect(() => assertSafeEdits(DEMO_TASK, { ...validPatch, edits: [{ ...validPatch.edits[0], path: "../../secrets.txt" }] })).toThrow(/Unsafe edit path/);
  });

  it("rejects model-supplied shell commands", () => {
    expect(() => assertSafeEdits(DEMO_TASK, { ...validPatch, edits: [{ ...validPatch.edits[0], after: "child_process.exec('rm -rf /')" }] })).toThrow(/Unsafe command/);
    expect(() => assertSafeEdits(DEMO_TASK, { ...validPatch, explanation: "Use bash to run the project." })).toThrow(/Unsafe command/);
    expect(() => assertSafePlanText({ ...parseModelPlanOutput(validPlan), goal: "Use bash" })).toThrow(/Unsafe command/);
  });

  it("rejects extra model fields instead of silently ignoring shell-command payloads", () => {
    expect(() => parseModelPatchOutput({ ...validPatch, command: "npm test" })).toThrow();
  });

  it("uses the deterministic fallback when auto mode has no key", () => {
    vi.stubEnv("AGENT_MODE", "auto");
    vi.stubEnv("NEBIUS_API_KEY", "");
    expect(resolveAgentMode(getProviderSettings())).toBe("fallback");
  });

  it("uses live Token Factory mode when auto mode has a key and no sandbox setup", () => {
    vi.stubEnv("AGENT_MODE", "auto");
    vi.stubEnv("NEBIUS_API_KEY", "test-only-key");
    expect(resolveAgentMode(getProviderSettings())).toBe("live");
    expect(getLiveConfigurationIssues()).toEqual([]);
  });

  it("keeps explicit live mode actionable when the key is missing", () => {
    vi.stubEnv("AGENT_MODE", "live");
    vi.stubEnv("NEBIUS_API_KEY", "");
    expect(resolveAgentMode(getProviderSettings())).toBe("live");
    expect(getLiveConfigurationIssues()).toEqual(["NEBIUS_API_KEY is missing"]);
  });

  it("pins the official endpoint, expected model, and hard output/time ceilings", () => {
    vi.stubEnv("AGENT_MODE", "auto");
    vi.stubEnv("NEBIUS_API_KEY", "test-only-key");
    vi.stubEnv("MAX_OUTPUT_TOKENS", "9999");
    vi.stubEnv("REQUEST_TIMEOUT_MS", "90000");
    vi.stubEnv("NEBIUS_MODEL", "higher-cost-model");
    const settings = getProviderSettings();
    const health = getSafeProviderStatus();
    expect(settings.model).toBe("nvidia/Nemotron-3_5-Lightning");
    expect(settings.maxOutputTokens).toBe(8_192);
    expect(settings.timeoutMs).toBe(90_000);
    expect(health.baseUrl).toBe("https://api.tokenfactory.nebius.com/v1");
    expect(health.limits).toMatchObject({ perClientPerMinute: 5, perApplicationPerHour: 20, concurrentRequests: 2 });
  });

  it("reports safe configuration without returning the provider secret", () => {
    vi.stubEnv("NEBIUS_API_KEY", "never-return-this-key");
    const health = getSafeProviderStatus();
    expect(health.modelCredentialsConfigured).toBe(true);
    expect(JSON.stringify(health)).not.toContain("never-return-this-key");
  });
});
