import type { AgentMode } from "@/lib/types";

export type RunState = "idle" | "planning" | "ready" | "running" | "paused" | "cancelled" | "complete" | "error";

export interface ProviderStatus {
  mode: AgentMode;
  preference: string;
  configured: boolean;
  modelCredentialsConfigured?: boolean;
  model: string;
  baseUrl: string;
  liveReady?: boolean;
  limits?: {
    maxOutputTokens: number;
    timeoutMs: number;
    perClientPerMinute: number;
    perApplicationPerHour: number;
    concurrentRequests: number;
  };
}

export interface ActivityItem {
  label: string;
  detail: string;
  tone: "neutral" | "good" | "warn";
  kind: "activity" | "evidence";
}
