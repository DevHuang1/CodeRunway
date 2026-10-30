import { cookies } from "next/headers";
import { AUTH_SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_SESSION_COOKIE);

  return Response.json(
    { signedOut: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
