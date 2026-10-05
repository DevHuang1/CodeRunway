import { describe, expect, it } from "vitest";
import { readBoundedJson, RequestBodyTooLargeError } from "@/lib/request-json";

describe("bounded agent API payloads", () => {
  it("parses valid JSON and rejects declared oversized bodies", async () => {
    const valid = new Request("http://localhost/api/agent/plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ taskId: "signup-validation" }),
    });
    await expect(readBoundedJson(valid)).resolves.toEqual({ taskId: "signup-validation" });

    const oversized = new Request("http://localhost/api/agent/plan", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": "1024" },
      body: "{}",
    });
    await expect(readBoundedJson(oversized, 16)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
  });

  it("rejects oversized streamed bodies even when no content length is provided", async () => {
    const request = new Request("http://localhost/api/agent/run", {
      method: "POST",
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array(12));
          controller.close();
        },
      }),
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    await expect(readBoundedJson(request, 8)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
  });
});
