"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { buildInitialMilestones } from "@/lib/progress";
import type { AgentEvent, AgentPlan, AgentResult, CheckResult, DemoTask, Milestone } from "@/lib/types";
import type { ActivityItem, ProviderStatus, RunState } from "@/components/pages/shared/types";
import { canVisitStage, type FlowStage } from "@/lib/flow";
import { mergeEvidenceProgress, mergeVerifiedCheckpointCount, shouldAcceptMilestoneEvidence } from "@/lib/run-progress";
import { buildRunSummary } from "@/lib/summary";

interface CodeRunwayContextValue {
  initialized: boolean;
  task: DemoTask | null;
  plan: AgentPlan | null;
  planApproved: boolean;
  milestones: Milestone[];
  provider: ProviderStatus | null;
  runState: RunState;
  progress: number;
  verifiedCheckpointCount: number;
  result: AgentResult | null;
  checks: CheckResult[];
  activities: ActivityItem[];
  error: string;
  announcement: string;
  summaryCopied: boolean;
  takeaway: string;
  runMode: "live" | "fallback";
  canVisit: (stage: FlowStage) => boolean;
  createPlan: () => Promise<boolean>;
  approvePlan: () => boolean;
  startRun: () => Promise<void>;
  pauseRun: () => void;
  stopRun: () => void;
  rejectPlan: () => void;
  resetSession: () => void;
  setTakeaway: (takeaway: string) => void;
  copySummary: () => Promise<boolean>;
}

const CodeRunwayContext = createContext<CodeRunwayContextValue | null>(null);

async function consumeEventStream(
  response: Response,
  onEvent: (event: AgentEvent) => void,
  signal: AbortSignal,
) {
  if (!response.body) throw new Error("The run did not contain a response body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (signal.aborted) return;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const dataLine = frame.split("\n").find((line) => line.startsWith("data: "));
      if (!dataLine) continue;
      onEvent(JSON.parse(dataLine.slice(6)) as AgentEvent);
    }
  }
}

function friendlyError(error: unknown) {
  return error instanceof Error ? error.message : "Something interrupted the run. Try again.";
}

const initialActivity: ActivityItem = {
  label: "Workspace ready",
  detail: "A safe sample is waiting for your first decision.",
  tone: "neutral",
  kind: "activity",
};

