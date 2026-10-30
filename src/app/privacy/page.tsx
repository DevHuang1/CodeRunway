import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/pages/legal/static-page";

export const metadata: Metadata = {
  title: "Privacy — CodeRunway",
  description: "What CodeRunway collects, what it sends to Nebius Token Factory, and what it never does with your data.",
};

export default function PrivacyPage() {
  return (
    <StaticPage eyebrow="PRIVACY" title="Your data goes almost nowhere, by design." updated="October 30, 2026">
      <section aria-labelledby="privacy-summary">
        <h2 id="privacy-summary">The short version</h2>
        <p>
          CodeRunway has no registered accounts, no database, no analytics, and no advertising or
          tracking cookies. The sample workspace is open. If you choose the optional demo sign-in,
          one essential session cookie remembers the role you selected for this browser session.
          Your workflow state still lives in page memory and is discarded on refresh.
        </p>
      </section>

      <section aria-labelledby="privacy-local">
        <h2 id="privacy-local">What stays on your device</h2>
        <p>
          One setting — your light or dark theme preference — is saved to your browser&rsquo;s
          <code>localStorage</code> so it survives a reload. It never leaves your device. You can
          clear it at any time through your browser&rsquo;s site settings. Your plan, run, and
          verify state is held in page memory only and resets when the tab refreshes or closes.
          Signing out removes the demo session cookie.
        </p>
      </section>

      <section aria-labelledby="privacy-signin">
        <h2 id="privacy-signin">The demo sign-in cookie</h2>
        <p>
          If you sign in, the server sets one cookie named <code>coderunway-demo-session</code>.
          It is <code>HttpOnly</code>, <code>SameSite=Lax</code>, limited to this site, and expires
          after eight hours. The cookie stores a signed role value only: <code>user</code> or{" "}
          <code>admin</code>. It does not contain an email address, a name, a password, or a
          profile. Logging out deletes it immediately. There is no account database and no
          persistent history of who signed in.
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
          <li>No registered accounts, email collection, personal profiles, or marketing lists.</li>
          <li>No analytics, tracking pixels, or advertising networks.</li>
          <li>No persistent storage of sessions, plans, patches, or summaries in a database.</li>
          <li>No sale or sharing of any data with third parties.</li>
          <li>No reading of your local files, repository, or clipboard contents.</li>
        </ul>
      </section>

      <section aria-labelledby="privacy-changes">
        <h2 id="privacy-changes">Changes and contact</h2>
        <p>
          If this policy changes, the date above will be updated and the change described in the
          repository history. Questions can be raised through the{" "}
          <Link href="/contact">contact page</Link> or as issues on the{" "}
          <a href="https://github.com/DevHuang1/CodeRunway">public repository</a>.
        </p>
      </section>
    </StaticPage>
  );
}
