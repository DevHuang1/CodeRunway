import type { Metadata } from "next";
import { StaticPage } from "@/components/pages/legal/static-page";

export const metadata: Metadata = {
  title: "Contact — CodeRunway",
  description: "How to reach the CodeRunway project for questions, bug reports, and security reports.",
};

export default function ContactPage() {
  return (
    <StaticPage eyebrow="CONTACT" title="A small project with a public home.">
      <section aria-labelledby="contact-where">
        <h2 id="contact-where">Where to find us</h2>
        <p>
          CodeRunway is an open-source project. Questions, bug reports, and feature suggestions
          can be raised on the{" "}
          <a href="https://github.com/DevHuang1/CodeRunway">GitHub repository</a>. That public
          issue tracker is the best place to reach the maintainers.
        </p>
      </section>

      <section aria-labelledby="contact-no-form">
        <h2 id="contact-no-form">Why there is no contact form</h2>
        <p>
          The application does not collect email addresses, run a contact database, or send
          marketing messages. A form would add personal-data handling for no real benefit, so the
          project uses its public repository instead.
        </p>
      </section>

      <section aria-labelledby="contact-bugs">
        <h2 id="contact-bugs">Reporting a bug</h2>
        <p>
          Include the page you were on, what you expected, and what happened. For the workflow,
          note whether the fallback or live path was active. Do not include API keys, session
          cookies, or other secrets in a public issue.
        </p>
      </section>

      <section aria-labelledby="contact-security">
        <h2 id="contact-security">Reporting a security issue</h2>
        <p>
          Please use the repository&rsquo;s{" "}
          <a href="https://github.com/DevHuang1/CodeRunway/security/advisories">private security advisory</a>{" "}
          form instead of a public issue. Include enough detail to reproduce the problem, but do
          not include live credentials. The <a href="https://github.com/DevHuang1/CodeRunway/blob/main/SECURITY.md">security policy</a>{" "}
          describes the current scope.
        </p>
      </section>

      <section aria-labelledby="contact-response">
        <h2 id="contact-response">Response expectations</h2>
        <p>
          This is a small demonstration project, not a staffed support desk. Reports are reviewed
          when maintainers are available; there is no guaranteed response time or service-level
          agreement.
        </p>
      </section>
    </StaticPage>
  );
}
