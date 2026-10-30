import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StaticPage } from "@/components/pages/legal/static-page";
import { getSession } from "@/lib/auth-server";
import { getSafeProviderStatus } from "@/lib/provider";

export const metadata: Metadata = {
  title: "Judge console — CodeRunway",
  description: "A read-only operations view for the CodeRunway sample workspace.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.role !== "admin") redirect("/login?next=/admin");

  const provider = getSafeProviderStatus();

  return (
    <StaticPage eyebrow="JUDGE CONSOLE" title="A quiet operations view." wide>
      <section aria-labelledby="admin-access">
        <h2 id="admin-access">Access</h2>
        <p>
          You are signed in with the demo Judge role. This view is read-only: it shows safe
          provider status and the limits that already apply to the sample workspace. It never
          exposes the model API key or changes server settings.
        </p>
      </section>

      <section aria-labelledby="admin-provider">
        <h2 id="admin-provider">Live model path</h2>
        <dl className="admin-facts">
          <div>
            <dt>Mode</dt>
            <dd>{provider.mode === "live" ? "Live Token Factory" : "Deterministic fallback"}</dd>
          </div>
          <div>
            <dt>Preference</dt>
            <dd>{provider.preference}</dd>
          </div>
          <div>
            <dt>Server key configured</dt>
            <dd>{provider.configured ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt>Model</dt>
            <dd>{provider.model}</dd>
          </div>
          <div>
            <dt>Base URL</dt>
            <dd>{provider.baseUrl}</dd>
          </div>
          <div>
            <dt>Output cap</dt>
            <dd>{provider.limits.maxOutputTokens.toLocaleString("en-US")} tokens per call</dd>
          </div>
          <div>
            <dt>Request timeout</dt>
            <dd>{Math.round(provider.limits.timeoutMs / 1_000)} seconds</dd>
          </div>
          <div>
            <dt>Usage guardrails</dt>
            <dd>
              {provider.limits.perClientPerMinute}/minute per client, {provider.limits.perApplicationPerHour}/hour
              per app process, {provider.limits.concurrentRequests} concurrent requests
            </dd>
          </div>
        </dl>
        <p className="field-help">
          These in-memory limits are safety guardrails, not a provider-side billing quota. They
          reset when the server restarts and are separate for each app instance.
        </p>
      </section>

      <section aria-labelledby="admin-boundaries">
        <h2 id="admin-boundaries">Boundaries that still apply</h2>
        <ul>
          <li>The sample task and its two editable files are fixed.</li>
          <li>Evaluation is static fixture checking, not code execution, compilation, or test running.</li>
          <li>The Judge role does not create a database record, a personal profile, or persistent project storage.</li>
          <li>Logging out clears the session cookie for this browser.</li>
        </ul>
      </section>

      <section aria-labelledby="admin-links">
        <h2 id="admin-links">Quick links</h2>
        <p>
          <Link href="/issue">Open the sample workspace</Link>
          {" · "}
          <Link href="/privacy">Review the privacy policy</Link>
          {" · "}
          <Link href="/contact">Contact the project</Link>
        </p>
      </section>
    </StaticPage>
  );
}
