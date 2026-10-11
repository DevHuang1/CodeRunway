import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

interface StaticPageProps {
  eyebrow: string;
  title: string;
  updated?: string;
  children: ReactNode;
}

export function StaticPage({ eyebrow, title, updated, children }: StaticPageProps) {
  return (
    <main className="app-shell landing-shell static-shell">
      <a className="skip-link" href="#static-content">Skip to content</a>

      <header className="landing-header shell-width">
        <Link className="brand-lockup landing-brand" href="/" aria-label="CodeRunway home">
          <span className="brand-mark" aria-hidden="true"><span>↗</span></span>
          <span>
            <span className="brand-name">CodeRunway</span>
            <span className="brand-subtitle">A kinder way to make one useful change</span>
          </span>
        </Link>
        <div className="landing-header-actions">
          <ThemeToggle />
          <Link className="landing-header-link" href="/issue">Open workspace <span aria-hidden="true">→</span></Link>
        </div>
      </header>

      <div className="shell-width static-content" id="static-content">
        <header className="static-heading">
          <span className="eyebrow accent-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {updated ? <p className="static-updated">Last updated {updated}</p> : null}
        </header>
        <div className="static-body">{children}</div>
      </div>

      <footer className="footer shell-width landing-footer">
        <span>CodeRunway / safe sample workspace</span>
        <nav className="static-footer-nav" aria-label="Project pages">
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms of Service</Link>
          <a href="https://github.com/DevHuang1/CodeRunway/blob/main/LICENSE">MIT license</a>
        </nav>
        <span>Progress is evidence, not pressure.</span>
      </footer>
    </main>
  );
}
