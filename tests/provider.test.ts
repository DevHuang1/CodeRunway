import { afterEach, describe, expect, it, vi } from "vitest";
import { DEMO_TASK } from "@/lib/demo-data";
import { requestLivePlanOutput } from "@/lib/provider";

const planOutput = {
  goal: "Add accessible password strength feedback and regression coverage.",
  milestones: [
    { id: "understand", label: "Understand the issue", detail: "Review the requested password guidance.", evidence: "Expected behavior is identified." },
    { id: "plan", label: "Plan the change", detail: "Choose validation and feedback steps.", evidence: "All six checkpoints are defined." },
    { id: "generate", label: "Prepare the patch", detail: "Update the allowlisted sample files.", evidence: "Structured edits match approved paths." },
    { id: "inspect", label: "Inspect the diff", detail: "Review changes and explanations.", evidence: "Changed files are ready to review." },
    { id: "test", label: "Check fixture criteria", detail: "Compare content with static conditions.", evidence: "No code or test process runs." },
    { id: "verify", label: "Review the outcome", detail: "Confirm evidence and choose next steps.", evidence: "Static results are reported honestly." },
  ],
};

describe("Token Factory planning request", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("disables Nemotron reasoning and allows a complete plan within the hard output ceiling", async () => {
    vi.stubEnv("NEBIUS_API_KEY", "test-only-key");
    let sentBody: Record<string, unknown> | undefined;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const body = typeof init?.body === "string"
        ? init.body
        : input instanceof Request
          ? await input.clone().text()
          : String(init?.body ?? "");
      sentBody = JSON.parse(body) as Record<string, unknown>;

      return new Response(JSON.stringify({
        id: "chatcmpl-test",
        object: "chat.completion",
        created: 1,
        model: "nvidia/Nemotron-3_5-Lightning",
        choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: JSON.stringify(planOutput) } }],
        usage: { prompt_tokens: 100, completion_tokens: 300, total_tokens: 400 },
      }), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestLivePlanOutput(DEMO_TASK);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(sentBody).toMatchObject({
      model: "nvidia/Nemotron-3_5-Lightning",
      max_tokens: 8_192,
      chat_template_kwargs: { enable_thinking: false },
      response_format: { type: "json_object" },
    });
    expect(result.output.milestones).toHaveLength(6);
    expect(result.usage?.outputTokens).toBe(300);
  });

  it("rejects truncated provider output with an actionable signal", async () => {
    vi.stubEnv("NEBIUS_API_KEY", "test-only-key");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      id: "chatcmpl-truncated",
      object: "chat.completion",
      created: 1,
      model: "nvidia/Nemotron-3_5-Lightning",
      choices: [{ index: 0, finish_reason: "length", message: { role: "assistant", content: "{\"goal\":" } }],
      usage: { prompt_tokens: 100, completion_tokens: 2, total_tokens: 102 },
    }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestLivePlanOutput(DEMO_TASK)).rejects.toThrow(/output-token limit/i);
  });
});
