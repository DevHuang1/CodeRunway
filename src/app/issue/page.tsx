import { Suspense } from "react";
import { IssuePage } from "@/components/pages/issue/issue-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="page-loading">Preparing your safe workspace…</div>}>
      <IssuePage />
    </Suspense>
  );
}
