export type AgentMode = "live" | "fallback";
export type AgentPreference = "auto" | "live" | "fallback";
export type MilestoneState = "pending" | "active" | "complete" | "failed";
export type CheckStatus = "passed" | "failed";

export interface FixtureFile {
  path: string;
  language: string;
  before: string;
  after: string;
}

export interface DemoTask {
  id: string;
  title: string;
  summary: string;
  description: string;
  expectedOutcome: string;
  stack: string[];
  files: FixtureFile[];
}

export interface Milestone {
  id: string;
  label: string;
  detail: string;
  evidence: string;
  state: MilestoneState;
  progress: number;
}

export interface AgentPlan {
  id: string;
  taskId: string;
  goal: string;
  mode: AgentMode;
  model: string;
  milestones: Milestone[];
  createdAt: string;
}

export interface CheckResult {
  name: string;
  status: CheckStatus;
  details: string;
  evidenceSource: "static-fixture";
}

export interface FixtureVerification {
  kind: "static-fixture";
  status: "passed" | "failed";
  testsExecuted: false;
}

export interface AgentResult {
  mode: AgentMode;
  model: string;
  explanation: string;
  filesChanged: string[];
  diffsByFile: Record<string, string>;
  diff: string;
  checks: CheckResult[];
  verification: FixtureVerification;
  nextStep: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

export type AgentEvent =
  | {
      type: "run_started";
      taskId: string;
      mode: AgentMode;
      model: string;
    }
  | {
      type: "milestone_updated";
      milestoneId: string;
      state: MilestoneState;
      completedCount: number;
      progress: number;
      evidence: string;
    }
  | {
      type: "file_changed";
      path: string;
      summary: string;
      diff: string;
    }
  | {
      type: "check_result";
      result: CheckResult;
    }
  | {
      type: "run_completed";
      result: AgentResult;
    }
  | {
      type: "run_error";
      code: string;
      message: string;
    };

export interface ModelPlanOutput {
  goal: string;
  milestones: Array<{
    id: string;
    label: string;
    detail: string;
    evidence: string;
  }>;
}

export interface ModelPatchOutput {
  edits: Array<{
    path: string;
    after: string;
    summary: string;
  }>;
  explanation: string;
}
