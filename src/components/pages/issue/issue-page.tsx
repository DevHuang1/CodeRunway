"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCodeRunway } from "@/components/coderunway-provider";
import { ISSUE_LEARNING } from "@/lib/learning";
import { PageShell } from "@/components/pages/shared/page-shell";
import { LearningDisclosure } from "@/components/pages/shared/learning-disclosure";
import { StageGate } from "@/components/pages/shared/stage-gate";

export function IssuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { task, plan, runState, error, provider, createPlan } = useCodeRunway();
  const resetNotice = searchParams.get("reset") === "1";

  async function handlePrimaryAction() {
    if (plan && runState !== "idle" && runState !== "error") {
      router.push("/plan");
      return;
    }
    if (await createPlan()) router.push("/plan");
  }

  const planning = runState === "planning";
  const hasExistingPlan = Boolean(plan && runState !== "idle" && runState !== "error");

  return (
    <StageGate stage="issue">
      <PageShell
        stage="issue"
        eyebrow="START HERE"
        title="Name the small change you want to make."
        description="Begin with the outcome, not the implementation. CodeRunway will turn this sample issue into a path you can review before requesting a patch."
      >
        {resetNotice ? <div className="reset-notice" role="status">This browser session was reset safely. No progress was claimed.</div> : null}
        <div className="page-grid page-grid-issue">
          <section className="page-card issue-card-page" aria-labelledby="issue-title">
            <div className="page-card-heading">
              <div>
                <span className="eyebrow">SAMPLE WORKSPACE</span>
                <h2 id="issue-title">{task?.title ?? "Loading the sample issue…"}</h2>
              </div>
              <span className="supportive-status"><span className="status-dot" aria-hidden="true" />{planning ? "Making the plan" : "Ready when you are"}</span>
            </div>
            <p className="page-lede">{task?.description ?? "A small, safe example is on its way."}</p>
            <p className="stack-note">{task?.stack.join(" · ")}</p>
            <div className="outcome-card">
              <span className="eyebrow">WHAT GOOD LOOKS LIKE</span>
              <p>{task?.expectedOutcome ?? "A clear result will appear here."}</p>
            </div>
            <div className="page-actions">
              <button type="button" className="button button-primary" onClick={() => void handlePrimaryAction()} disabled={!task || planning}>
                {planning ? "Making the plan…" : hasExistingPlan ? "Review current plan" : "Make a plan"}
                {!planning ? <span aria-hidden="true">→</span> : null}
              </button>
            </div>
            {provider?.mode === "live" ? (
              <p className="field-help" role="note">Live mode can make one model request for the plan and another for the patch. Limits are 5 requests/minute per client and 20/hour for this app process; provider charges may apply.</p>
            ) : null}
            {error ? <div className="error-box" role="alert"><strong>Let’s pause here</strong><span>{error}</span></div> : null}
          </section>

          <aside className="page-note" aria-label="How the workflow works">
            <span className="eyebrow">A QUIET START</span>
            <h2>You remain in control.</h2>
            <p>First you review the path. Then you choose whether to request a patch. The sample workspace is fixed; no code is executed.</p>
            <div className="note-list">
              <span><b>01</b> Understand the outcome</span>
              <span><b>02</b> Approve a small plan</span>
              <span><b>03</b> Review the criteria and next step</span>
            </div>
            <LearningDisclosure
              className="learning-disclosure-note"
              eyebrow="WHAT YOU'LL LEARN"
              title="Three ideas to carry forward"
            >
              <ul className="learning-list">
                {ISSUE_LEARNING.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="learning-footnote">These notes are fixed for the sample task; they do not change the run or its progress.</p>
            </LearningDisclosure>
          </aside>
        </div>
      </PageShell>
    </StageGate>
  );
}
