import { describe, expect, it } from "vitest";
import {
  buildInitialMilestones,
  completeMilestone,
  progressForCompletedCount,
} from "@/lib/progress";
import {
  mergeEvidenceProgress,
  mergeVerifiedCheckpointCount,
  shouldAcceptMilestoneEvidence,
} from "@/lib/run-progress";

describe("goal-gradient progress", () => {
  it("uses evidence-backed progress increments from zero to completion", () => {
    expect([0, 1, 2, 3, 4, 5].map(progressForCompletedCount)).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it("starts with only the first checkpoint active", () => {
    const milestones = buildInitialMilestones();
    expect(milestones[0]?.state).toBe("active");
    expect(milestones.slice(1).every((milestone) => milestone.state === "pending")).toBe(true);
  });

  it("activates the next checkpoint only after the current one is complete", () => {
    const completed = completeMilestone(buildInitialMilestones(), "understand");
    expect(completed[0]?.state).toBe("complete");
    expect(completed[1]?.state).toBe("active");
    expect(completed[0]?.progress).toBe(20);
  });

  it("keeps verified progress monotonic while resuming a paused run", () => {
    expect(shouldAcceptMilestoneEvidence(2, 2)).toBe(false);
    expect(shouldAcceptMilestoneEvidence(3, 2)).toBe(true);
    expect(mergeVerifiedCheckpointCount(3, 2)).toBe(3);
    expect(mergeVerifiedCheckpointCount(3, 4)).toBe(4);
    expect(mergeEvidenceProgress(60, 20)).toBe(60);
    expect(mergeEvidenceProgress(60, 80)).toBe(80);
  });
});
