// Admin session: base64url(JSON {sub, exp}).base64url(HMAC-SHA256), signed with SESSION_SECRET.
export const SESSION_COOKIE = "__Host-admin_session";
export const STATE_COOKIE = "__Host-oauth_state";
export const PREVIEW_COOKIE = "design_preview";
export const SESSION_MAX_AGE = 604800;

const encoder = new TextEncoder();
const toBase64Url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64Url = (text: string) => {
  if (!/^[\w-]+$/.test(text)) throw new Error("Not base64url");
  return Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), char => char.charCodeAt(0));
};
const hmacKey = (secret: string, usage: "sign" | "verify") => crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [usage]);

export async function signSession(sub: string, secret: string, now = Date.now()) {
  const payload = toBase64Url(encoder.encode(JSON.stringify({ sub, exp: now + SESSION_MAX_AGE * 1000 })));
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret, "sign"), encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

// Never throws: a broken cookie or missing configuration simply means "not signed in".
export async function verifySession(token: string | undefined, secret: string | undefined, adminId: string | undefined, now = Date.now()) {
  if (!token || !secret || !adminId) return false;
  try {
    const [payload, signature, ...rest] = token.split(".");
    if (rest.length || !payload || !signature) return false;
    if (!await crypto.subtle.verify("HMAC", await hmacKey(secret, "verify"), fromBase64Url(signature), encoder.encode(payload))) return false;
    const { sub, exp } = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return sub === adminId && typeof exp === "number" && now < exp;
  } catch {
    return false;
  }
}
