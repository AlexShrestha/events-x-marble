/**
 * Thin HTTP client for events.timesmarble.com endpoints.
 * Returns parsed JSON on success, throws on non-2xx.
 */

export async function register({
  siteUrl,
  displayName,
  label,
  defaultCitySlug,
  connectSessionId,
}) {
  const body = {};
  if (displayName) body.display_name = displayName;
  if (label) body.label = label;
  if (defaultCitySlug) body.default_city_slug = defaultCitySlug;
  if (connectSessionId) body.connect_session_id = connectSessionId;

  const res = await fetch(`${trimSlash(siteUrl)}/api/v1/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseOrThrow(res, "register");
}

export async function pushPicks({ siteUrl, token, payload }) {
  const url = `${trimSlash(siteUrl)}/api/v1/me/picks?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, "push-picks");
}

export async function getPicks({ siteUrl, token, city }) {
  const url = `${trimSlash(siteUrl)}/api/v1/me/picks?city=${encodeURIComponent(city)}&token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { method: "GET" });
  return parseOrThrow(res, "get-picks");
}

export async function rotateToken({ siteUrl, token, label }) {
  const params = new URLSearchParams({ token });
  if (label) params.set("label", label);
  const url = `${trimSlash(siteUrl)}/api/v1/me/token/rotate?${params.toString()}`;
  const res = await fetch(url, { method: "POST" });
  return parseOrThrow(res, "rotate-token");
}

export async function disconnect({ siteUrl, token }) {
  const url = `${trimSlash(siteUrl)}/api/v1/me/token/disconnect?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { method: "POST" });
  return parseOrThrow(res, "disconnect");
}

function trimSlash(url) {
  return url.replace(/\/$/, "");
}

async function parseOrThrow(res, action) {
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const detail = typeof body === "string" ? body : body?.error || JSON.stringify(body);
    throw new Error(`${action} failed: HTTP ${res.status} — ${detail || res.statusText}`);
  }
  return body;
}
