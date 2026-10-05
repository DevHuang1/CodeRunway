import type { Milestone, MilestoneState } from "@/lib/types";

export const MILESTONE_BLUEPRINT = [
  {
    id: "understand",
    label: "Understand",
    detail: "Translate the issue into a concrete user outcome.",
    evidence: "The issue and expected outcome are confirmed.",
  },
  {
    id: "plan",
    label: "Plan",
    detail: "Break the work into small, reviewable checkpoints.",
    evidence: "An ordered plan is ready for your approval.",
  },
  {
    id: "generate",
    label: "Generate",
    detail: "Create a focused change inside the sample workspace.",
    evidence: "The agent produced an allowlisted file edit.",
  },
  {
    id: "inspect",
    label: "Inspect",
    detail: "Explain what changed and why it addresses the issue.",
    evidence: "The diff and explanation are visible for review.",
  },
  {
    id: "test",
    label: "Check",
    detail: "Compare the sample contents with fixed conditions; no code or test process runs.",
    evidence: "Static fixture criteria were matched or flagged.",
  },
  {
    id: "verify",
    label: "Verify",
    detail: "Confirm the task is complete and name the next step.",
    evidence: "All required checks passed and the diff is ready to review.",
  },
] as const;

export function progressForCompletedCount(completedCount: number): number {
  const bounded = Math.max(0, Math.min(MILESTONE_BLUEPRINT.length - 1, completedCount));
  return bounded * 20;
}

export function buildInitialMilestones(): Milestone[] {
  return MILESTONE_BLUEPRINT.map((milestone, index) => ({
    ...milestone,
    state: index === 0 ? "active" : "pending",
    progress: index === 0 ? 0 : progressForCompletedCount(index),
  }));
}

export function completeMilestone(
  milestones: Milestone[],
  milestoneId: string,
): Milestone[] {
  const index = milestones.findIndex((milestone) => milestone.id === milestoneId);
  if (index < 0) return milestones;

  return milestones.map((milestone, milestoneIndex) => {
    if (milestoneIndex < index || milestoneIndex === index) {
      return {
        ...milestone,
        state: "complete" as MilestoneState,
        progress: progressForCompletedCount(milestoneIndex + 1),
      };
    }
    if (milestoneIndex === index + 1) {
      return { ...milestone, state: "active" as MilestoneState };
    }
    return milestone;
  });
}

export function progressFromMilestones(milestones: Milestone[]): number {
  return progressForCompletedCount(
    milestones.filter((milestone) => milestone.state === "complete").length,
  );
}
