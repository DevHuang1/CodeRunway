import { z } from "zod";
import { createPlan } from "@/lib/agent";
import { getDemoTask } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

const requestSchema = z.object({ taskId: z.string().min(1).max(80) });

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const task = getDemoTask(body.taskId);
    if (!task) {
      return Response.json({ error: "Unknown demo task" }, { status: 404 });
    }

    const plan = await createPlan(task);
    return Response.json(plan, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create a plan";
    return Response.json(
      { error: message.slice(0, 240) },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
