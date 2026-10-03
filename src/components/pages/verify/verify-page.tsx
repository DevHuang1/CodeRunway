"use client";

import { useRouter } from "next/navigation";
import { useCodeRunway } from "@/components/coderunway-provider";
import { getTestLearning } from "@/lib/learning";
import { LearningDisclosure } from "@/components/pages/shared/learning-disclosure";
import { PageShell } from "@/components/pages/shared/page-shell";
import { StageGate } from "@/components/pages/shared/stage-gate";

export function VerifyPage() {
  const router = useRouter();
  const { result, tests, runMode, summaryCopied, takeaway, setTakeaway, copySummary, resetSession } = useCodeRunway();
  const passed = tests.filter((test) => test.status === "passed").length;
  const total = tests.length || result?.tests.length || 0;
  const complete = Boolean(result && total > 0 && passed === total);

  function startAnotherRun() {
    resetSession();
    router.push("/issue");
  }

  return (
    <StageGate stage="verify">
      <PageShell
        stage="verify"
        eyebrow="THE VERIFY"
        title={complete ? "You have proof of the change." : "Read the result honestly."}
        description="Finish with the evidence: what passed, what changed, and the smallest useful next step."
      >
        <div className="page-grid page-grid-verify">
          <section className="page-card verify-card" aria-labelledby="verify-title">
            <div className="page-card-heading">
              <div>
                <span className="eyebrow">TEST EVIDENCE</span>
                <h2 id="verify-title">{passed}/{total} checks passed</h2>
              </div>
              <span className={`provider-chip ${complete ? "provider-chip-good" : ""}`}><i /> {runMode === "live" ? "Live result" : "Local result"}</span>
            </div>

            <div className="verify-summary" role="status">
              <span className="verify-summary-mark" aria-hidden="true">{complete ? "✓" : "!"}</span>
              <div>
                <strong>{complete ? "The sample task is verified." : "The sample task needs another look."}</strong>
                <p>{complete ? result?.nextStep : "Review the failed checks before treating this change as complete."}</p>
              </div>
            </div>

            <div className="evidence-card verify-evidence">
              <div className="section-label-row"><span className="section-label">Registered checks</span><span className="tiny-status">fixed evaluator</span></div>
              {tests.map((test) => (
                <div className="test-row" key={test.name}>
                  <span className={test.status === "passed" ? "test-pass" : "test-fail"} aria-hidden="true">{test.status === "passed" ? "✓" : "!"}</span>
                  <div>
                    <strong>{test.name}</strong>
                    <span>{test.details}</span>
                    {getTestLearning(test.name) ? (
                      <LearningDisclosure className="test-learning" eyebrow="INTERPRET THIS CHECK" title="Understand this check">
                        <p><strong>What it proves:</strong> {getTestLearning(test.name)?.proves}</p>
                        <p><strong>If it failed:</strong> {getTestLearning(test.name)?.ifItFails}</p>
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
              <p className="field-help">Optional. This does not affect verification and will be included if you copy the run summary.</p>
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
            <p className="truth-note"><span aria-hidden="true">♡</span> Verification means evidence is visible, not that the tool decides for you.</p>
          </aside>
        </div>
      </PageShell>
    </StageGate>
  );
}
