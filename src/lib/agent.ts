import { DEMO_TASK, getAllowedPaths } from "@/lib/demo-data";
import {
  buildInitialMilestones,
  completeMilestone,
  MILESTONE_BLUEPRINT,
  progressForCompletedCount,
} from "@/lib/progress";
import {
  getLiveConfigurationIssues,
  getProviderSettings,
  requestLivePatchOutput,
  requestLivePlanOutput,
  resolveAgentMode,
} from "@/lib/provider";
import { assertSafeEdits } from "@/lib/validation";
import type {
  AgentPlan,
  AgentResult,
  CheckResult,
  DemoTask,
  Milestone,
  ModelPatchOutput,
  ModelPlanOutput,
} from "@/lib/types";

export function createFallbackPlan(task: DemoTask = DEMO_TASK): AgentPlan {
  const milestones = buildInitialMilestones().map((milestone) => {
    if (milestone.id === "test") return {
      ...milestone,
      label: "Check fixture criteria",
      detail: "Compare the sample contents with fixed conditions; no code or test process runs.",
      evidence: "Static fixture criteria were matched or flagged.",
    };
    if (milestone.id === "verify") return {
      ...milestone,
      detail: "Review the static fixture result and choose a next step.",
      evidence: "The fixture criteria are reported without claiming executed tests.",
    };
    return milestone;
  });
  return {
    id: `plan-${task.id}-fallback`,
    taskId: task.id,
    goal: task.expectedOutcome,
    mode: "fallback",
    model: "Deterministic sample agent",
    milestones,
    createdAt: new Date().toISOString(),
  };
}

function normalizeMilestones(output: ModelPlanOutput): Milestone[] {
  const provided = new Map(output.milestones.map((milestone) => [milestone.id, milestone]));
  return MILESTONE_BLUEPRINT.map((blueprint, index) => {
    const modelMilestone = provided.get(blueprint.id);
    const staticCheckMilestone = blueprint.id === "test";
    return {
      id: blueprint.id,
      label: staticCheckMilestone ? "Check fixture criteria" : modelMilestone?.label || blueprint.label,
      detail: staticCheckMilestone
        ? "Compare the sample contents with fixed conditions; no code or test process runs."
        : modelMilestone?.detail || blueprint.detail,
      evidence: staticCheckMilestone
        ? "Static fixture criteria were matched or flagged."
        : modelMilestone?.evidence || blueprint.evidence,
      state: index === 0 ? "active" : "pending",
      progress: index === 0 ? 0 : progressForCompletedCount(index),
    };
  });
}

export function createPlanFromLiveOutput(task: DemoTask, output: ModelPlanOutput): AgentPlan {
  return {
    id: `plan-${task.id}-live`,
    taskId: task.id,
    goal: output.goal,
    mode: "live",
    model: getProviderSettings().model,
    milestones: normalizeMilestones(output),
    createdAt: new Date().toISOString(),
  };
}

export async function createPlan(task: DemoTask, signal?: AbortSignal): Promise<AgentPlan> {
  if (resolveAgentMode() === "fallback") return createFallbackPlan(task);
  const issues = getLiveConfigurationIssues();
  if (issues.length > 0) throw new Error(`Live mode is not ready: ${issues.join(", ")}`);
  const { output } = await requestLivePlanOutput(task, signal);
  return createPlanFromLiveOutput(task, output);
}

function diffForFile(path: string, before: string, after: string): string {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  return [
    `--- a/${path}`,
    `+++ b/${path}`,
    ...beforeLines.map((line) => `- ${line}`),
    ...afterLines.map((line) => `+ ${line}`),
  ].join("\n");
}

export function staticFixtureChecks(task: DemoTask, edits: ModelPatchOutput["edits"]): CheckResult[] {
  const contents = new Map(task.files.map((file) => [file.path, file.before]));
  for (const edit of edits) contents.set(edit.path, edit.after);

  const signup = contents.get("src/signup.tsx") ?? "";
  const tests = contents.get("src/signup.test.tsx") ?? "";
  return [
    {
      name: "Accessible strength feedback",
      status:
        signup.includes("aria-describedby") && signup.includes("aria-invalid") && signup.includes("Strength")
          ? "passed"
          : "failed",
      details: "Static inspection checks that the password field exposes a status and associates inline feedback.",
      evidenceSource: "static-fixture",
    },
    {
      name: "Weak password guidance",
      status: signup.includes("Use at least 8 characters") ? "passed" : "failed",
      details: "Static inspection checks for a visible minimum-length message in the fixture content.",
      evidenceSource: "static-fixture",
    },
    {
      name: "Regression coverage",
      status: tests.includes("Use at least 8 characters") ? "passed" : "failed",
      details: "Static inspection checks that the expected weak-password behavior appears in the fixture test file.",
      evidenceSource: "static-fixture",
    },
  ];
}

