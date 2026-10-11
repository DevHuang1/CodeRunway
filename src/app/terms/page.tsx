import type { Metadata } from "next";
import { StaticPage } from "@/components/pages/legal/static-page";

export const metadata: Metadata = {
  title: "Terms of Service — CodeRunway",
  description: "Plain-language terms of service for using the CodeRunway sample workspace.",
};

export default function TermsPage() {
  return (
    <StaticPage eyebrow="TERMS OF SERVICE" title="Use it kindly, read the result honestly." updated="October 11, 2026">
      <section aria-labelledby="terms-acceptance">
        <h2 id="terms-acceptance">Acceptance</h2>
        <p>
          By opening the workspace or using any part of this application, you agree to these terms
          of service. If you do not agree, please do not use the app. The sample is a fixed
          demonstration, and these terms stay deliberately short so they can actually be read.
        </p>
      </section>

      <section aria-labelledby="terms-service">
        <h2 id="terms-service">The service</h2>
        <p>
          CodeRunway is a demonstration workspace that turns one fixed sample issue into a plan,
          an allowlisted patch, and static fixture criteria. It is provided free of charge, as it
          is, without any warranty, under the{" "}
          <a href="https://github.com/DevHuang1/CodeRunway/blob/main/LICENSE">MIT license</a>.
        </p>
      </section>

      <section aria-labelledby="terms-honesty">
        <h2 id="terms-honesty">What the results mean — and do not mean</h2>
        <p>
          The checks you see are static content comparisons against fixed fixture criteria. They
          do not run tests, compile code, or verify runtime behavior, and a matched criterion is
          not a promise that a patch works in a real project. You are responsible for reviewing,
          testing, and accepting any change you carry into your own work.
        </p>
      </section>

      <section aria-labelledby="terms-acceptable">
        <h2 id="terms-acceptable">Acceptable use</h2>
        <ul>
          <li>Do not attempt to probe, overload, or exceed the rate limits of the live model path.</li>
          <li>Do not submit secrets, credentials, or personal data through the workflow. The sample task is fixed, so none are needed.</li>
          <li>Do not present CodeRunway&rsquo;s static fixture criteria as executed tests, sandbox evidence, or proof of correctness.</li>
        </ul>
      </section>

      <section aria-labelledby="terms-liability">
        <h2 id="terms-liability">Liability</h2>
        <p>
          To the maximum extent permitted by law, the authors are not liable for any damages
          arising from the use of this application or any patch produced through it, consistent
          with the MIT license terms.
        </p>
      </section>

      <section aria-labelledby="terms-changes">
        <h2 id="terms-changes">Changes</h2>
        <p>
          These terms may change with the project. The date above marks the current version, the
          history is visible in the{" "}
          <a href="https://github.com/DevHuang1/CodeRunway">public repository</a>, and continued
          use after a change means you accept the updated terms.
        </p>
      </section>
    </StaticPage>
  );
}
