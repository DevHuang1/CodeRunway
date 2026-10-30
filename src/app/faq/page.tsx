import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/pages/legal/static-page";

export const metadata: Metadata = {
  title: "FAQ — CodeRunway",
  description: "Short answers about the CodeRunway sample workspace, demo sign-in, static checks, and data handling.",
};

export default function FaqPage() {
  return (
    <StaticPage eyebrow="FREQUENTLY ASKED QUESTIONS" title="Short answers, without the fog.">
      <section aria-labelledby="faq-account">
        <h2 id="faq-account">Do I need an account to use the workspace?</h2>
        <p>
          No. The sample workspace is open, and the workflow does not require a sign-in. The
          optional demo sign-in adds a role badge and, for the Judge role, a read-only operations
          view. It is not a registered user account and creates no profile.
        </p>
      </section>

      <section aria-labelledby="faq-codes">
        <h2 id="faq-codes">What are the demo passwords?</h2>
        <p>
          The User demo password is <code>TESTUSER</code>. The default Judge demo password is <code>STUDYADMIN</code>.
          Both appear in the sign-in form when the default Judge password is active. Deployments can
          set a custom Judge password with the server-side <code>ADMIN_PASSWORD</code> variable;
          custom passwords are not shown in the application.
        </p>
      </section>

      <section aria-labelledby="faq-admin">
        <h2 id="faq-admin">What does the Judge role change?</h2>
        <p>
          It opens the <Link href="/admin">Judge console</Link>, which shows whether the live model
          path is configured, the current safe limits, and links back into the workspace. It does
          not expose the provider key, change settings, or unlock arbitrary repositories.
        </p>
      </section>

      <section aria-labelledby="faq-session">
        <h2 id="faq-session">What happens when I sign in or out?</h2>
        <p>
          A successful sign-in sets one essential <code>HttpOnly</code> session cookie for up to
          eight hours. It records only the selected role. Logging out deletes the cookie. There is
          no account database, no tracking cookie, and no analytics. The{" "}
          <Link href="/privacy">privacy policy</Link> has the full explanation.
        </p>
      </section>

      <section aria-labelledby="faq-checks">
        <h2 id="faq-checks">Does CodeRunway run tests or compile code?</h2>
        <p>
          No. The checks compare fixed file contents against static fixture criteria. They do not
          compile TypeScript, execute generated code, or prove runtime behavior. A matched
          criterion is a content signal, not proof that a patch works in a real project.
        </p>
      </section>

      <section aria-labelledby="faq-repo">
        <h2 id="faq-repo">Can I point it at my own repository?</h2>
        <p>
          Not in this build. The sample issue and its two editable files are fixed so the
          demonstration stays small and its evidence stays honest. The app does not connect to
          GitHub or accept arbitrary file contents.
        </p>
      </section>

      <section aria-labelledby="faq-reset">
        <h2 id="faq-reset">How do I reset the workflow?</h2>
        <p>
          Refresh the tab, or use the restart action at the end of a run. Workflow state lives in
          page memory and resets on refresh. A signed-in session can last longer than the workflow
          because it is stored in the session cookie.
        </p>
      </section>
    </StaticPage>
  );
}
