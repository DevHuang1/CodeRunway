import { describe, expect, it } from "vitest";
import { DEMO_TASK } from "@/lib/demo-data";
import { MILESTONE_BLUEPRINT, buildInitialMilestones, progressFromMilestones } from "@/lib/progress";
import { createFallbackResult } from "@/lib/agent";
import {
  CHECKPOINT_LEARNING,
  FILE_LEARNING,
  TEST_LEARNING,
  getCheckpointLearning,
  getFileLearning,
  getTestLearning,
} from "@/lib/learning";
import { buildRunSummary } from "@/lib/summary";

describe("learning companion catalog", () => {
  it("covers every checkpoint in the goal-gradient", () => {
    for (const milestone of MILESTONE_BLUEPRINT) {
      const note = getCheckpointLearning(milestone.id);
      expect(note.concept).toBeTruthy();
      expect(note.whyItMatters).toBeTruthy();
      expect(note.lookFor).toBeTruthy();
      expect(note.reflectionQuestion).toBeTruthy();
    }
    expect(Object.keys(CHECKPOINT_LEARNING)).toHaveLength(6);
  });

  it("covers every changed fixture file and registered test", () => {
    const result = createFallbackResult(DEMO_TASK);
    for (const path of result.filesChanged) {
      expect(getFileLearning(path)).not.toBeNull();
    }
    for (const test of result.tests) {
      expect(getTestLearning(test.name)).not.toBeNull();
    }
    expect(Object.keys(FILE_LEARNING)).toHaveLength(DEMO_TASK.files.length);
    expect(Object.keys(TEST_LEARNING)).toHaveLength(result.tests.length);
  });

  it("keeps learning content informational rather than changing progress", () => {
    const milestones = buildInitialMilestones();
    const before = progressFromMilestones(milestones);
    getCheckpointLearning("plan");
    getFileLearning("src/signup.tsx");
    getTestLearning("Weak password guidance");
    expect(progressFromMilestones(milestones)).toBe(before);
  });

  it("provides actionable guidance for failed checks", () => {
    const guidance = getTestLearning("Regression coverage");
    expect(guidance?.ifItFails).toMatch(/test|message|form/i);
  });

  it("keeps the learner takeaway in the copyable summary", () => {
    const result = createFallbackResult(DEMO_TASK);
    const summary = buildRunSummary(result, "The form explains weak passwords.");
    expect(summary).toContain("Takeaway: The form explains weak passwords.");
  });
});
