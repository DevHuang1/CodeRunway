"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { CodeRunwayProvider } from "@/components/coderunway-provider";
import type { AuthSession } from "@/lib/auth";

const WORKFLOW_ROUTES = ["/issue", "/plan", "/run", "/review", "/verify"];

function isWorkflowRoute(pathname: string) {
  return WORKFLOW_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function AppProviders({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: AuthSession | null;
}) {
  const pathname = usePathname();
  const isWorkflow = Boolean(pathname && isWorkflowRoute(pathname));

  return (
    <AuthProvider initialSession={initialSession}>
      {isWorkflow ? <CodeRunwayProvider>{children}</CodeRunwayProvider> : children}
    </AuthProvider>
  );
}
