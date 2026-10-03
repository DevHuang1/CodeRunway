export type AgentMode = "live" | "fallback";
export type AgentPreference = "auto" | "live" | "fallback";
export type MilestoneState = "pending" | "active" | "complete" | "failed";
export type TestStatus = "passed" | "failed";

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

export interface TestResult {
  name: string;
  status: TestStatus;
  details: string;
}

export interface AgentResult {
  mode: AgentMode;
  model: string;
  explanation: string;
  filesChanged: string[];
  diffsByFile: Record<string, string>;
  diff: string;
  tests: TestResult[];
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
      type: "test_result";
      result: TestResult;
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

export interface ModelAgentOutput {
  goal: string;
  milestones: Array<{
    id: string;
    label: string;
    detail: string;
    evidence: string;
  }>;
  edits: Array<{
    path: string;
    after: string;
    summary: string;
  }>;
  explanation: string;
  tests: Array<{
    name: string;
    details: string;
  }>;
}