function resultFromOutput(
  task: DemoTask,
  output: ModelPatchOutput,
  mode: "live" | "fallback",
  checks: CheckResult[],
  usage?: AgentResult["usage"],
): AgentResult {
  assertSafeEdits(task, output);
  const allowed = getAllowedPaths(task);
  const edits = output.edits.filter((edit) => allowed.has(edit.path));
  const filesChanged = edits.map((edit) => edit.path);
  const diffsByFile = Object.fromEntries(
    edits.map((edit) => {
      const source = task.files.find((file) => file.path === edit.path);
      return [edit.path, source ? diffForFile(edit.path, source.before, edit.after) : ""];
    }),
  );
  const allPassed = checks.length > 0 && checks.every((check) => check.status === "passed");

  return {
    mode,
    model: mode === "live" ? getProviderSettings().model : "Deterministic sample agent",
    explanation: output.explanation,
    filesChanged,
    diffsByFile,
    diff: Object.values(diffsByFile).filter(Boolean).join("\n\n"),
    checks,
    verification: { kind: "static-fixture", status: allPassed ? "passed" : "failed", testsExecuted: false },
    nextStep: allPassed
      ? "The fixed fixture criteria matched the returned file contents. No code or test process ran; review the diff and apply it in a real repository before relying on it."
      : "One or more static fixture criteria did not match. Review the patch and treat it as unverified; no code or test process ran.",
    usage,
  };
}

export function createFallbackResult(task: DemoTask = DEMO_TASK): AgentResult {
  const edits: ModelPatchOutput["edits"] = task.files.map((file) => ({
    path: file.path,
    after: file.after,
    summary: file.path.includes("test")
      ? "Added regression coverage for weak-password guidance."
      : "Added strength calculation, accessible feedback, and submit protection.",
  }));
  const output: ModelPatchOutput = {
    edits,
    explanation:
      "The sample change adds a password-strength helper, exposes its result to assistive technology, prevents submission for weak input, and updates the regression-test fixture.",
  };
  return resultFromOutput(task, output, "fallback", staticFixtureChecks(task, edits));
}

export interface AgentRunHooks {
  signal?: AbortSignal;
  onPatch?: (event: { edits: ModelPatchOutput["edits"] }) => void;
  onCheckResults?: (checks: CheckResult[]) => void;
}

export interface AgentRunRuntime {
  generate?: typeof requestLivePatchOutput;
}

export async function runAgent(
  task: DemoTask,
  plan: AgentPlan,
  hooks: AgentRunHooks = {},
  runtime: AgentRunRuntime = {},
): Promise<AgentResult> {
  if (plan.taskId !== task.id) throw new Error("The plan does not belong to this task");
  if (plan.mode === "fallback") return createFallbackResult(task);

  const issues = getLiveConfigurationIssues();
  if (issues.length > 0) throw new Error(`Live mode is not ready: ${issues.join(", ")}`);
  const summary = plan.milestones.map((milestone) => `- ${milestone.label}: ${milestone.detail}`).join("\n");
  const generate = runtime.generate ?? requestLivePatchOutput;
  const generated = await generate(task, summary, hooks.signal);
  if (hooks.signal?.aborted) throw new DOMException("The agent run was cancelled", "AbortError");
  assertSafeEdits(task, generated.output);
  hooks.onPatch?.({ edits: generated.output.edits });
  const checks = staticFixtureChecks(task, generated.output.edits);
  hooks.onCheckResults?.(checks);
  return resultFromOutput(task, generated.output, "live", checks, generated.usage);
}

export function completePlanMilestones(plan: AgentPlan): Milestone[] {
  let milestones = plan.milestones;
  for (const milestone of plan.milestones) milestones = completeMilestone(milestones, milestone.id);
  return milestones;
}
