"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCodeRunway } from "@/components/coderunway-provider";
import { getFileLearning } from "@/lib/learning";
import { LearningDisclosure } from "@/components/pages/shared/learning-disclosure";
import { PageShell } from "@/components/pages/shared/page-shell";
import { StageGate } from "@/components/pages/shared/stage-gate";

function diffLines(diff: string) {
  return diff.split("\n").map((line, index) => {
    const tone = line.startsWith("+") && !line.startsWith("+++")
      ? "diff-add"
      : line.startsWith("-") && !line.startsWith("---")
        ? "diff-remove"
        : line.startsWith("@@")
          ? "diff-hunk"
          : "";
    return <span className={`diff-line ${tone}`} key={`${index}-${line}`}>{line || " "}</span>;
  });
}

function fileLabel(path: string) {
  return path.split("/").at(-1) ?? path;
}

export function ReviewPage() {
  const router = useRouter();
  const { result, task } = useCodeRunway();
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const changedFiles = result?.filesChanged ?? [];
  const activeFilePath = changedFiles.includes(selectedFilePath ?? "") ? selectedFilePath : changedFiles[0] ?? null;
  const selectedFile = task?.files.find((file) => file.path === activeFilePath);
  const displayedDiff = activeFilePath && result ? result.diffsByFile[activeFilePath] ?? result.diff : "";
  const fileLearning = activeFilePath ? getFileLearning(activeFilePath) : null;

  async function copyPatch() {
    if (!displayedDiff || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(displayedDiff);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function downloadPatch() {
    if (!result) return;
    const blob = new Blob([result.diff], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "coderunway.patch";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <StageGate stage="review">
      <PageShell
        stage="review"
        eyebrow="THE REVIEW"
        title="Understand what changed."
        description="Look at each allowlisted file independently, read the explanation, and take the patch with you when it feels clear."
      >
        <div className="page-grid page-grid-review">
          <section className="page-card review-card" aria-labelledby="review-title">
            <div className="page-card-heading">
              <div>
                <span className="eyebrow">READABLE DIFF</span>
                <h2 id="review-title">{changedFiles.length} changed file{changedFiles.length === 1 ? "" : "s"}</h2>
              </div>
              <span className="provider-chip"><i /> {result?.mode === "live" ? "Live result" : "Local result"}</span>
            </div>
            <div className="diff-toolbar">
              <div className="file-tabs" role="tablist" aria-label="Changed files">
                {changedFiles.map((path) => (
                  <button type="button" role="tab" aria-selected={activeFilePath === path} className={activeFilePath === path ? "file-tab active" : "file-tab"} key={path} onClick={() => setSelectedFilePath(path)}>{fileLabel(path)}</button>
                ))}
              </div>
              <div className="diff-actions">
                <button type="button" className="text-action" onClick={() => void copyPatch()}>{copied ? "Copied" : "Copy patch"}</button>
                <button type="button" className="text-action" onClick={downloadPatch}>Download</button>
              </div>
            </div>
            <div className="review-path">{selectedFile?.path ?? "No file selected"}</div>
            <div className="diff-window" aria-label="Code diff"><pre>{diffLines(displayedDiff)}</pre></div>
            <p className="explanation"><span>Why it works</span>{result?.explanation}</p>
            {fileLearning ? (
              <LearningDisclosure title={fileLearning.concept}>
                <p><strong>Why it matters:</strong> {fileLearning.whyItMatters}</p>
                <p><strong>Look for:</strong> {fileLearning.lookFor}</p>
              </LearningDisclosure>
            ) : null}
            <div className="page-actions">
              <button type="button" className="button button-quiet" onClick={() => router.push("/run")}>Back to run</button>
              <button type="button" className="button button-primary" onClick={() => router.push("/verify")}>Continue to verify <span aria-hidden="true">→</span></button>
            </div>
          </section>
          <aside className="page-note">
            <span className="eyebrow">A GOOD REVIEW</span>
            <h2>Ask one simple question.</h2>
            <p>Does this focused change address the original outcome without adding anything you cannot explain?</p>
            <p className="truth-note"><span aria-hidden="true">♡</span> The patch is limited to the registered sample files.</p>
          </aside>
        </div>
      </PageShell>
    </StageGate>
  );
}
