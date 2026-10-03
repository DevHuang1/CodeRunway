import type { AgentResult } from "@/lib/types";

export function buildRunSummary(result: AgentResult, takeaway = "") {
  const passed = result.tests.filter((test) => test.status === "passed").length;
  const summary = [
    "CodeRunway run summary",
    `Mode: ${result.mode === "live" ? "Nebius live provider" : "Deterministic fallback"}`,
    `Changed files: ${result.filesChanged.join(", ")}`,
    `Checks: ${passed}/${result.tests.length} passed`,
    `Next step: ${result.nextStep}`,
  ].join("\n");
  return takeaway.trim() ? `${summary}\nTakeaway: ${takeaway.trim()}` : summary;
}
