import { cookies } from "next/headers";
import { z } from "zod";
import { AUTH_SESSION_COOKIE, AUTH_ROLE_LABELS } from "@/lib/auth";
import { createSessionToken, sessionCookieOptions, verifyCredentials } from "@/lib/auth-server";
import { readBoundedJson, RequestBodyTooLargeError } from "@/lib/request-json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = z.object({
  role: z.enum(["user", "admin"]),
  password: z.string().min(1).max(200),
}).strict();

export async function POST(request: Request) {
  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await readBoundedJson(request, 4 * 1024));
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return Response.json(
        { error: "That sign-in request was too large." },
        { status: 413, headers: { "Cache-Control": "no-store" } },
      );
    }
    return Response.json(
      { error: "Choose a role and enter the matching password." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!verifyCredentials(body.role, body.password)) {
    return Response.json(
      { error: `That password is not correct for the ${AUTH_ROLE_LABELS[body.role]} role.` },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, createSessionToken(body.role), sessionCookieOptions());

  return Response.json(
    { role: body.role },
    { headers: { "Cache-Control": "no-store" } },
  );
}
