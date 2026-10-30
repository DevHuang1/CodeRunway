"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthRole, AuthSession } from "@/lib/auth";

interface SignInResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  session: AuthSession | null;
  isAdmin: boolean;
  busy: boolean;
  signIn: (role: AuthRole, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: AuthSession | null;
}) {
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [busy, setBusy] = useState(false);

  const signIn = useCallback(async (role: AuthRole, password: string): Promise<SignInResult> => {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as { role?: AuthRole; error?: string };
      if (!response.ok || !payload.role) {
        return { ok: false, error: payload.error ?? "That sign-in could not be completed." };
      }
      setSession({ role: payload.role });
      return { ok: true };
    } catch {
      return { ok: false, error: "The sign-in service could not be reached. Try again." };
    } finally {
      setBusy(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setSession(null);
      setBusy(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isAdmin: session?.role === "admin",
    busy,
    signIn,
    signOut,
  }), [busy, session, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
