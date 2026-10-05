import { z } from "zod";
import { createPlan } from "@/lib/agent";
import { getDemoTask } from "@/lib/demo-data";
import { acquireLiveRequest, rateLimitResponse } from "@/lib/live-request-limiter";
import { getLiveConfigurationIssues, resolveAgentMode } from "@/lib/provider";
import { readBoundedJson, RequestBodyTooLargeError } from "@/lib/request-json";

export const dynamic = "force-dynamic";

const requestSchema = z.object({ taskId: z.string().min(1).max(80) }).strict();

export async function POST(request: Request) {
  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await readBoundedJson(request));
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return Response.json({ error: "Request body is too large" }, { status: 413 });
    }
    return Response.json(
      { error: "Expected a valid taskId" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const task = getDemoTask(body.taskId);
  if (!task) return Response.json({ error: "Unknown demo task" }, { status: 404 });

  const live = resolveAgentMode() === "live";
  if (live && getLiveConfigurationIssues().length > 0) {
    return Response.json({ error: "Live mode needs a valid server-side NEBIUS_API_KEY." }, { status: 503 });
  }
  const permit = live ? acquireLiveRequest(request) : null;
  if (permit && !permit.allowed) return rateLimitResponse(permit);

  try {
    const plan = await createPlan(task, request.signal);
    return Response.json(plan, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (request.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
      return Response.json({ error: "The planning request was stopped." }, { status: 499 });
    }
    const raw = error instanceof Error ? error.message : "";
    const message = /output-token limit|truncated/i.test(raw)
      ? "Nemotron reached the bounded plan-response limit. Try a more concise plan or increase the server-side output cap."
      : /timeout|timed out|time limit/i.test(raw)
        ? "Token Factory took too long to create the plan. A retry sends a new model request and may incur usage charges."
        : /invalid JSON|agent contract/i.test(raw)
          ? "Nemotron returned a plan that did not match the required structured format. Try again."
          : /model.*(?:not found|invalid|unavailable)|model_not_found/i.test(raw)
      ? "The configured Nemotron model is unavailable to this Token Factory account."
      : /429|rate.?limit|quota|insufficient/i.test(raw)
        ? "Token Factory declined the request because its account limit was reached. Check your Token Factory usage and billing settings."
        : "Token Factory could not create the plan. Check the server-side model configuration and try again.";
    return Response.json({ error: message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  } finally {
    if (permit?.allowed) permit.release();
  }
}
