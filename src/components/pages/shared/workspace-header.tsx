import type { RunState } from "./types";
import { ThemeToggle } from "@/components/theme-toggle";

function statusLabel(state: RunState) {
  return {
    idle: "Ready when you are",
    planning: "Making the plan",
    ready: "Plan ready to review",
    running: "Working through the plan",
    paused: "Paused here",
    cancelled: "Request stopped",
    complete: "Fixture criteria matched",
    error: "Needs a closer look",
  }[state];
}

function statusTone(state: RunState) {
  return state === "complete" ? "success" : state === "error" ? "danger" : "neutral";
}

export function WorkspaceHeader({ runState }: { runState: RunState }) {
  return (
    <header className="topbar shell-width">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true"><span>↗</span></div>
        <div>
          <p className="brand-name">CodeRunway</p>
          <p className="brand-subtitle">A kinder way to make one useful change</p>
        </div>
      </div>
      <div className="topbar-meta">
        <ThemeToggle />
        <span className={`status-pill ${statusTone(runState)}`}><i /> {statusLabel(runState)}</span>
      </div>
    </header>
  );
}
