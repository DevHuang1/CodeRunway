import { z } from "zod";
import type { AgentPlan, DemoTask, ModelPatchOutput, ModelPlanOutput } from "@/lib/types";

const unsafeCommandPattern = /\b(?:bash|sh|zsh|powershell|cmd|exec|spawn|child_process)\b/i;

const milestoneSchema = z.object({
  id: z.enum(["understand", "plan", "generate", "inspect", "test", "verify"]),
  label: z.string().min(1).max(80),
  detail: z.string().min(1).max(240),
  evidence: z.string().min(1).max(240),
  state: z.enum(["pending", "active", "complete", "failed"]),
  progress: z.number().int().min(0).max(100),
}).strict();

export const approvedPlanSchema = z.object({
  id: z.string().min(1).max(120),
  taskId: z.string().min(1).max(80),
  goal: z.string().min(1).max(500),
  mode: z.enum(["live", "fallback"]),
  model: z.string().min(1).max(120),
  milestones: z.array(milestoneSchema).length(6),
  createdAt: z.string().datetime(),
}).strict();

const modelMilestoneSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().min(1).max(80),
  detail: z.string().min(1).max(240),
  evidence: z.string().min(1).max(240),
}).strict();

const modelEditSchema = z.object({
  path: z.string().min(1).max(160),
  after: z.string().max(30_000),
  summary: z.string().min(1).max(240),
}).strict();

export const modelPlanOutputSchema = z.object({
  goal: z.string().min(1).max(500),
  milestones: z.array(modelMilestoneSchema).min(1).max(6),
}).strict();

export const modelPatchOutputSchema = z.object({
  edits: z.array(modelEditSchema).min(1).max(8),
  explanation: z.string().min(1).max(1_000),
}).strict();

export function parseModelPlanOutput(value: unknown): ModelPlanOutput {
  return modelPlanOutputSchema.parse(value);
}

export function assertSafePlanText(output: ModelPlanOutput): void {
  const content = [output.goal, ...output.milestones.flatMap((milestone) => [milestone.label, milestone.detail, milestone.evidence])];
  if (content.some((text) => unsafeCommandPattern.test(text))) {
    throw new Error("Unsafe command content rejected from model output");
  }
}

export function parseModelPatchOutput(value: unknown): ModelPatchOutput {
  return modelPatchOutputSchema.parse(value);
}

export function parseApprovedPlan(value: unknown): AgentPlan {
  return approvedPlanSchema.parse(value);
}

export function assertSafeEdits(task: DemoTask, output: ModelPatchOutput): void {
  const allowed = new Set(task.files.map((file) => file.path));
  const userFacingContent = [output.explanation, ...output.edits.map((edit) => edit.summary)];
  if (userFacingContent.some((content) => unsafeCommandPattern.test(content))) {
    throw new Error("Unsafe command content rejected from model output");
  }
  for (const edit of output.edits) {
    if (!allowed.has(edit.path)) {
      throw new Error(`Unsafe edit path rejected: ${edit.path}`);
    }
    if (unsafeCommandPattern.test(edit.after)) {
      throw new Error("Unsafe command content rejected from model output");
    }
  }
}
