import { getSafeProviderStatus } from "@/lib/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { status: "ok", provider: getSafeProviderStatus() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
