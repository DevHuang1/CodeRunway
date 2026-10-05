import { describe, expect, it } from "vitest";
import { LiveRequestLimiter } from "@/lib/live-request-limiter";

describe("live Token Factory request limits", () => {
  it("limits a client to a fixed request count per minute", () => {
    const limiter = new LiveRequestLimiter({ perClientPerMinute: 2, perApplicationPerHour: 20, concurrentRequests: 2 });
    const first = limiter.acquire("client-a", 1_000);
    const second = limiter.acquire("client-a", 2_000);
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    if (first.allowed) first.release();
    if (second.allowed) second.release();

    expect(limiter.acquire("client-a", 30_000)).toMatchObject({
      allowed: false,
      reason: "client",
      retryAfterSeconds: 30,
    });
    const afterReset = limiter.acquire("client-a", 60_001);
    expect(afterReset.allowed).toBe(true);
    if (afterReset.allowed) afterReset.release();
  });

  it("enforces the process-wide hourly cap across clients", () => {
    const limiter = new LiveRequestLimiter({ perClientPerMinute: 10, perApplicationPerHour: 2, concurrentRequests: 2 });
    for (const client of ["client-a", "client-b"]) {
      const decision = limiter.acquire(client, 10_000);
      expect(decision.allowed).toBe(true);
      if (decision.allowed) decision.release();
    }

    expect(limiter.acquire("client-c", 11_000)).toMatchObject({ allowed: false, reason: "application" });
    const afterHour = limiter.acquire("client-c", 3_600_001);
    expect(afterHour.allowed).toBe(true);
    if (afterHour.allowed) afterHour.release();
  });

  it("limits concurrent live calls and releases a permit once", () => {
    const limiter = new LiveRequestLimiter({ perClientPerMinute: 10, perApplicationPerHour: 10, concurrentRequests: 1 });
    const first = limiter.acquire("client-a", 1_000);
    expect(first.allowed).toBe(true);
    expect(limiter.acquire("client-b", 1_001)).toMatchObject({ allowed: false, reason: "concurrency" });

    if (first.allowed) {
      first.release();
      first.release();
    }
    const next = limiter.acquire("client-b", 1_002);
    expect(next.allowed).toBe(true);
    if (next.allowed) next.release();
  });
});
