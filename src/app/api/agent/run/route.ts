import { z } from "zod";
import { createFallbackPlan, runAgent } from "@/lib/agent";
import { getDemoTask } from "@/lib/demo-data";
import { getProviderSettings, resolveAgentMode } from "@/lib/provider";
import type { AgentEvent, AgentPlan } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = z.object({
  taskId: z.string().min(1).max(80),
  planId: z.string().min(1).max(120),
});

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function safeRunError(error: unknown): { code: string; message: string } {
  const raw = error instanceof Error ? error.message : "The agent run could not finish";
  if (/api.key|credential|configured/i.test(raw)) {
    return { code: "PROVIDER_NOT_CONFIGURED", message: "Nebius is not configured. Switch to fallback mode or add a server-side API key." };
  }
  if (/timeout|timed out/i.test(raw)) {
    return { code: "PROVIDER_TIMEOUT", message: "The provider took too long to respond. Try the run again." };
  }
  if (/unsafe|command|path/i.test(raw)) {
    return { code: "UNSAFE_OUTPUT", message: "The agent output was rejected because it exceeded the safe sample-workspace boundary." };
  }
  return { code: "AGENT_RUN_FAILED", message: raw.slice(0, 240) };
}

function writeEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  event: AgentEvent,
) {
  try {
    controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`));
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Expected taskId and planId" }, { status: 400 });
  }

  const task = getDemoTask(body.taskId);
  if (!task) return Response.json({ error: "Unknown demo task" }, { status: 404 });

  const expectedPlanId = `plan-${task.id}-${resolveAgentMode()}`;
  if (body.planId !== expectedPlanId) {
    return Response.json({ error: "Plan is stale or does not belong to this task" }, { status: 409 });
  }

  const settings = getProviderSettings();
  const plan: AgentPlan = createFallbackPlan(task);
  const encoder = new TextEncoder();
  let streamClosed = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const emit = (event: AgentEvent) => {
        if (streamClosed) return false;
        const written = writeEvent(controller, encoder, event);
        if (!written) streamClosed = true;
        return written;
      };

      void (async () => {
        try {
          const mode = resolveAgentMode(settings);
          if (!emit({
            type: "run_started",
            taskId: task.id,
            mode,
            model: mode === "live" ? settings.model : "Deterministic sample agent",
          })) return;

          const result = await runAgent(task, plan);
          const allTestsPassed = result.tests.every((test) => test.status === "passed");
          const milestoneEvidence = [
            "The issue and expected outcome are confirmed.",
            "An ordered plan is ready for your approval.",
            "The agent produced an allowlisted file edit.",
            "The diff and explanation are visible for review.",
            "The registered tests returned their results.",
            allTestsPassed
              ? "All required checks passed and the diff is ready to review."
              : "The run finished, but one or more registered checks need attention before completion.",
          ];

          for (let index = 0; index < 6; index += 1) {
            await delay(120);
            const verificationFailed = index === 5 && !allTestsPassed;
            if (!emit({
              type: "milestone_updated",
              milestoneId: ["understand", "plan", "generate", "inspect", "test", "verify"][index],
              state: verificationFailed ? "failed" : "complete",
              completedCount: verificationFailed ? 5 : index + 1,
              progress: verificationFailed ? 80 : index * 20,
              evidence: milestoneEvidence[index],
            })) return;

            if (index === 2) {
              for (const path of result.filesChanged) {
                if (!emit({
                  type: "file_changed",
                  path,
                  summary: "Applied a focused, allowlisted fixture edit.",
                  diff: result.diffsByFile[path] ?? result.diff,
                })) return;
              }
            }

            if (index === 4) {
              for (const test of result.tests) {
                if (!emit({ type: "test_result", result: test })) return;
              }
            }
          }

          emit({ type: "run_completed", result });
        } catch (error) {
          const safeError = safeRunError(error);
          emit({ type: "run_error", ...safeError });
        } finally {
          if (!streamClosed) {
            streamClosed = true;
            try {
              controller.close();
            } catch {
              // The client may have cancelled the stream between the guard and close.
            }
          }
        }
      })();
    },
    cancel() {
      streamClosed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
    },
  });
}
