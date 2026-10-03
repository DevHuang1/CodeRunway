import { describe, expect, it } from "vitest";
import { DEMO_TASK } from "@/lib/demo-data";
import { getProviderSettings, resolveAgentMode } from "@/lib/provider";
import { assertSafeEdits, parseModelAgentOutput } from "@/lib/validation";

const validOutput = {
  goal: "Make weak password feedback clear",
  milestones: [{ id: "understand", label: "Understand", detail: "Read the issue", evidence: "Issue confirmed" }],
  edits: [{ path: "src/signup.tsx", after: "safe content", summary: "Updated signup feedback" }],
  explanation: "The change explains weak input.",
  tests: [{ name: "feedback", details: "Checks the visible message" }],
};

describe("safe agent boundaries", () => {
  it("parses the structured model contract", () => {
    expect(parseModelAgentOutput(validOutput).goal).toBe("Make weak password feedback clear");
  });

  it("rejects paths outside the sample workspace", () => {
    expect(() => assertSafeEdits(DEMO_TASK, { ...validOutput, edits: [{ ...validOutput.edits[0], path: "../../secrets.txt" }] })).toThrow(/Unsafe edit path/);
  });

  it("rejects model-supplied shell commands", () => {
    expect(() => assertSafeEdits(DEMO_TASK, { ...validOutput, edits: [{ ...validOutput.edits[0], after: "child_process.exec('rm -rf /')" }] })).toThrow(/Unsafe command/);
  });

  it("uses fallback mode without a key in auto mode", () => {
    const originalMode = process.env.AGENT_MODE;
    const originalKey = process.env.NEBIUS_API_KEY;
    process.env.AGENT_MODE = "auto";
    delete process.env.NEBIUS_API_KEY;
    expect(resolveAgentMode(getProviderSettings())).toBe("fallback");
    if (originalMode === undefined) delete process.env.AGENT_MODE;
    else process.env.AGENT_MODE = originalMode;
    if (originalKey === undefined) delete process.env.NEBIUS_API_KEY;
    else process.env.NEBIUS_API_KEY = originalKey;
  });
});
