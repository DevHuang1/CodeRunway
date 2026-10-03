import type { Milestone } from "@/lib/types";

interface GoalGradientProps {
  progress: number;
  milestones: Milestone[];
}

function progressCopy(progress: number) {
  if (progress >= 100) return "You have a verified next step.";
  if (progress >= 80) return "The checks are confirming the details.";
  if (progress >= 60) return "The change is taking shape.";
  if (progress >= 40) return "The path is visible. You can still pause or change your mind.";
  if (progress >= 20) return "The issue is understood. Take a look when you are ready.";
  return "Start with one small, clear step.";
}

export function GoalGradient({ progress, milestones }: GoalGradientProps) {
  const activeIndex = milestones.findIndex((milestone) => milestone.state === "active");
  const nextMilestone = milestones.find((milestone) => milestone.state === "active") ?? milestones.find((milestone) => milestone.state !== "complete");

  return (
    <section className="goal-gradient" aria-labelledby="goal-gradient-title">
      <div className="section-label-row">
        <div>
          <span className="eyebrow">YOUR GOAL GRADIENT</span>
          <h2 id="goal-gradient-title">A little more clarity, one checkpoint at a time</h2>
        </div>
        <span className="goal-percent">{progress}%</span>
      </div>
      <p className="goal-message">{progressCopy(progress)}</p>
      <div className="goal-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Verified goal progress">
        <span className="goal-track-fill" style={{ width: `${progress}%` }} />
        <span className="goal-track-marker" style={{ left: `${progress}%` }} aria-hidden="true" />
      </div>
      <div className="goal-steps" aria-label={`${milestones.filter((milestone) => milestone.state === "complete").length} of ${milestones.length} checkpoints verified`}>
        {milestones.map((milestone, index) => (
          <div className={`goal-step ${milestone.state}`} key={milestone.id}>
            <span className="goal-step-dot" aria-hidden="true">{milestone.state === "complete" ? "✓" : ""}</span>
            <span>{milestone.label}</span>
            {index === activeIndex ? <span className="sr-only">next</span> : null}
          </div>
        ))}
      </div>
      <div className="next-step-note">
        <span className="next-step-dot" aria-hidden="true" />
        <span><strong>Next gentle step:</strong> {nextMilestone?.label ?? "Keep the verified change"}</span>
      </div>
    </section>
  );
}
