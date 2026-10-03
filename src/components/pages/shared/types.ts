import type { AgentMode } from "@/lib/types";

export type RunState = "idle" | "planning" | "ready" | "running" | "paused" | "complete" | "error";

export interface ProviderStatus {
  mode: AgentMode;
  preference: string;
  configured: boolean;
  model: string;
  baseUrl: string;
}

export interface ActivityItem {
  label: string;
  detail: string;
  tone: "neutral" | "good" | "warn";
  kind: "activity" | "evidence";
}
