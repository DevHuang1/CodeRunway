"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { flowStagePath, latestValidStage, type FlowStage } from "@/lib/flow";
import { useCodeRunway } from "@/components/coderunway-provider";

export function StageGate({ stage, children }: { stage: FlowStage; children: ReactNode }) {
  const router = useRouter();
  const { initialized, canVisit, plan, planApproved, result } = useCodeRunway();
  const allowed = initialized && canVisit(stage);
  const fallbackStage = latestValidStage({
    hasPlan: Boolean(plan),
    planApproved,
    hasResult: Boolean(result),
  });

  useEffect(() => {
    if (initialized && !canVisit(stage)) {
      const resetQuery = fallbackStage === "issue" ? "?reset=1" : "";
      router.replace(`${flowStagePath(fallbackStage)}${resetQuery}`);
    }
  }, [canVisit, fallbackStage, initialized, router, stage]);

  if (!initialized) return <div className="page-loading">Preparing your safe workspace…</div>;
  if (!allowed) return null;
  return <>{children}</>;
}
