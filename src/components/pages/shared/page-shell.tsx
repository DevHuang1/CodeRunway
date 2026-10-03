"use client";

import type { CSSProperties, ReactNode } from "react";
import { FlowStepper } from "./flow-stepper";
import { WorkspaceFooter } from "./workspace-footer";
import { WorkspaceHeader } from "./workspace-header";
import type { FlowStage } from "@/lib/flow";
import { useCodeRunway } from "@/components/coderunway-provider";

interface PageShellProps {
  stage: FlowStage;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function PageShell({ stage, eyebrow, title, description, children }: PageShellProps) {
  const { progress, runState, announcement } = useCodeRunway();
  const glowStyle = { "--goal-proximity": progress / 100 } as CSSProperties;

  return (
    <main className="app-shell page-shell" style={glowStyle}>
      <WorkspaceHeader runState={runState} />
      <div className="shell-width page-content">
        <FlowStepper currentStage={stage} />
        <header className="page-heading">
          <span className="eyebrow accent-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        {children}
      </div>
      <WorkspaceFooter />
      <div className="sr-only" aria-live="polite">{announcement}</div>
    </main>
  );
}
