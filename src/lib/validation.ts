import { z } from "zod";
import type { DemoTask, ModelAgentOutput } from "@/lib/types";

const modelMilestoneSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().min(1).max(80),
  detail: z.string().min(1).max(240),
  evidence: z.string().min(1).max(240),
});

const modelEditSchema = z.object({
  path: z.string().min(1).max(160),
  after: z.string().max(30_000),
  summary: z.string().min(1).max(240),
});

export const modelAgentOutputSchema = z.object({
  goal: z.string().min(1).max(500),
  milestones: z.array(modelMilestoneSchema).min(1).max(6),
  edits: z.array(modelEditSchema).min(1).max(8),
  explanation: z.string().min(1).max(1_000),
  tests: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        details: z.string().min(1).max(300),
      }),
    )
    .min(1)
    .max(8),
});

export function parseModelAgentOutput(value: unknown): ModelAgentOutput {
  return modelAgentOutputSchema.parse(value);
}

export function assertSafeEdits(task: DemoTask, output: ModelAgentOutput): void {
  const allowed = new Set(task.files.map((file) => file.path));
  for (const edit of output.edits) {
    if (!allowed.has(edit.path)) {
      throw new Error(`Unsafe edit path rejected: ${edit.path}`);
    }
    if (/\b(?:bash|sh|zsh|powershell|cmd|exec|spawn|child_process)\b/i.test(edit.after)) {
      throw new Error("Unsafe command content rejected from model output");
    }
  }
}
