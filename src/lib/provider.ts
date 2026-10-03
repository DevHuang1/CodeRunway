import OpenAI from "openai";
import { assertSafeEdits, parseModelAgentOutput } from "@/lib/validation";
import type { AgentPreference, DemoTask, ModelAgentOutput } from "@/lib/types";

const DEFAULT_BASE_URL = "https://api.tokenfactory.nebius.com/v1";
const DEFAULT_MODEL = "nvidia/Nemotron-3_5-Lightning";

export interface ProviderSettings {
  preference: AgentPreference;
  apiKey: string;
  baseUrl: string;
  model: string;
  maxSteps: number;
  maxOutputTokens: number;
  timeoutMs: number;
}

export function getProviderSettings(): ProviderSettings {
  const preference = (process.env.AGENT_MODE ?? "auto") as AgentPreference;
  const validPreference: AgentPreference = ["auto", "live", "fallback"].includes(preference)
    ? preference
    : "auto";

  return {
    preference: validPreference,
    apiKey: process.env.NEBIUS_API_KEY?.trim() ?? "",
    baseUrl: process.env.NEBIUS_BASE_URL?.trim() || DEFAULT_BASE_URL,
    model: process.env.NEBIUS_MODEL?.trim() || DEFAULT_MODEL,
    maxSteps: readBoundedNumber(process.env.MAX_AGENT_STEPS, 6, 1, 6),
    maxOutputTokens: readBoundedNumber(process.env.MAX_OUTPUT_TOKENS, 1200, 200, 4000),
    timeoutMs: readBoundedNumber(process.env.REQUEST_TIMEOUT_MS, 30_000, 2_000, 60_000),
  };
}

function readBoundedNumber(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function resolveAgentMode(settings = getProviderSettings()): "live" | "fallback" {
  if (settings.preference === "fallback") return "fallback";
  if (settings.preference === "live") return "live";
  return settings.apiKey ? "live" : "fallback";
}

export function getSafeProviderStatus() {
  const settings = getProviderSettings();
  const mode = resolveAgentMode(settings);
  return {
    mode,
    preference: settings.preference,
    configured: Boolean(settings.apiKey),
    model: settings.model,
    baseUrl: settings.baseUrl,
    limits: {
      maxSteps: settings.maxSteps,
      maxOutputTokens: settings.maxOutputTokens,
      timeoutMs: settings.timeoutMs,
    },
  };
}

function createClient(settings: ProviderSettings): OpenAI {
  if (!settings.apiKey) {
    throw new Error("NEBIUS_API_KEY is not configured");
  }
  return new OpenAI({
    apiKey: settings.apiKey,
    baseURL: settings.baseUrl,
    timeout: settings.timeoutMs,
    maxRetries: 0,
  });
}

function buildPrompt(task: DemoTask, planSummary?: string): string {
  const files = task.files
    .map((file) => `FILE: ${file.path}\n${file.before}`)
    .join("\n\n");

  return `You are the coding engine for CodeRunway. Work only on this small sample task.

TASK: ${task.title}
CONTEXT: ${task.description}
EXPECTED OUTCOME: ${task.expectedOutcome}
${planSummary ? `APPROVED PLAN:\n${planSummary}` : "Create the plan first."}

${files}

Return one JSON object and no markdown with this exact shape:
{
  "goal": "short user-facing goal",
  "milestones": [{"id":"understand|plan|generate|inspect|test|verify","label":"...","detail":"...","evidence":"..."}],
  "edits": [{"path":"one of the FILE paths above","after":"complete replacement file contents","summary":"what changed"}],
  "explanation": "plain-language explanation",
  "tests": [{"name":"test name","details":"what the fixed evaluator should verify"}]
}

Produce no shell commands, dependencies, arbitrary paths, secrets, or instructions to execute code. Keep edits focused on the task.`;
}

export async function requestLiveAgentOutput(
  task: DemoTask,
  planSummary?: string,
): Promise<{ output: ModelAgentOutput; usage?: { inputTokens?: number; outputTokens?: number } }> {
  const settings = getProviderSettings();
  const client = createClient(settings);
  const completion = await client.chat.completions.create({
    model: settings.model,
    temperature: 0.1,
    max_tokens: settings.maxOutputTokens,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You produce safe, reviewable coding-agent artifacts. Follow the requested JSON contract exactly and never invent shell commands.",
      },
      { role: "user", content: buildPrompt(task, planSummary) },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Nebius returned an empty model response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content.replace(/^```json\s*/i, "").replace(/\s*```$/, ""));
  } catch {
    throw new Error("Nebius returned invalid JSON for the agent contract");
  }

  const output = parseModelAgentOutput(parsed);
  assertSafeEdits(task, output);
  return {
    output,
    usage: {
      inputTokens: completion.usage?.prompt_tokens,
      outputTokens: completion.usage?.completion_tokens,
    },
  };
}
