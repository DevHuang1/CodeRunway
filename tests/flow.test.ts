import { describe, expect, it } from "vitest";
import { canVisitStage, FLOW_STAGES, flowStageIndex, flowStagePath, latestValidStage } from "@/lib/flow";

describe("multi-page workflow guards", () => {
  it("keeps the workflow in its declared order", () => {
    expect(FLOW_STAGES).toEqual(["issue", "plan", "run", "review", "verify"]);
    expect(FLOW_STAGES.map(flowStageIndex)).toEqual([0, 1, 2, 3, 4]);
    expect(FLOW_STAGES.map(flowStagePath)).toEqual(["/issue", "/plan", "/run", "/review", "/verify"]);
  });

  it("only unlocks plan after a plan exists", () => {
    expect(canVisitStage("issue", { hasPlan: false, planApproved: false, hasResult: false })).toBe(true);
    expect(canVisitStage("plan", { hasPlan: false, planApproved: false, hasResult: false })).toBe(false);
    expect(canVisitStage("plan", { hasPlan: true, planApproved: false, hasResult: false })).toBe(true);
  });

  it("requires approval before opening the run", () => {
    expect(canVisitStage("run", { hasPlan: true, planApproved: false, hasResult: false })).toBe(false);
    expect(canVisitStage("run", { hasPlan: true, planApproved: true, hasResult: false })).toBe(true);
  });

  it("keeps review and verify locked until a result exists", () => {
    expect(canVisitStage("review", { hasPlan: true, planApproved: true, hasResult: false })).toBe(false);
    expect(canVisitStage("verify", { hasPlan: true, planApproved: true, hasResult: false })).toBe(false);
    expect(canVisitStage("review", { hasPlan: true, planApproved: true, hasResult: true })).toBe(true);
    expect(canVisitStage("verify", { hasPlan: true, planApproved: true, hasResult: true })).toBe(true);
  });

  it("returns the latest page supported by current evidence", () => {
    expect(latestValidStage({ hasPlan: false, planApproved: false, hasResult: false })).toBe("issue");
    expect(latestValidStage({ hasPlan: true, planApproved: false, hasResult: false })).toBe("plan");
    expect(latestValidStage({ hasPlan: true, planApproved: true, hasResult: false })).toBe("run");
    expect(latestValidStage({ hasPlan: true, planApproved: true, hasResult: true })).toBe("verify");
  });
});
