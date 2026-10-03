"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CodeRunwayProvider } from "@/components/coderunway-provider";

const WORKFLOW_ROUTES = ["/issue", "/plan", "/run", "/review", "/verify"];

function isWorkflowRoute(pathname: string) {
  return WORKFLOW_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (!pathname || !isWorkflowRoute(pathname)) return <>{children}</>;

  return <CodeRunwayProvider>{children}</CodeRunwayProvider>;
}
