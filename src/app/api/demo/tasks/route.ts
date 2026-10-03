import { DEMO_TASKS } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { tasks: DEMO_TASKS },
    { headers: { "Cache-Control": "no-store" } },
  );
}
