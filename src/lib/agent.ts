import { DEMO_TASK, getAllowedPaths } from "@/lib/demo-data";
import {
  buildInitialMilestones,
  completeMilestone,
  MILESTONE_BLUEPRINT,
  progressForCompletedCount,
} from "@/lib/progress";
import { getProviderSettings, requestLiveAgentOutput, resolveAgentMode } from "@/lib/provider";
import { assertSafeEdits } from "@/lib/validation";
import type {
  AgentPlan,
  AgentResult,
  DemoTask,
  Milestone,
  ModelAgentOutput,
  TestResult,
} from "@/lib/types";

export function createFallbackPlan(task: DemoTask = DEMO_TASK): AgentPlan {
  return {
    id: `plan-${task.id}-fallback`,
    taskId: task.id,
    goal: task.expectedOutcome,
    mode: "fallback",
    model: "Deterministic sample agent",
    milestones: buildInitialMilestones(),
    createdAt: new Date().toISOString(),
  };
}

function normalizeMilestones(output: ModelAgentOutput): Milestone[] {
  const provided = new Map(output.milestones.map((milestone) => [milestone.id, milestone]));
  return MILESTONE_BLUEPRINT.map((blueprint, index) => {
    const modelMilestone = provided.get(blueprint.id);
    return {
      id: blueprint.id,
      label: modelMilestone?.label || blueprint.label,
      detail: modelMilestone?.detail || blueprint.detail,
      evidence: modelMilestone?.evidence || blueprint.evidence,
      state: index === 0 ? "active" : "pending",
      progress: index === 0 ? 0 : progressForCompletedCount(index),
    };
  });
}

export function createPlanFromLiveOutput(task: DemoTask, output: ModelAgentOutput): AgentPlan {
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

export async function createPlan(task: DemoTask): Promise<AgentPlan> {
  if (resolveAgentMode() === "fallback") return createFallbackPlan(task);
  const { output } = await requestLiveAgentOutput(task);
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

function fixedEvaluator(task: DemoTask, edits: ModelAgentOutput["edits"]): TestResult[] {
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
      details: "The password field exposes a status and associates an inline explanation.",
    },
    {
      name: "Weak password guidance",
      status: signup.includes("Use at least 8 characters") ? "passed" : "failed",
      details: "Weak input receives a visible, actionable minimum-length message.",
    },
    {
      name: "Regression coverage",
      status: tests.includes("Use at least 8 characters") ? "passed" : "failed",
      details: "The expected weak-password behavior is represented in the fixture test.",
    },
  ];
}

function resultFromOutput(task: DemoTask, output: ModelAgentOutput, usage?: AgentResult["usage"]): AgentResult {
  assertSafeEdits(task, output);
  const allowed = getAllowedPaths(task);
  const edits = output.edits.filter((edit) => allowed.has(edit.path));
  const filesChanged = edits.map((edit) => edit.path);
  const diffs = edits.map((edit) => {
    const source = task.files.find((file) => file.path === edit.path);
    return source ? diffForFile(edit.path, source.before, edit.after) : "";
  });
  const diffsByFile = Object.fromEntries(
    edits.map((edit) => {
      const source = task.files.find((file) => file.path === edit.path);
      return [edit.path, source ? diffForFile(edit.path, source.before, edit.after) : ""];
    }),
  );
  const tests = fixedEvaluator(task, edits);
  const allPassed = tests.every((test) => test.status === "passed");

  return {
    mode: "live",
    model: getProviderSettings().model,
    explanation: output.explanation,
    filesChanged,
    diffsByFile,
    diff: diffs.filter(Boolean).join("\n\n"),
    tests,
    nextStep: allPassed
      ? "Review the diff once more, then carry the same change into your real repository."
      : "Review the failed evidence and refine the patch before treating the task as complete.",
    usage,
  };
}

export function createFallbackResult(task: DemoTask = DEMO_TASK): AgentResult {
  const edits = task.files.map((file) => ({
    path: file.path,
    after: file.after,
    summary: file.path.includes("test")
      ? "Added coverage for weak-password guidance."
      : "Added strength calculation, accessible feedback, and submit protection.",
  }));
  const tests = fixedEvaluator(task, edits);
  const diffsByFile = Object.fromEntries(
    edits.map((edit) => {
      const source = task.files.find((file) => file.path === edit.path);
      return [edit.path, source ? diffForFile(edit.path, source.before, edit.after) : ""];
    }),
  );
  return {
    mode: "fallback",
    model: "Deterministic sample agent",
    explanation:
      "The sample agent adds a small password-strength helper, exposes its result to assistive technology, prevents submission for weak input, and documents the behavior with a regression test.",
    filesChanged: edits.map((edit) => edit.path),
    diffsByFile,
    diff: edits.map((edit) => {
      const source = task.files.find((file) => file.path === edit.path);
      return source ? diffForFile(edit.path, source.before, edit.after) : "";
    }).join("\n\n"),
    tests,
    nextStep: "Review the verified diff, then carry the same focused change into your real repository.",
  };
}

export async function runAgent(task: DemoTask, plan: AgentPlan): Promise<AgentResult> {
  if (plan.taskId !== task.id) throw new Error("The plan does not belong to this task");
  if (resolveAgentMode() === "fallback") return createFallbackResult(task);

  const summary = plan.milestones.map((milestone) => `- ${milestone.label}: ${milestone.detail}`).join("\n");
  const { output, usage } = await requestLiveAgentOutput(task, summary);
  return resultFromOutput(task, output, usage);
}

export function completePlanMilestones(plan: AgentPlan): Milestone[] {
  let milestones = plan.milestones;
  for (const milestone of plan.milestones) milestones = completeMilestone(milestones, milestone.id);
  return milestones;
}
