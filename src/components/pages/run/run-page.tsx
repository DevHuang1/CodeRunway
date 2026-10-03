"use client";

import { useRouter } from "next/navigation";
import { useCodeRunway } from "@/components/coderunway-provider";
import { getCheckpointLearning } from "@/lib/learning";
import { GoalGradient } from "./goal-gradient";
import { LearningDisclosure } from "@/components/pages/shared/learning-disclosure";
import { PageShell } from "@/components/pages/shared/page-shell";
import { StageGate } from "@/components/pages/shared/stage-gate";

function ActivityRows({ activities }: { activities: ReturnType<typeof useCodeRunway>["activities"] }) {
  if (activities.length === 0) return <p className="muted-copy">Nothing recorded yet.</p>;

  return (
    <div className="activity-list">
      {activities.map((activity, index) => (
        <div className="activity-row" key={`${activity.label}-${index}`}>
          <span className={`activity-icon ${activity.tone}`}>{activity.tone === "good" ? "✓" : activity.tone === "warn" ? "!" : "·"}</span>
          <div><strong>{activity.label}</strong><span>{activity.detail}</span></div>
        </div>
      ))}
    </div>
  );
}

export function RunPage() {
  const router = useRouter();
  const { milestones, progress, verifiedCheckpointCount, activities, provider, runMode, runState, planApproved, result, startRun, pauseRun } = useCodeRunway();
  const running = runState === "running";
  const complete = runState === "complete" && Boolean(result);
  const hasFailedResult = runState === "error" && Boolean(result);
  const activeMilestone = milestones.find((milestone) => milestone.state === "active")
    ?? milestones.find((milestone) => milestone.state !== "complete")
    ?? milestones[milestones.length - 1];
  const activeLearning = getCheckpointLearning(activeMilestone?.id ?? "verify");
  const evidenceActivities = activities.filter((activity) => activity.kind === "evidence").slice(-3).reverse();
  const agentActivities = activities.filter((activity) => activity.kind === "activity").slice(-3).reverse();

  return (
    <StageGate stage="run">
      <PageShell
        stage="run"
        eyebrow="THE RUN"
        title="Stay with the next checkpoint."
        description="The runway only moves when the sample workspace sends evidence. You can pause without losing your place or claiming progress."
      >
        <div className="page-grid page-grid-run">
          <section className="page-card run-card" aria-labelledby="run-title">
            <div className="page-card-heading">
              <div>
                <span className="eyebrow">EVIDENCE-BACKED PROGRESS</span>
                <h2 id="run-title">A little more clarity, one step at a time.</h2>
              </div>
              <span className="provider-chip"><i /> {runMode === "live" ? "Live connection" : "Local sample"}</span>
            </div>
            <GoalGradient progress={progress} milestones={milestones} />
            <LearningDisclosure title={activeLearning.concept}>
              <p><strong>Why it matters:</strong> {activeLearning.whyItMatters}</p>
              <p><strong>Look for:</strong> {activeLearning.lookFor}</p>
            </LearningDisclosure>
            <div className="page-actions">
              <button type="button" className="button button-quiet" onClick={() => router.push("/plan")} disabled={running}>Back to plan</button>
              {complete || hasFailedResult ? (
                <button type="button" className="button button-primary" onClick={() => router.push("/review")}>{hasFailedResult ? "Review the result" : "Review the change"} <span aria-hidden="true">→</span></button>
              ) : running ? (
                <button type="button" className="button button-quiet" onClick={pauseRun}>Pause the run <span aria-hidden="true">Ⅱ</span></button>
              ) : (
                <button type="button" className="button button-primary" onClick={() => void startRun()} disabled={!planApproved}>{runState === "paused" ? `Resume from checkpoint ${verifiedCheckpointCount + 1}` : runState === "error" ? "Try the run again" : "Start the run"}<span aria-hidden="true">→</span></button>
              )}
            </div>
          </section>

          <aside className="page-side-stack">
            <section className="page-note activity-card" aria-labelledby="activity-title">
              <div className="section-label-row"><span className="section-label" id="activity-title">Evidence received</span><span className="tiny-status">{verifiedCheckpointCount}/6 verified</span></div>
              <div aria-live="polite">
                <ActivityRows activities={evidenceActivities} />
                <div className="activity-divider" />
                <div className="section-label-row activity-subheading"><span className="section-label">Agent activity</span></div>
                <ActivityRows activities={agentActivities} />
              </div>
            </section>

            <section className="page-note" aria-label="Provider status">
              <div className="connection-card-top"><span className={`connection-mark ${runMode}`} /><div><span className="eyebrow">CONNECTION</span><strong>{runMode === "live" ? "Nebius Token Factory" : "Local sample mode"}</strong></div></div>
              <p className="connection-copy">{runMode === "live" ? provider?.model ?? "NVIDIA Nemotron" : "No network or API key is needed for this walkthrough."}</p>
            </section>
          </aside>
        </div>
      </PageShell>
    </StageGate>
  );
}
