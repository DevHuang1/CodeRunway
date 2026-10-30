export const AUTH_ROLES = ["user", "admin"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export interface AuthSession {
  role: AuthRole;
}

export const AUTH_SESSION_COOKIE = "coderunway-demo-session";
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export const AUTH_ROLE_LABELS: Record<AuthRole, string> = {
  user: "User",
  admin: "Admin",
};

/**
 * The user access code is intentionally visible in the UI as a demo hint.
 * The admin code is never shipped to the browser; see auth-server.ts.
 */
export const DEMO_USER_ACCESS_CODE = "TESTUSER";

export function isAuthRole(value: unknown): value is AuthRole {
  return value === "user" || value === "admin";
}

export function safeNextPath(value: string | undefined): string | null {
  if (
    !value
    || !value.startsWith("/")
    || value.startsWith("//")
    || value.startsWith("/login")
    || value.includes("\\")
  ) {
    return null;
  }
  return value;
}
