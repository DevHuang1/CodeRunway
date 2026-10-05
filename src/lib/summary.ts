import type { AgentResult } from "@/lib/types";

export function buildRunSummary(result: AgentResult, takeaway = "") {
  const passed = result.checks.filter((check) => check.status === "passed").length;
  const summary = [
    "CodeRunway run summary",
    `Mode: ${result.mode === "live" ? "Nebius live provider" : "Deterministic fallback"}`,
    `Changed files: ${result.filesChanged.join(", ")}`,
    `Static fixture criteria: ${passed}/${result.checks.length} matched`,
    "Execution: no code or test process ran",
    `Next step: ${result.nextStep}`,
  ].join("\n");
  return takeaway.trim() ? `${summary}\nTakeaway: ${takeaway.trim()}` : summary;
}
