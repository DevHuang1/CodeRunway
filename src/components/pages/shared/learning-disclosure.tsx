"use client";

import { useState, type ReactNode } from "react";

interface LearningDisclosureProps {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function LearningDisclosure({ eyebrow = "LEARNING LENS", title, children, className = "", defaultOpen = false }: LearningDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      className={`learning-disclosure ${className}`.trim()}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary aria-expanded={open}>
        <span>
          <span className="eyebrow">{eyebrow}</span>
          <strong>{title}</strong>
        </span>
        <span className="learning-disclosure-mark" aria-hidden="true">{open ? "−" : "+"}</span>
      </summary>
      <div className="learning-disclosure-content">{children}</div>
    </details>
  );
}
