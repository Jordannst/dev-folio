import { NextResponse, type NextRequest } from "next/server";
import { missingAuthEnv } from "@/designs/admin-config";
import { adminCookie, SESSION_COOKIE, SESSION_MAX_AGE, signSession, STATE_COOKIE } from "@/designs/session";

// Exchanges the GitHub code, compares the account id with ADMIN_GITHUB_ID, and keeps no GitHub token.
export async function GET(request: NextRequest) {
  const finish = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    response.cookies.set(STATE_COOKIE, "", { ...adminCookie, maxAge: 0 });
    return response;
  };
  if (missingAuthEnv().length) return finish("/admin?error=config");
  const { searchParams } = request.nextUrl;
  const state = searchParams.get("state");
  const code = searchParams.get("code");
  if (!state || state !== request.cookies.get(STATE_COOKIE)?.value || !code || searchParams.has("error")) return finish("/admin?error=login");
  try {
    const exchange = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code, redirect_uri: `${request.nextUrl.origin}/api/auth/callback` }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const { access_token: token } = await exchange.json();
    if (!exchange.ok || typeof token !== "string") return finish("/admin?error=login");
    const user = await fetch("https://api.github.com/user", {
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "User-Agent": "jordannst.dev-admin" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!user.ok) return finish("/admin?error=login");
    const { id } = await user.json();
    if (String(id) !== process.env.ADMIN_GITHUB_ID) return finish("/admin?error=denied");
    const response = finish("/admin");
    response.cookies.set(SESSION_COOKIE, await signSession(String(id), process.env.SESSION_SECRET!), { ...adminCookie, maxAge: SESSION_MAX_AGE });
    return response;
  } catch {
    return finish("/admin?error=login");
  }
}
