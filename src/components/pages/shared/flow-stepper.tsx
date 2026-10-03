"use client";

import { useRouter } from "next/navigation";
import { FLOW_STAGE_LABELS, FLOW_STAGES, flowStageIndex, flowStagePath, type FlowStage } from "@/lib/flow";
import { useCodeRunway } from "@/components/coderunway-provider";

export function FlowStepper({ currentStage }: { currentStage: FlowStage }) {
  const router = useRouter();
  const { canVisit } = useCodeRunway();
  const currentIndex = flowStageIndex(currentStage);

  return (
    <nav className="flow-stepper" aria-label="CodeRunway workflow">
      <ol>
        {FLOW_STAGES.map((stage, index) => {
          const accessible = canVisit(stage);
          const state = stage === currentStage ? "current" : index < currentIndex && accessible ? "complete" : accessible ? "available" : "locked";
          return (
            <li className={`flow-step ${state}`} key={stage}>
              <button
                type="button"
                disabled={!accessible || stage === currentStage}
                aria-current={stage === currentStage ? "step" : undefined}
                aria-label={`${FLOW_STAGE_LABELS[stage]} step${state === "locked" ? ", locked" : ""}`}
                onClick={() => router.push(flowStagePath(stage))}
              >
                <span className="flow-step-index" aria-hidden="true">{index + 1}</span>
                <span>{FLOW_STAGE_LABELS[stage]}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
