import { z } from "zod";
import { runAgent } from "@/lib/agent";
import { getDemoTask } from "@/lib/demo-data";
import { acquireLiveRequest, rateLimitResponse } from "@/lib/live-request-limiter";
import { getProviderSettings, getLiveConfigurationIssues, resolveAgentMode } from "@/lib/provider";
import { parseApprovedPlan } from "@/lib/validation";
import { readBoundedJson, RequestBodyTooLargeError } from "@/lib/request-json";
import type { AgentEvent, AgentPlan, CheckResult } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = z.object({ taskId: z.string().min(1).max(80), plan: z.unknown() }).strict();
const milestoneIds = ["understand", "plan", "generate", "inspect", "test", "verify"] as const;
const paceFallbackDemo = () => new Promise((resolve) => setTimeout(resolve, 90));

function safeRunError(error: unknown): { code: string; message: string } {
  const raw = error instanceof Error ? error.message : "";
  if (/output-token limit|truncated/i.test(raw)) return { code: "OUTPUT_TRUNCATED", message: "The model response reached its output limit. Try again with a shorter request; another attempt may incur usage charges." };
  if (/api.key|credential|configured|authentication/i.test(raw)) return { code: "PROVIDER_NOT_CONFIGURED", message: "Token Factory is not configured. Set the server-side NEBIUS_API_KEY or use fallback mode." };
  if (/timeout|timed out|time limit/i.test(raw)) return { code: "PROVIDER_TIMEOUT", message: "The Token Factory request timed out. A retry makes a new model request and may incur usage charges." };
  if (/unsafe|command|path/i.test(raw)) return { code: "UNSAFE_OUTPUT", message: "The model output was rejected because it exceeded the safe sample-workspace boundary." };
  if (/model.*(?:not found|invalid|unavailable)|model_not_found/i.test(raw)) return { code: "MODEL_UNAVAILABLE", message: "The configured Nemotron model is unavailable to this Token Factory account." };
  if (/429|rate.?limit|quota|insufficient/i.test(raw)) return { code: "PROVIDER_LIMIT", message: "Token Factory declined this request because an account limit was reached." };
  return { code: "AGENT_RUN_FAILED", message: "The run could not complete. Check the server configuration and try again." };
}

function writeEvent(controller: ReadableStreamDefaultController<Uint8Array>, encoder: TextEncoder, event: AgentEvent) {
  try { controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`)); return true; }
  catch { return false; }
}

function fileDiff(before: string, after: string, path: string) {
  return [
    `--- a/${path}`,
    `+++ b/${path}`,
    ...before.split("\n").map((line) => `-${line}`),
    ...after.split("\n").map((line) => `+${line}`),
  ].join("\n");
}

function allChecksPassed(checks: CheckResult[]) {
  return checks.length > 0 && checks.every((check) => check.status === "passed");
}

export async function POST(request: Request) {
  let body: z.infer<typeof requestSchema>;
  try { body = requestSchema.parse(await readBoundedJson(request)); }
  catch (error) {
    if (error instanceof RequestBodyTooLargeError) return Response.json({ error: "Request body is too large" }, { status: 413 });
    return Response.json({ error: "Expected taskId and the approved plan" }, { status: 400 });
  }

  const task = getDemoTask(body.taskId);
  if (!task) return Response.json({ error: "Unknown demo task" }, { status: 404 });

  let plan: AgentPlan;
  try { plan = parseApprovedPlan(body.plan); }
  catch { return Response.json({ error: "The approved plan is malformed" }, { status: 400 }); }
  const mode = resolveAgentMode();
  if (plan.taskId !== task.id || plan.id !== `plan-${task.id}-${mode}` || plan.mode !== mode) {
    return Response.json({ error: "The approved plan is stale, unapproved, or does not belong to this task" }, { status: 409 });
  }

  if (mode === "live" && getLiveConfigurationIssues().length > 0) {
    return Response.json({ error: "Live mode needs a valid server-side NEBIUS_API_KEY." }, { status: 503 });
  }
  const permit = mode === "live" ? acquireLiveRequest(request) : null;
  if (permit && !permit.allowed) return rateLimitResponse(permit);

  const settings = getProviderSettings();
  const encoder = new TextEncoder();
  const runAbort = new AbortController();
  const runSignal = AbortSignal.any([request.signal, runAbort.signal]);
  let streamClosed = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const emit = (event: AgentEvent) => {
        if (streamClosed || runSignal.aborted) return false;
        const written = writeEvent(controller, encoder, event);
        if (!written) streamClosed = true;
        return written;
      };
      const checkpoint = (index: number, evidence: string, state: "complete" | "failed" = "complete") => emit({
        type: "milestone_updated", milestoneId: milestoneIds[index], state,
        completedCount: state === "failed" ? index : index + 1,
        progress: state === "failed" ? Math.max(0, index - 1) * 20 : index * 20,
        evidence,
      });

      void (async () => {
        try {
          if (!emit({ type: "run_started", taskId: task.id, mode, model: mode === "live" ? settings.model : "Deterministic sample agent" })) return;
          checkpoint(0, "The fixed issue and expected outcome were loaded.");
          checkpoint(1, "The approved plan is attached to this run.");

          let patchAnnounced = false;
          const result = await runAgent(task, plan, {
            signal: runSignal,
            onPatch: ({ edits }) => {
              patchAnnounced = true;
              checkpoint(2, "The structured patch passed task and file-allowlist validation.");
              for (const edit of edits) {
                const before = task.files.find((file) => file.path === edit.path)?.before ?? "";
                emit({ type: "file_changed", path: edit.path, summary: edit.summary, diff: fileDiff(before, edit.after, edit.path) });
              }
              checkpoint(3, "The validated changed files are ready for review.");
            },
            onCheckResults: (checks) => {
              for (const check of checks) emit({ type: "check_result", result: check });
              checkpoint(4, "Static fixture criteria were checked; no code or test command was executed.");
            },
          });

          if (!patchAnnounced) {
            await paceFallbackDemo();
            checkpoint(2, "The deterministic patch is limited to the registered fixture files.");
            for (const path of result.filesChanged) emit({ type: "file_changed", path, summary: "Prepared a deterministic allowlisted fixture change.", diff: result.diffsByFile[path] ?? "" });
            await paceFallbackDemo();
            checkpoint(3, "The deterministic changed files are ready for review.");
            await paceFallbackDemo();
            for (const check of result.checks) emit({ type: "check_result", result: check });
            checkpoint(4, "Static fixture criteria were checked; no code or test command was executed.");
          }

          const passed = result.verification.status === "passed" && allChecksPassed(result.checks);
          if (!patchAnnounced) await paceFallbackDemo();
          if (passed) checkpoint(5, "All registered static fixture criteria matched; no code or tests were executed.");
          else checkpoint(5, "One or more static fixture criteria did not match; verification is incomplete.", "failed");
          emit({ type: "run_completed", result });
        } catch (error) {
          if (!runSignal.aborted) emit({ type: "run_error", ...safeRunError(error) });
        } finally {
          if (permit?.allowed) permit.release();
          if (!streamClosed) {
            streamClosed = true;
            try { controller.close(); } catch { /* Client cancelled while closing. */ }
          }
        }
      })();
    },
    cancel() { streamClosed = true; runAbort.abort(); },
  });

  return new Response(stream, { headers: {
    "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "Content-Type": "text/event-stream",
  } });
}
