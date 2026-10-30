"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import {
  AUTH_ROLE_LABELS,
  DEMO_USER_ACCESS_CODE,
  type AuthRole,
} from "@/lib/auth";

export function LoginForm({ nextPath }: { nextPath: string | null }) {
  const { session, isAdmin, busy, signIn, signOut } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<AuthRole>("user");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const wantsAdmin = nextPath === "/admin";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!password) {
      setError("Enter the access code for the selected role.");
      return;
    }
    if (role === "user" && wantsAdmin) {
      setError("The admin console needs the admin access code. Choose Admin to continue.");
      return;
    }

    const result = await signIn(role, password);
    if (!result.ok) {
      setError(result.error ?? "That sign-in could not be completed.");
      return;
    }

    setPassword("");
    const destination = nextPath ?? (role === "admin" ? "/admin" : "/issue");
    router.push(destination);
    router.refresh();
  }

  async function handleSignOut() {
    await signOut();
    router.refresh();
  }

  if (session) {
    const label = AUTH_ROLE_LABELS[session.role];
    return (
      <div className="login-session">
        <span className="eyebrow">SESSION FOUND</span>
        <h2>You are signed in as {label === "Admin" ? "an" : "a"} {label.toLowerCase()}.</h2>
        <p>
          {isAdmin
            ? "The admin role opens the read-only operations view in addition to the sample workspace."
            : "The user role opens the sample workspace with the standard review path."}
        </p>
        {wantsAdmin && !isAdmin ? (
          <p className="login-notice" role="status">
            The admin console needs an admin session. Log out, then choose Admin and enter the admin access code.
          </p>
        ) : null}
        <div className="login-session-actions">
          <Link className="button button-primary" href={wantsAdmin && isAdmin ? "/admin" : "/issue"}>
            {wantsAdmin && isAdmin ? "Open the admin console" : "Open the sample workspace"}
            <span aria-hidden="true">→</span>
          </Link>
          {isAdmin && wantsAdmin ? <Link className="button button-quiet" href="/issue">Open the sample workspace</Link> : null}
          <button type="button" className="button button-quiet" onClick={() => void handleSignOut()} disabled={busy}>
            {busy ? "Logging out…" : "Log out"}
          </button>
        </div>
        <p className="login-footnote">
          Sessions last up to eight hours in this browser. Logging out clears the session cookie immediately.
        </p>
      </div>
    );
  }

  return (
    <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
      <div className="login-field-group">
        <label htmlFor="login-role">Sign in as</label>
        <div className="login-select-wrap">
          <select
            id="login-role"
            value={role}
            onChange={(event) => {
              setRole(event.target.value as AuthRole);
              setError("");
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <span aria-hidden="true">▾</span>
        </div>
      </div>

      <div className="login-field-group">
        <label htmlFor="login-password">Access code</label>
        <div className="login-field">
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={role === "admin" ? "Administrator access code" : "User access code"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby="login-password-hint"
          />
          {role === "user" ? (
            <p className="login-field-hint" id="login-password-hint">
              Demo user code: <code>{DEMO_USER_ACCESS_CODE}</code>
              <button type="button" onClick={() => setPassword(DEMO_USER_ACCESS_CODE)}>
                Fill
              </button>
            </p>
          ) : (
            <p className="login-field-hint" id="login-password-hint">
              Admin access uses the administrator password configured for this deployment.
            </p>
          )}
        </div>
      </div>

      {error ? (
        <div className="error-box" role="alert">
          <strong>Sign-in needs attention</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <button type="submit" className="button button-primary login-submit" disabled={busy}>
        {busy ? "Signing in…" : `Sign in as ${AUTH_ROLE_LABELS[role]}`}
        {!busy ? <span aria-hidden="true">→</span> : null}
      </button>

      <p className="login-footnote">
        This demo uses one shared access code per role. It does not create a personal account or collect an email address.
      </p>
    </form>
  );
}
