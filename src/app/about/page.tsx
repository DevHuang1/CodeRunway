import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/pages/legal/static-page";

export const metadata: Metadata = {
  title: "About — CodeRunway",
  description: "What CodeRunway is, what it deliberately does not do, and how Nemotron and Nebius Token Factory are used.",
};

export default function AboutPage() {
  return (
    <StaticPage eyebrow="ABOUT" title="One small change, with its evidence attached.">
      <section aria-labelledby="about-what">
        <h2 id="about-what">What CodeRunway is</h2>
        <p>
          CodeRunway is a calm, goal-gradient workspace for moving one small coding issue to a
          reviewable patch. It is built for students and solo builders who want help making
          progress without surrendering a repository to an agent or accepting generated code they
          cannot explain. The flow is fixed on purpose: understand the issue, approve a plan,
          watch the run, read the diff, and finish with static fixture criteria and a next step.
        </p>
      </section>

      <section aria-labelledby="about-ai">
        <h2 id="about-ai">How the model is used</h2>
        <p>
          Live plan and patch generation run on NVIDIA Nemotron 3.5 Lightning through the Nebius
          Token Factory API. The model is called at most twice per run — once for the plan, once
          for the patch — and its output is schema-validated before it can change anything. Edits
          are restricted to two allowlisted sample files, and model-supplied shell commands are
          rejected. Without a key, a deterministic fallback runs the same flow locally.
        </p>
      </section>

      <section aria-labelledby="about-signin">
        <h2 id="about-signin">The optional demo sign-in</h2>
        <p>
          The sample workspace is open to everyone. An optional sign-in adds a small role badge for
          this browser session: a <strong>User</strong> role follows the standard workflow, while
          a <strong>Judge</strong> role also opens a read-only console with safe provider status
          and current limits. Passwords are checked on the server, and a successful sign-in sets
          one <code>HttpOnly</code> session cookie. There is no account database, profile, or
          persistent project storage behind it.
        </p>
      </section>

      <section aria-labelledby="about-limits">
        <h2 id="about-limits">What it deliberately does not do</h2>
        <p>
          The evaluator performs static fixture checks: it inspects file contents for expected
          text and markup against fixed criteria. It does not compile TypeScript, run tests, or
          execute generated code in any sandbox, and it is labeled that way in the interface.
          The app does not accept arbitrary repositories, connect to GitHub, create accounts, or
          provision cloud jobs. The demo passwords are not accounts. These are boundaries of
          the design, not unfinished work.
        </p>
      </section>

      <section aria-labelledby="about-who">
        <h2 id="about-who">Who we are</h2>
        <p>
          CodeRunway is an open-source project maintained by its contributors. The full source
          history, issues, and project documents are public on GitHub. Questions and corrections
          can be sent through the <Link href="/contact">contact page</Link>; security reports should use
          the repository&rsquo;s private advisory form.
        </p>
      </section>

      <section aria-labelledby="about-open">
        <h2 id="about-open">Open source</h2>
        <p>
          CodeRunway is free software under the{" "}
          <a href="https://github.com/DevHuang1/CodeRunway/blob/main/LICENSE">MIT license</a>,
          built for the Nebius x NVIDIA Global AI Hackathon. The full source, tests, and project
          documents are public on{" "}
          <a href="https://github.com/DevHuang1/CodeRunway">GitHub</a>.
        </p>
      </section>
    </StaticPage>
  );
}
