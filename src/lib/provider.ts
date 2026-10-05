import OpenAI from "openai";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import { assertSafeEdits, assertSafePlanText, parseModelPatchOutput, parseModelPlanOutput } from "@/lib/validation";
import type { AgentPreference, DemoTask, ModelPatchOutput, ModelPlanOutput } from "@/lib/types";

const TOKEN_FACTORY_BASE_URL = "https://api.tokenfactory.nebius.com/v1";
const DEFAULT_MODEL = "nvidia/Nemotron-3_5-Lightning";
const MAX_OUTPUT_TOKENS = 8_192;
const MAX_REQUEST_TIMEOUT_MS = 120_000;

export const LIVE_REQUEST_LIMITS = {
  perClientPerMinute: 5,
  perApplicationPerHour: 20,
  concurrentRequests: 2,
} as const;

export interface ProviderSettings {
  preference: AgentPreference;
  apiKey: string;
  model: string;
  maxOutputTokens: number;
  timeoutMs: number;
}

function readBoundedNumber(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function getProviderSettings(): ProviderSettings {
  const preference = (process.env.AGENT_MODE ?? "auto") as AgentPreference;
  const validPreference: AgentPreference = ["auto", "live", "fallback"].includes(preference)
    ? preference
    : "auto";

  return {
    preference: validPreference,
    apiKey: process.env.NEBIUS_API_KEY?.trim() ?? "",
    model: DEFAULT_MODEL,
    maxOutputTokens: readBoundedNumber(process.env.MAX_OUTPUT_TOKENS, MAX_OUTPUT_TOKENS, 200, MAX_OUTPUT_TOKENS),
    timeoutMs: readBoundedNumber(process.env.REQUEST_TIMEOUT_MS, MAX_REQUEST_TIMEOUT_MS, 2_000, MAX_REQUEST_TIMEOUT_MS),
  };
}

export function resolveAgentMode(settings = getProviderSettings()): "live" | "fallback" {
  if (settings.preference === "fallback") return "fallback";
  if (settings.preference === "live") return "live";
  return settings.apiKey ? "live" : "fallback";
}

export function getLiveConfigurationIssues(settings = getProviderSettings()): string[] {
  return settings.apiKey ? [] : ["NEBIUS_API_KEY is missing"];
}

export function getSafeProviderStatus() {
  const settings = getProviderSettings();
  const configured = Boolean(settings.apiKey);
  return {
    mode: resolveAgentMode(settings),
    preference: settings.preference,
    configured,
    modelCredentialsConfigured: configured,
    model: settings.model,
    baseUrl: TOKEN_FACTORY_BASE_URL,
    liveReady: configured,
    limits: {
      maxOutputTokens: settings.maxOutputTokens,
      timeoutMs: settings.timeoutMs,
      ...LIVE_REQUEST_LIMITS,
    },
  };
}

function createClient(settings: ProviderSettings): OpenAI {
  if (!settings.apiKey) throw new Error("NEBIUS_API_KEY is not configured");
  return new OpenAI({
    apiKey: settings.apiKey,
    baseURL: TOKEN_FACTORY_BASE_URL,
    timeout: settings.timeoutMs,
    maxRetries: 0,
  });
}

async function requestJson<T>(
  prompt: string,
  maxTokens: number,
  parse: (value: unknown) => T,
  signal?: AbortSignal,
): Promise<{ output: T; usage?: { inputTokens?: number; outputTokens?: number } }> {
  const settings = getProviderSettings();
  const requestBody: ChatCompletionCreateParamsNonStreaming & {
    chat_template_kwargs: { enable_thinking: false };
  } = {
    model: settings.model,
    temperature: 0.1,
    max_tokens: Math.min(maxTokens, settings.maxOutputTokens),
    chat_template_kwargs: { enable_thinking: false },
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You produce safe, reviewable coding-agent artifacts. Follow the requested JSON contract exactly and never invent shell commands.",
      },
      { role: "user", content: prompt },
    ],
  };
  const completion = await createClient(settings).chat.completions.create(requestBody, { signal });

  const choice = completion.choices[0];
  if (choice?.finish_reason === "length") {
    throw new Error("Nebius response exceeded the configured output-token limit");
  }
  const content = choice?.message?.content;
  if (!content) throw new Error("Nebius returned an empty model response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content.replace(/^```json\s*/i, "").replace(/\s*```$/, ""));
  } catch {
    throw new Error("Nebius returned invalid JSON for the agent contract");
  }

  return {
    output: parse(parsed),
    usage: {
      inputTokens: completion.usage?.prompt_tokens,
      outputTokens: completion.usage?.completion_tokens,
    },
  };
}

export function requestLivePlanOutput(
  task: DemoTask,
  signal?: AbortSignal,
): Promise<{ output: ModelPlanOutput; usage?: { inputTokens?: number; outputTokens?: number } }> {
  const prompt = `Create a short, reviewable plan for this fixed sample issue.

TASK: ${task.title}
CONTEXT: ${task.description}
EXPECTED OUTCOME: ${task.expectedOutcome}

Return one JSON object with exactly this shape:
{
  "goal": "short user-facing goal",
  "milestones": [{"id":"understand|plan|generate|inspect|test|verify","label":"...","detail":"...","evidence":"..."}]
}

Include all six milestone IDs exactly once. Keep the goal under 20 words, each label under 6 words, and each detail and evidence under 12 words. The test checkpoint is a static fixture inspection only; no code or test process is run. Do not include edits, commands, dependencies, or extra keys.`;
  return requestJson(prompt, MAX_OUTPUT_TOKENS, (value) => {
    const output = parseModelPlanOutput(value);
    assertSafePlanText(output);
    return output;
  }, signal);
}

export function requestLivePatchOutput(
  task: DemoTask,
  planSummary: string,
  signal?: AbortSignal,
): Promise<{ output: ModelPatchOutput; usage?: { inputTokens?: number; outputTokens?: number } }> {
  const files = task.files.map((file) => `FILE: ${file.path}\n${file.before}`).join("\n\n");
  const prompt = `Produce a focused patch for this fixed sample issue. The user approved this plan:
${planSummary}

TASK: ${task.title}
CONTEXT: ${task.description}
EXPECTED OUTCOME: ${task.expectedOutcome}

${files}

Preserve the exported API names passwordStrength, PasswordFeedback, and SignupForm. Keep accessible strength feedback, weak-password guidance, and regression coverage in the registered fixture files. The changed files will be compared with deterministic static fixture criteria. No code or test process will execute.

Return one JSON object with exactly this shape:
{
  "edits": [{"path":"one of the FILE paths above","after":"complete replacement file contents","summary":"what changed"}],
  "explanation": "plain-language explanation"
}

Return exactly two edits, one for each FILE path above, with complete replacement contents. The complete src/signup.tsx source must contain the exact case-sensitive strings "aria-describedby", "aria-invalid", and "Strength" in its accessible password feedback markup: put the two aria attributes on the password input and render the capitalized label "Strength" visibly. Also include the exact visible text "Use at least 8 characters". In src/signup.test.tsx, include a regression expectation for that exact text. Preserve existing exports and unrelated behavior.

Produce no shell commands, dependencies, arbitrary paths, secrets, or instructions to execute code. Keep each file summary under 12 words and the explanation under 50 words. Return only the JSON object, with no markdown fences.`;

  return requestJson(prompt, MAX_OUTPUT_TOKENS, (value) => {
    const output = parseModelPatchOutput(value);
    assertSafeEdits(task, output);
    return output;
  }, signal);
}