export function CodeRunwayProvider({ children }: { children: ReactNode }) {
  const [task, setTask] = useState<DemoTask | null>(null);
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [planApproved, setPlanApproved] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>(buildInitialMilestones());
  const [provider, setProvider] = useState<ProviderStatus | null>(null);
  const [runState, setRunState] = useState<RunState>("idle");
  const [progress, setProgress] = useState(0);
  const [verifiedCheckpointCount, setVerifiedCheckpointCount] = useState(0);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([initialActivity]);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("Workspace ready");
  const [initialized, setInitialized] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [takeaway, setTakeaway] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void Promise.all([
      fetch("/api/demo/tasks", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/health", { cache: "no-store" }).then((response) => response.json()),
    ])
      .then(([taskPayload, healthPayload]) => {
        setTask(taskPayload.tasks?.[0] ?? null);
        setProvider(healthPayload.provider ?? null);
      })
      .catch((loadError) => setError(friendlyError(loadError)))
      .finally(() => setInitialized(true));

    return () => abortRef.current?.abort();
  }, []);

  const addActivity = useCallback((item: ActivityItem) => {
    setActivities((current) => [...current.slice(-5), item]);
  }, []);

  const createPlan = useCallback(async () => {
    if (!task) return false;
    setRunState("planning");
    setError("");
    setPlan(null);
    setPlanApproved(false);
    setResult(null);
    setChecks([]);
    setSummaryCopied(false);
    setProgress(0);
    setVerifiedCheckpointCount(0);
    setTakeaway("");
    setMilestones(buildInitialMilestones());
    setAnnouncement("Making a plan from the issue");
    addActivity({ label: "Reading the issue", detail: "Turning the request into a finite, reviewable runway.", tone: "neutral", kind: "activity" });

    try {
      const response = await fetch("/api/agent/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "The plan could not be created");
      setPlan(payload as AgentPlan);
      setMilestones(payload.milestones as Milestone[]);
      setRunState("ready");
      setAnnouncement("Plan ready to review");
      addActivity({ label: "Plan ready", detail: "Look it over before anything changes.", tone: "good", kind: "activity" });
      return true;
    } catch (planError) {
      setRunState("error");
      setError(friendlyError(planError));
      setAnnouncement("The plan needs attention");
      addActivity({ label: "Plan interrupted", detail: friendlyError(planError), tone: "warn", kind: "activity" });
      return false;
    }
  }, [addActivity, task]);

  const approvePlan = useCallback(() => {
    if (!plan) return false;
    setPlanApproved(true);
    setRunState("ready");
    setAnnouncement("Plan approved; the run is ready when you are");
    addActivity({ label: "Plan approved", detail: "The run can begin when you choose to start it.", tone: "good", kind: "activity" });
    return true;
  }, [addActivity, plan]);

  const startRun = useCallback(async () => {
    if (!task || !plan || !planApproved) return;
    const retryingCancelledLive = runState === "cancelled" && plan.mode === "live";
    const resuming = runState === "paused" || retryingCancelledLive;
    const resumeFromCount = resuming ? verifiedCheckpointCount : 0;
    if (!resuming) {
      setProgress(0);
      setMilestones(plan.milestones);
      setChecks([]);
      setResult(null);
      setVerifiedCheckpointCount(0);
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setRunState("running");
    setError("");
    setAnnouncement(retryingCancelledLive ? "A new live request started" : resuming ? "The run resumed" : "The run started");
    addActivity({
      label: retryingCancelledLive ? "New live request started" : resuming ? "Run resumed" : "Run started",
      detail: resuming
        ? `Prior evidence for ${resumeFromCount} checkpoint${resumeFromCount === 1 ? "" : "s"} remains counted${retryingCancelledLive ? "; this sends another potentially billable model request" : ""}.`
        : "The model will return a patch for the fixed sample workspace.",
      tone: "neutral",
      kind: "activity",
    });

    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, plan }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "The run could not start");
      }

      await consumeEventStream(response, (event) => {
        if (event.type === "run_started") {
          setAnnouncement(`${event.mode === "live" ? "Live Token Factory" : "Local sample"} run started`);
          addActivity({ label: event.mode === "live" ? "Token Factory request started" : "Local sample ready", detail: event.model, tone: event.mode === "live" ? "good" : "neutral", kind: "activity" });
        }
        if (event.type === "milestone_updated") {
          if (!shouldAcceptMilestoneEvidence(event.completedCount, resumeFromCount)
            && !(event.state === "failed" && event.completedCount === verifiedCheckpointCount)) return;
          setProgress((current) => mergeEvidenceProgress(current, event.progress));
          setVerifiedCheckpointCount((current) => mergeVerifiedCheckpointCount(current, event.completedCount));
          setMilestones((current) => current.map((milestone) => {
            if (milestone.id === event.milestoneId) return { ...milestone, state: event.state, progress: event.progress };
            const index = current.findIndex((item) => item.id === event.milestoneId);
            const currentIndex = current.findIndex((item) => item.id === milestone.id);
            if (currentIndex < index) return { ...milestone, state: "complete", progress: event.progress };
            if (currentIndex === index + 1) return { ...milestone, state: "active" };
            return milestone;
          }));
          setAnnouncement(`${event.completedCount} of 6 checkpoints verified`);
          addActivity({ label: "Checkpoint verified", detail: event.evidence, tone: "good", kind: "evidence" });
        }
        if (event.type === "file_changed") {
          addActivity({ label: `Changed ${event.path}`, detail: event.summary, tone: "good", kind: "evidence" });
        }
        if (event.type === "check_result") {
          setChecks((current) => [...current.filter((check) => check.name !== event.result.name), event.result]);
          addActivity({ label: event.result.status === "passed" ? "Static check matched" : "Static check needs work", detail: event.result.name, tone: event.result.status === "passed" ? "good" : "warn", kind: "evidence" });
        }
        if (event.type === "run_completed") {
          const allChecksPassed = event.result.verification.status === "passed"
            && !event.result.verification.testsExecuted
            && event.result.checks.length > 0
            && event.result.checks.every((check) => check.status === "passed");
          setResult(event.result);
          setChecks(event.result.checks);
          if (allChecksPassed) {
            setProgress(100);
            setVerifiedCheckpointCount(6);
            setRunState("complete");
            setAnnouncement("Static fixture checks matched");
            addActivity({ label: "Fixture criteria matched", detail: event.result.nextStep, tone: "good", kind: "evidence" });
          } else {
            setProgress((current) => Math.min(current, 80));
            setVerifiedCheckpointCount((current) => Math.min(current, 5));
            setRunState("error");
            setAnnouncement("The run needs attention");
            addActivity({ label: "Checks need attention", detail: event.result.nextStep, tone: "warn", kind: "evidence" });
          }
        }
        if (event.type === "run_error") {
          setRunState("error");
          setError(event.message);
          setAnnouncement("The run needs attention");
          addActivity({ label: event.code, detail: event.message, tone: "warn", kind: "activity" });
        }
      }, controller.signal);
      if (controller.signal.aborted) throw new Error("Run paused");
    } catch (runError) {
      if (controller.signal.aborted) {
        const live = plan?.mode === "live";
        setRunState(live ? "cancelled" : "paused");
        setAnnouncement(live ? "Live request stopped" : "Run paused");
        addActivity({ label: live ? "Live request stopped" : "Run paused", detail: live ? "The app stopped waiting where possible. Token Factory may already have processed and billed part of this request; retrying sends another request." : "The local stream stopped safely and verified checkpoints remain counted.", tone: "neutral", kind: "activity" });
      } else {
        setRunState("error");
        setError(friendlyError(runError));
        setAnnouncement("The run needs attention");
        addActivity({ label: "Run interrupted", detail: friendlyError(runError), tone: "warn", kind: "activity" });
      }
    } finally {
      abortRef.current = null;
    }
  }, [addActivity, plan, planApproved, runState, task, verifiedCheckpointCount]);

  const pauseRun = useCallback(() => abortRef.current?.abort(), []);
  const stopRun = useCallback(() => abortRef.current?.abort(), []);

  const rejectPlan = useCallback(() => {
    setPlan(null);
    setPlanApproved(false);
    setRunState("idle");
    setProgress(0);
    setVerifiedCheckpointCount(0);
    setTakeaway("");
    setMilestones(buildInitialMilestones());
    setSummaryCopied(false);
    setAnnouncement("Plan set aside; no changes were made");
    addActivity({ label: "Plan set aside", detail: "The sample workspace is unchanged.", tone: "neutral", kind: "activity" });
  }, [addActivity]);

  const resetSession = useCallback(() => {
    abortRef.current?.abort();
    setPlan(null);
    setPlanApproved(false);
    setResult(null);
    setChecks([]);
    setRunState("idle");
    setProgress(0);
    setVerifiedCheckpointCount(0);
    setMilestones(buildInitialMilestones());
    setError("");
    setSummaryCopied(false);
    setTakeaway("");
    setActivities([initialActivity]);
    setAnnouncement("Workspace ready");
  }, []);

  const copySummary = useCallback(async () => {
    if (!result || !navigator.clipboard) return false;
    try {
      await navigator.clipboard.writeText(buildRunSummary(result, takeaway));
      setSummaryCopied(true);
      window.setTimeout(() => setSummaryCopied(false), 1800);
      return true;
    } catch {
      setSummaryCopied(false);
      return false;
    }
  }, [result, takeaway]);

  const canVisit = useCallback((stage: FlowStage) => {
    return canVisitStage(stage, {
      hasPlan: Boolean(plan),
      planApproved,
      hasResult: Boolean(result),
    });
  }, [plan, planApproved, result]);

  const runMode = result?.mode ?? plan?.mode ?? provider?.mode ?? "fallback";

  return (
    <CodeRunwayContext.Provider value={{
      initialized,
      task,
      plan,
      planApproved,
      milestones,
      provider,
      runState,
      progress,
      verifiedCheckpointCount,
      result,
      checks,
      activities,
      error,
      announcement,
      summaryCopied,
      takeaway,
      runMode,
      canVisit,
      createPlan,
      approvePlan,
      startRun,
      pauseRun,
      stopRun,
      rejectPlan,
      resetSession,
      setTakeaway,
      copySummary,
    }}>
      {children}
    </CodeRunwayContext.Provider>
  );
}

export function useCodeRunway() {
  const context = useContext(CodeRunwayContext);
  if (!context) throw new Error("useCodeRunway must be used inside CodeRunwayProvider");
  return context;
}
