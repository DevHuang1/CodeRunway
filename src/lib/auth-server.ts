import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE_SECONDS,
  DEMO_USER_ACCESS_CODE,
  isAuthRole,
  type AuthRole,
  type AuthSession,
} from "@/lib/auth";

const DEFAULT_JUDGE_PASSWORD = "STUDYADMIN";

// Demo deployments work out of the box. Set AUTH_SECRET and custom passwords
// before treating this sign-in as anything more than a sample role switch.
const SESSION_SECRET = process.env.AUTH_SECRET?.trim() || "coderunway-demo-session-secret";

interface SessionPayload extends AuthSession {
  expiresAt: number;
}

function expectedPassword(role: AuthRole): string {
  if (role === "admin") {
    return process.env.ADMIN_PASSWORD?.trim() || DEFAULT_JUDGE_PASSWORD;
  }
  return DEMO_USER_ACCESS_CODE;
}

/** Only expose the built-in demo password, never a deployment-specific override. */
export function getPublicJudgeDemoPassword(): string | null {
  const configuredPassword = process.env.ADMIN_PASSWORD?.trim();
  return !configuredPassword || configuredPassword === DEFAULT_JUDGE_PASSWORD
    ? DEFAULT_JUDGE_PASSWORD
    : null;
}

function passwordsMatch(expected: string, provided: string): boolean {
  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  return expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes);
}

export function verifyCredentials(role: AuthRole, password: string): boolean {
  return passwordsMatch(expectedPassword(role), password);
}

function signPayload(payload: string): string {
  return createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
}

export function createSessionToken(role: AuthRole): string {
  const payload: SessionPayload = {
    role,
    expiresAt: Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1_000,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${signPayload(encoded)}`;
}

export function readSessionToken(token: string | undefined): AuthSession | null {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = Buffer.from(signPayload(encoded));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (!isAuthRole(payload.role) || typeof payload.expiresAt !== "number" || payload.expiresAt <= Date.now()) {
      return null;
    }
    return { role: payload.role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(AUTH_SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  };
}
