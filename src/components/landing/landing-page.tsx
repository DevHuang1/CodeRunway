import Link from "next/link";
import { AccountMenu } from "@/components/auth/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";

const runwaySteps = [
  { number: "01", name: "Understand", detail: "name the outcome" },
  { number: "02", name: "Plan", detail: "choose the checkpoints" },
  { number: "03", name: "Patch", detail: "make the small change" },
  { number: "04", name: "Inspect", detail: "read what changed" },
  { number: "05", name: "Check", detail: "match fixed criteria" },
  { number: "06", name: "Verify", detail: "leave with evidence" },
];

const workflowSteps = [
  {
    number: "01",
    title: "Name the change",
    description: "Start with the outcome you want, using a small sample issue with a clear boundary.",
  },
  {
    number: "02",
    title: "Review the path",
    description: "See the checkpoints before anything runs. Keep the plan, reject it, or begin again.",
  },
  {
    number: "03",
    title: "Leave with evidence",
    description: "Read the changed files, see which static fixture criteria matched, and finish with a next step you can explain.",
  },
];

const principles = [
  "You review before anything runs.",
  "Progress is based on evidence, not decoration.",
  "The sample workspace is fixed and safe to explore.",
  "You can pause, reject, or restart at any point.",
];

export function LandingPage() {
  return (
    <main className="app-shell landing-shell">
      <a className="skip-link" href="#how-it-works">Skip to how it works</a>

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
          <AccountMenu />
          <Link className="landing-header-link" href="/issue">Open workspace <span aria-hidden="true">→</span></Link>
        </div>
      </header>

      <div className="shell-width landing-content">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <span className="eyebrow accent-eyebrow">A CLEARER WAY TO FINISH ONE USEFUL CHANGE.</span>
            <h1 id="landing-title">Move from a coding issue to <em>evidence.</em></h1>
            <p>
              CodeRunway gives students and solo builders a small, visible path from a coding question to a change they can read, judge against fixed criteria, and explain.
            </p>
            <div className="landing-actions">
              <Link className="landing-button landing-button-primary" href="/issue">Start with the sample issue <span aria-hidden="true">→</span></Link>
              <a className="landing-button landing-button-secondary" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
            </div>
            <p className="landing-note"><span aria-hidden="true" /> A quiet, fixed sample path. No progress is claimed until evidence arrives.</p>
          </div>

          <figure className="landing-runway" aria-labelledby="runway-title">
            <div className="landing-runway-wash" aria-hidden="true" />
            <figcaption className="landing-runway-heading">
              <div>
                <span className="eyebrow">ILLUSTRATIVE SAMPLE PATH</span>
                <h2 id="runway-title">The next step stays in view.</h2>
              </div>
              <span className="landing-runway-state">Not started</span>
            </figcaption>
            <ol className="landing-runway-list" aria-label="Six checkpoint sample path">
              {runwaySteps.map((step) => (
                <li className="landing-runway-step" key={step.number}>
                  <span className="landing-runway-marker" aria-hidden="true">{step.number}</span>
                  <span className="landing-runway-copy">
                    <strong>{step.name}</strong>
                    <small>{step.detail}</small>
                  </span>
                </li>
              ))}
            </ol>
            <div className="landing-runway-footer">
              <span>Start with a question</span>
              <span>Finish with evidence</span>
            </div>
          </figure>
        </section>

        <section className="landing-section landing-access" aria-labelledby="access-title">
          <div className="landing-section-intro">
            <span className="eyebrow">SIGN IN OR STAY A GUEST</span>
            <div>
              <h2 id="access-title">A role for the way you want to look around.</h2>
              <p>The sample workspace is open to everyone. Signing in adds a small role badge and gives Judges a read-only operations view.</p>
            </div>
          </div>
          <div className="landing-access-grid">
            <article className="landing-access-card">
              <span className="landing-access-role">USER</span>
              <h3>Walk the full sample flow.</h3>
              <p>Choose User and use the demo password shown on the sign-in form. The workflow, review, and static fixture checks stay the same.</p>
              <Link className="landing-button landing-button-secondary" href="/login">Sign in as user <span aria-hidden="true">→</span></Link>
            </article>
            <article className="landing-access-card landing-access-card-admin">
              <span className="landing-access-role">JUDGE</span>
              <h3>Open the operations view.</h3>
              <p>Judges also see safe provider status and current limits. The default demo password appears on the sign-in form when this deployment uses it.</p>
              <Link className="landing-button landing-button-secondary" href="/login">Judge sign-in <span aria-hidden="true">→</span></Link>
            </article>
          </div>
        </section>

        <section className="landing-section landing-how" id="how-it-works" aria-labelledby="how-title">
          <div className="landing-section-intro">
            <span className="eyebrow">HOW IT WORKS</span>
            <div>
              <h2 id="how-title">A small path is easier to understand.</h2>
              <p>Each page has one job, so the work can feel concrete without hiding the decisions that matter.</p>
            </div>
          </div>
          <ol className="landing-story-list">
            {workflowSteps.map((step) => (
              <li className="landing-story-item" key={step.number}>
                <span className="landing-story-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="landing-section landing-principles" aria-labelledby="principles-title">
          <div>
            <span className="eyebrow">A STEADY WORKSPACE</span>
            <h2 id="principles-title">Helpful, without taking the wheel.</h2>
            <p>The interface keeps the remaining work visible while leaving the decisions and understanding with you.</p>
          </div>
          <ul className="landing-principle-list">
            {principles.map((principle) => (
              <li key={principle}><span aria-hidden="true">↗</span>{principle}</li>
            ))}
          </ul>
        </section>

        <section className="landing-section landing-faq" id="faq" aria-labelledby="faq-title">
          <div className="landing-section-intro">
            <span className="eyebrow">COMMON QUESTIONS</span>
            <div>
              <h2 id="faq-title">A few honest answers.</h2>
              <p>The short version: the workspace is a fixed sample, the checks are static, and sign-in is a demo role switch.</p>
            </div>
          </div>
          <div className="landing-faq-list">
            <details>
              <summary>Do I need an account?<span aria-hidden="true">+</span></summary>
              <p>No. The sample workspace is open. The optional sign-in uses one shared password per role and creates no personal profile.</p>
            </details>
            <details>
              <summary>What does the Judge role unlock?<span aria-hidden="true">+</span></summary>
              <p>A read-only Judge console with safe provider status, limits, and quick links. It does not expose secrets or change model settings.</p>
            </details>
            <details>
              <summary>Does CodeRunway run my code?<span aria-hidden="true">+</span></summary>
              <p>No. It checks fixed file contents against static fixture criteria. It does not compile TypeScript, execute generated code, or run tests.</p>
            </details>
            <details>
              <summary>Can I use my own repository?<span aria-hidden="true">+</span></summary>
              <p>Not in this build. The sample issue and the two editable files are fixed so the evidence stays honest and bounded.</p>
            </details>
          </div>
          <Link className="landing-faq-link" href="/faq">Read all questions <span aria-hidden="true">→</span></Link>
        </section>

        <section className="landing-tech-note" aria-labelledby="technology-title">
          <div>
            <span className="eyebrow">A SMALL TECHNOLOGY NOTE</span>
            <h2 id="technology-title">A transparent path under the surface.</h2>
          </div>
          <p>The live path can use Nebius Token Factory with NVIDIA Nemotron. The deterministic fallback works without credentials, so the sample remains ready to explore.</p>
        </section>

        <section className="landing-cta" aria-labelledby="cta-title">
          <div>
            <span className="eyebrow accent-eyebrow">READY WHEN YOU ARE</span>
            <h2 id="cta-title">Bring one small issue to the runway.</h2>
            <p>Start with the fixed sample task and decide what happens next.</p>
          </div>
          <div className="landing-cta-actions">
            <Link className="landing-button landing-button-primary" href="/issue">Open the sample workspace <span aria-hidden="true">→</span></Link>
            <Link className="landing-button landing-button-secondary" href="/login">Sign in</Link>
          </div>
        </section>
      </div>

      <footer className="footer shell-width landing-footer">
        <span>CodeRunway / safe sample workspace</span>
        <nav className="static-footer-nav" aria-label="Project pages">
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/accessibility">Accessibility</Link>
          <a href="https://github.com/DevHuang1/CodeRunway/blob/main/LICENSE">MIT license</a>
        </nav>
        <span>Progress is evidence, not pressure.</span>
      </footer>
    </main>
  );
}
