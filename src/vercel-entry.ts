/**
 * Vercel Node serverless entry. Bridges legacy (IncomingMessage, ServerResponse)
 * to the Hono app (Fetch API). Lazy app import so module-init errors surface
 * as a 500 response with stack, not opaque FUNCTION_INVOCATION_FAILED.
 */
import type { IncomingMessage, ServerResponse } from "node:http";

let _app: { fetch: (req: Request) => Promise<Response> } | null = null;
let _appError: Error | null = null;

async function getApp() {
  if (_appError) throw _appError;
  if (_app) return _app;
  try {
    const mod = await import("./app.tsx");
    _app = mod.app as { fetch: (req: Request) => Promise<Response> };
    return _app;
  } catch (e) {
    _appError = e instanceof Error ? e : new Error(String(e));
    throw _appError;
  }
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const app = await getApp();

    // Build a Web Request from the Node IncomingMessage.
    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "localhost";
    const url = `${proto}://${host}${req.url ?? "/"}`;

    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers.append(k, v);
      else if (Array.isArray(v)) for (const vv of v) headers.append(k, vv);
    }

    let body: Uint8Array | undefined;
    if (req.method && !["GET", "HEAD"].includes(req.method)) {
      const chunks: Buffer[] = [];
      for await (const chunk of req as AsyncIterable<Buffer>) chunks.push(chunk);
      body = Buffer.concat(chunks);
    }

    const fetchReq = new Request(url, {
      method: req.method ?? "GET",
      headers,
      ...(body && body.length > 0 ? { body } : {}),
    });

    const response = await app.fetch(fetchReq);

    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    const msg = e instanceof Error ? `${e.name}: ${e.message}\n\n${e.stack ?? ""}` : String(e);
    res.end("EXM_ERR\n\n" + msg);
  }
}
