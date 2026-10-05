import { createHash } from "node:crypto";
import { LIVE_REQUEST_LIMITS } from "@/lib/provider";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const MAX_CLIENT_BUCKETS = 10_000;

interface WindowBucket {
  startsAt: number;
  count: number;
}

export type LimitDecision =
  | { allowed: true; release: () => void }
  | { allowed: false; reason: "client" | "application" | "concurrency"; retryAfterSeconds: number };

export interface RequestLimitConfig {
  perClientPerMinute: number;
  perApplicationPerHour: number;
  concurrentRequests: number;
}

export class LiveRequestLimiter {
  private readonly clientBuckets = new Map<string, WindowBucket>();
  private applicationBucket: WindowBucket | null = null;
  private inFlight = 0;

  constructor(private readonly limits: RequestLimitConfig = LIVE_REQUEST_LIMITS) {}

  acquire(clientKey: string, now = Date.now()): LimitDecision {
    this.pruneExpiredClients(now);
    const minuteStart = Math.floor(now / MINUTE_MS) * MINUTE_MS;
    const hourStart = Math.floor(now / HOUR_MS) * HOUR_MS;
    const clientBucket = this.clientBuckets.get(clientKey);
    const currentClient = clientBucket?.startsAt === minuteStart ? clientBucket : { startsAt: minuteStart, count: 0 };
    const currentApplication = this.applicationBucket?.startsAt === hourStart
      ? this.applicationBucket
      : { startsAt: hourStart, count: 0 };

    if (currentClient.count >= this.limits.perClientPerMinute) {
      return { allowed: false, reason: "client", retryAfterSeconds: secondsUntil(minuteStart + MINUTE_MS, now) };
    }
    if (currentApplication.count >= this.limits.perApplicationPerHour) {
      return { allowed: false, reason: "application", retryAfterSeconds: secondsUntil(hourStart + HOUR_MS, now) };
    }
    if (this.inFlight >= this.limits.concurrentRequests) {
      return { allowed: false, reason: "concurrency", retryAfterSeconds: 5 };
    }

    currentClient.count += 1;
    currentApplication.count += 1;
    this.clientBuckets.set(clientKey, currentClient);
    this.applicationBucket = currentApplication;
    this.inFlight += 1;

    let released = false;
    return {
      allowed: true,
      release: () => {
        if (released) return;
        released = true;
        this.inFlight = Math.max(0, this.inFlight - 1);
      },
    };
  }

  private pruneExpiredClients(now: number) {
    for (const [key, bucket] of this.clientBuckets) {
      if (now - bucket.startsAt >= MINUTE_MS) this.clientBuckets.delete(key);
    }
    while (this.clientBuckets.size >= MAX_CLIENT_BUCKETS) {
      const oldestKey = this.clientBuckets.keys().next().value;
      if (oldestKey === undefined) break;
      this.clientBuckets.delete(oldestKey);
    }
  }
}

function secondsUntil(timestamp: number, now: number): number {
  return Math.max(1, Math.ceil((timestamp - now) / 1_000));
}

function clientKeyFromRequest(request: Request): string {
  const candidate = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-real-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim()
    ?? "unknown-client";
  return createHash("sha256").update(candidate.slice(0, 128)).digest("hex");
}

const globalState = globalThis as typeof globalThis & { coderunwayLiveRequestLimiter?: LiveRequestLimiter };
const sharedLimiter = globalState.coderunwayLiveRequestLimiter
  ?? (globalState.coderunwayLiveRequestLimiter = new LiveRequestLimiter());

export function acquireLiveRequest(request: Request): LimitDecision {
  return sharedLimiter.acquire(clientKeyFromRequest(request));
}

export function rateLimitResponse(decision: Extract<LimitDecision, { allowed: false }>): Response {
  const message = decision.reason === "client"
    ? "Request limit reached. Wait a minute before making another live request."
    : decision.reason === "application"
      ? "The app's hourly live-request budget is used up. Try again after the limit resets."
      : "The maximum number of live requests is already running. Try again shortly.";
  return Response.json(
    { error: message, code: "LIVE_REQUEST_LIMIT" },
    { status: decision.reason === "concurrency" ? 503 : 429, headers: { "Retry-After": String(decision.retryAfterSeconds), "Cache-Control": "no-store" } },
  );
}
