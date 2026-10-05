export const MAX_AGENT_REQUEST_BYTES = 16 * 1024;

export class RequestBodyTooLargeError extends Error {
  constructor() {
    super("Request body exceeds the maximum allowed size");
    this.name = "RequestBodyTooLargeError";
  }
}

export async function readBoundedJson(request: Request, maxBytes = MAX_AGENT_REQUEST_BYTES): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) throw new RequestBodyTooLargeError();
  if (!request.body) throw new SyntaxError("Request body is empty");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new RequestBodyTooLargeError();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(body)) as unknown;
}
