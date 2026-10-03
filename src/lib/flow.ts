export const FLOW_STAGES = ["issue", "plan", "run", "review", "verify"] as const;

export type FlowStage = (typeof FLOW_STAGES)[number];

export const FLOW_STAGE_LABELS: Record<FlowStage, string> = {
  issue: "Issue",
  plan: "Plan",
  run: "Run",
  review: "Review",
  verify: "Verify",
};

export function flowStagePath(stage: FlowStage) {
  return `/${stage}`;
}

export function flowStageIndex(stage: FlowStage) {
  return FLOW_STAGES.indexOf(stage);
}

export interface FlowEvidenceState {
  hasPlan: boolean;
  planApproved: boolean;
  hasResult: boolean;
}

export function canVisitStage(stage: FlowStage, state: FlowEvidenceState) {
  if (stage === "issue") return true;
  if (stage === "plan") return state.hasPlan;
  if (stage === "run") return state.hasPlan && state.planApproved;
  if (stage === "review" || stage === "verify") return state.hasResult;
  return false;
}

export function latestValidStage(state: FlowEvidenceState): FlowStage {
  if (state.hasResult) return "verify";
  if (state.hasPlan && state.planApproved) return "run";
  if (state.hasPlan) return "plan";
  return "issue";
}
