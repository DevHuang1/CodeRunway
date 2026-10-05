"use client";

import { useRouter } from "next/navigation";
import { useCodeRunway } from "@/components/coderunway-provider";
import { getCheckLearning } from "@/lib/learning";
import { LearningDisclosure } from "@/components/pages/shared/learning-disclosure";
import { PageShell } from "@/components/pages/shared/page-shell";
import { StageGate } from "@/components/pages/shared/stage-gate";

export function VerifyPage() {
  const router = useRouter();
  const { result, checks, runMode, summaryCopied, takeaway, setTakeaway, copySummary, resetSession } = useCodeRunway();
  const passed = checks.filter((check) => check.status === "passed").length;
  const total = checks.length || result?.checks.length || 0;
  const complete = Boolean(result && result.verification.kind === "static-fixture" && result.verification.testsExecuted === false && result.verification.status === "passed" && total > 0 && passed === total);

  function startAnotherRun() {
    resetSession();
    router.push("/issue");
  }

  return (
    <StageGate stage="verify">
      <PageShell
        stage="verify"
        eyebrow="THE VERIFY"
        title={complete ? "The fixture criteria match." : "Read the result honestly."}
        description="Finish with the evidence: what passed, what changed, and the smallest useful next step."
      >
        <div className="page-grid page-grid-verify">
          <section className="page-card verify-card" aria-labelledby="verify-title">
            <div className="page-card-heading">
              <div>
                <span className="eyebrow">STATIC FIXTURE CRITERIA</span>
                <h2 id="verify-title">{passed}/{total} fixture checks matched</h2>
              </div>
              <span className={`provider-chip ${complete ? "provider-chip-good" : ""}`}><i /> {runMode === "live" ? `Model: ${result?.model ?? "Nemotron"}` : "Local sample"}</span>
            </div>

            <div className="verify-summary" role="status">
              <span className="verify-summary-mark" aria-hidden="true">{complete ? "✓" : "!"}</span>
              <div>
                <strong>{complete ? "Every fixed content criterion matched." : "The sample task needs another look."}</strong>
                <p>{complete ? result?.nextStep : "Review the failed checks before treating this change as complete."}</p>
              </div>
            </div>

            <div className="evidence-card verify-evidence">
              <div className="section-label-row"><span className="section-label">Static fixture criteria (not executed tests)</span><span className="tiny-status">no code execution</span></div>
              {checks.map((check) => (
                <div className="test-row" key={check.name}>
                  <span className={check.status === "passed" ? "test-pass" : "test-fail"} aria-hidden="true">{check.status === "passed" ? "✓" : "!"}</span>
                  <div>
                    <strong>{check.name}</strong>
                    <span>{check.details}</span>
                    {getCheckLearning(check.name) ? (
                      <LearningDisclosure className="test-learning" eyebrow="INTERPRET THIS CHECK" title="Understand this check">
                        <p><strong>What it shows:</strong> {getCheckLearning(check.name)?.proves}</p>
                        <p><strong>If it failed:</strong> {getCheckLearning(check.name)?.ifItFails}</p>
                      </LearningDisclosure>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <LearningDisclosure className="takeaway-disclosure" eyebrow="YOUR TAKEAWAY" title="Put the change in your own words">
              <label htmlFor="takeaway">What changed, in one sentence?</label>
              <textarea
                id="takeaway"
                value={takeaway}
                maxLength={240}
                rows={3}
                placeholder="The form now…"
                onChange={(event) => setTakeaway(event.target.value)}
              />
              <p className="field-help">Optional. This does not affect the static checks and will be included if you copy the run summary.</p>
            </LearningDisclosure>

            <div className="changed-files" aria-label="Changed files">
              <div className="section-label-row"><span className="section-label">Changed files</span><span className="tiny-status">allowlisted fixture</span></div>
              {result?.filesChanged.map((path) => <span className="changed-file" key={path}>{path}</span>)}
            </div>

            <div className="page-actions">
              <button type="button" className="button button-quiet" onClick={() => router.push("/review")}>Back to review</button>
              <button type="button" className="button button-primary" onClick={() => void copySummary()}>{summaryCopied ? "Summary copied" : "Copy run summary"}</button>
            </div>
            <div className="page-actions verify-secondary-actions">
              <button type="button" className="text-action" onClick={startAnotherRun}>Start another run</button>
            </div>
          </section>

          <aside className="page-note" aria-label="Next step guidance">
            <span className="eyebrow">NEXT STEP</span>
            <h2>{complete ? "Take the understanding with you." : "Pause before you move on."}</h2>
            <p>{complete ? result?.nextStep : "A truthful failed result is useful information. Return to the run only when you are ready to try again."}</p>
            <p className="truth-note"><span aria-hidden="true">♡</span> These content checks are not a substitute for compiling and running tests in your own project.</p>
          </aside>
        </div>
      </PageShell>
    </StageGate>
  );
}
