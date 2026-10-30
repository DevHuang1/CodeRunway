"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { AUTH_ROLE_LABELS } from "@/lib/auth";

export function AccountMenu() {
  const { session, isAdmin, busy, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointer(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  }

  if (!session) {
    return (
      <Link className="landing-header-link account-signin" href="/login">
        Sign in <span aria-hidden="true">→</span>
      </Link>
    );
  }

  const label = AUTH_ROLE_LABELS[session.role];

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        type="button"
        className={`account-trigger account-trigger-${session.role}`}
        aria-label={`${label} account menu`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="account-dot" aria-hidden="true" />
        <span>{label}</span>
        <span className="account-caret" aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div className="account-popover" role="menu" aria-label="Account actions">
          <p className="account-popover-label">
            Signed in as <strong>{label}</strong>
          </p>
          <Link role="menuitem" href="/issue" onClick={() => setOpen(false)}>
            Open workspace
          </Link>
          {isAdmin ? (
            <Link role="menuitem" href="/admin" onClick={() => setOpen(false)}>
              Judge console
            </Link>
          ) : null}
          <Link role="menuitem" href="/login" onClick={() => setOpen(false)}>
            Account
          </Link>
          <button type="button" role="menuitem" disabled={busy} onClick={() => void handleSignOut()}>
            {busy ? "Logging out…" : "Log out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
