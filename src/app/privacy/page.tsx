import type { Metadata } from "next";
import { StaticPage } from "@/components/pages/legal/static-page";

export const metadata: Metadata = {
  title: "Privacy — CodeRunway",
  description: "What CodeRunway collects, what it sends to Nebius Token Factory, and what it never does with your data.",
};

export default function PrivacyPage() {
  return (
    <StaticPage eyebrow="PRIVACY" title="Your data goes almost nowhere, by design." updated="October 11, 2026">
      <section aria-labelledby="privacy-summary">
        <h2 id="privacy-summary">The short version</h2>
        <p>
          CodeRunway has no accounts, no database, no analytics, and no cookies. Your workflow
          state lives in this browser tab&rsquo;s memory and is discarded on refresh. Nothing you do
          here is persisted anywhere by this application.
        </p>
      </section>

      <section aria-labelledby="privacy-local">
        <h2 id="privacy-local">What stays on your device</h2>
        <p>
          One setting — your light or dark theme preference — is saved to your browser&rsquo;s
          <code>localStorage</code> so it survives a reload. It never leaves your device. You can
          clear it at any time through your browser&rsquo;s site settings. Your plan, run, and verify
          state is held in page memory only and resets when the tab refreshes or closes.
        </p>
      </section>

      <section aria-labelledby="privacy-provider">
        <h2 id="privacy-provider">What is sent to the model provider</h2>
        <p>
          When live mode is used, the server sends the fixed sample task and your approved plan to
          NVIDIA Nemotron through the Nebius Token Factory API to generate the plan and patch.
          Only the sample workspace content travels — CodeRunway has no way to read files, paste
          history, or personal data, so none can be sent. The API key is stored server-side and is
          never included in responses or shipped to the browser. Your IP address is visible to
          Nebius as the transport endpoint for that request, subject to Nebius&rsquo;s own privacy
          policy.
        </p>
      </section>

      <section aria-labelledby="privacy-limiting">
        <h2 id="privacy-limiting">Rate limiting</h2>
        <p>
          To bound provider usage, the server keeps an in-memory counter keyed by a hashed client
          IP address. The hash is not reversible, is not written to disk, and disappears when the
          app restarts. It is a safety guardrail, not an identity.
        </p>
      </section>

      <section aria-labelledby="privacy-never">
        <h2 id="privacy-never">What CodeRunway never does</h2>
        <ul>
          <li>No accounts, sign-in, email collection, or user profiles.</li>
          <li>No analytics, tracking pixels, or advertising networks.</li>
          <li>No persistent storage of sessions, plans, patches, or summaries.</li>
          <li>No sale or sharing of any data with third parties.</li>
          <li>No reading of your local files, repository, or clipboard contents.</li>
        </ul>
      </section>

      <section aria-labelledby="privacy-changes">
        <h2 id="privacy-changes">Changes and contact</h2>
        <p>
          If this policy changes, the date above will be updated and the change described in the
          repository history. Questions can be raised as issues on the{" "}
          <a href="https://github.com/DevHuang1/CodeRunway">public repository</a>.
        </p>
      </section>
    </StaticPage>
  );
}
