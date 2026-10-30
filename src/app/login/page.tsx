import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { StaticPage } from "@/components/pages/legal/static-page";
import { safeNextPath } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in — CodeRunway",
  description: "Sign in to the CodeRunway sample workspace as a demo user or administrator.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = safeNextPath(next);

  return (
    <StaticPage
      eyebrow="DEMO SIGN IN"
      title="Choose a role and step onto the runway."
      wide
    >
      <div className="login-layout">
        <div className="login-card" aria-labelledby="login-form-title">
          <div className="login-card-heading">
            <span className="eyebrow accent-eyebrow">SAMPLE ACCESS</span>
            <h2 id="login-form-title">Sign in to this browser session.</h2>
            <p>
              This is a demonstration sign-in. It sets a role for the sample workspace; it does
              not create a personal account or collect an email address.
            </p>
          </div>
          <LoginForm nextPath={nextPath} />
        </div>

        <aside className="login-aside" aria-label="Demo access notes">
          <h2>What each role can do</h2>
          <ul>
            <li>
              <strong>User</strong> opens the sample workflow and keeps the standard review and
              evidence path.
            </li>
            <li>
              <strong>Admin</strong> also opens a read-only operations view with safe provider
              status and current limits.
            </li>
          </ul>
          <p className="login-aside-note">
            Access codes are checked on the server. Only the user demo code is shown in the form;
            the admin code stays with the site administrator.
          </p>
          <p>
            Read the <Link href="/privacy">privacy policy</Link> for what the session cookie does,
            or visit the <Link href="/faq">FAQ</Link> for the short version.
          </p>
        </aside>
      </div>
    </StaticPage>
  );
}
