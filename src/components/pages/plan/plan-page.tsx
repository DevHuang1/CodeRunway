"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCodeRunway } from "@/components/coderunway-provider";
import { getCheckpointLearning } from "@/lib/learning";
import { LearningDisclosure } from "@/components/pages/shared/learning-disclosure";
import { PageShell } from "@/components/pages/shared/page-shell";
import { StageGate } from "@/components/pages/shared/stage-gate";

export function PlanPage() {
  const router = useRouter();
  const { plan, milestones, planApproved, approvePlan, rejectPlan } = useCodeRunway();
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const selectedMilestone = milestones.find((milestone) => milestone.id === selectedMilestoneId)
    ?? milestones.find((milestone) => milestone.state === "active")
    ?? milestones[0];
  const selectedLearning = getCheckpointLearning(selectedMilestone?.id ?? "understand");

  function handleApprove() {
    if (approvePlan()) router.push("/run");
  }

  function handleReject() {
    rejectPlan();
    router.push("/issue");
  }

  return (
    <StageGate stage="plan">
      <PageShell
        stage="plan"
        eyebrow="THE PLAN"
        title="Make the path visible."
        description="Read the checkpoints and the evidence behind them before anything changes. You can set this plan aside at any time."
      >
        <section className="page-card page-card-plan" aria-labelledby="plan-card-title">
          <div className="page-card-heading">
            <div>
              <span className="eyebrow">YOUR PROPOSED PATH</span>
              <h2 id="plan-card-title">{plan?.goal ?? "A focused change"}</h2>
            </div>
            <span className="provider-chip"><i /> {plan?.mode === "live" ? plan.model : "Local sample plan"}</span>
          </div>

          <div className="milestone-list plan-checkpoints" aria-label="Plan checkpoints">
            {milestones.map((milestone, index) => (
              <button
                type="button"
                className={`milestone-row ${milestone.state} ${selectedMilestone?.id === milestone.id ? "selected" : ""}`}
                key={milestone.id}
                aria-pressed={selectedMilestone?.id === milestone.id}
                aria-label={`Inspect ${milestone.label} checkpoint`}
                onClick={() => setSelectedMilestoneId(milestone.id)}
              >
                <span className="milestone-number" aria-hidden="true">{milestone.state === "complete" ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <span className="milestone-copy"><strong>{milestone.label}</strong><span>{milestone.detail}</span></span>
                <span className="milestone-state">{milestone.state === "complete" ? "seen" : milestone.state === "active" ? "next" : "later"}</span>
              </button>
            ))}
          </div>

          {selectedMilestone ? (
            <div className="checkpoint-detail" aria-live="polite">
              <div>
                <span className="eyebrow">CHECKPOINT EVIDENCE</span>
                <strong>{selectedMilestone.label}</strong>
              </div>
              <p>{selectedMilestone.evidence}</p>
            </div>
          ) : null}

          {selectedMilestone ? (
            <LearningDisclosure
              className="checkpoint-learning"
              eyebrow="LEARNING LENS"
              title="Why this checkpoint matters"
            >
              <p><strong>Concept:</strong> {selectedLearning.concept}</p>
              <p><strong>Why it matters:</strong> {selectedLearning.whyItMatters}</p>
              <p><strong>Look for:</strong> {selectedLearning.lookFor}</p>
              <p className="learning-question"><strong>Check your understanding:</strong> {selectedLearning.reflectionQuestion}</p>
            </LearningDisclosure>
          ) : null}

          <div className="page-actions">
            <button type="button" className="button button-quiet" onClick={() => router.push("/issue")}>Back to issue</button>
            {planApproved ? (
              <button type="button" className="button button-primary" onClick={() => router.push("/run")}>Open the run <span aria-hidden="true">→</span></button>
            ) : (
              <button type="button" className="button button-primary" onClick={handleApprove}>Approve this plan <span aria-hidden="true">→</span></button>
            )}
            {!planApproved ? <button type="button" className="text-action page-reject" onClick={handleReject}>Set it aside</button> : null}
          </div>
        </section>
      </PageShell>
    </StageGate>
  );
}
