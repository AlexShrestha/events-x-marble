/**
 * esbuild entry for the Vercel deploy. Bundled into api/index.mjs.
 *
 * Lazy app loading + error capture so a module-init failure (e.g. bad env vars)
 * surfaces as an actual 500 response body, not an opaque FUNCTION_INVOCATION_FAILED.
 */
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

export default async function handler(request: Request): Promise<Response> {
  try {
    const app = await getApp();
    return await app.fetch(request);
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}\n\n${e.stack ?? ""}` : String(e);
    return new Response("EXM_ERR\n\n" + msg, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
