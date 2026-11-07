import { NextResponse, type NextRequest } from "next/server";
import { missingAuthEnv } from "@/designs/admin-config";
import { adminCookie, STATE_COOKIE } from "@/designs/session";

// Starts GitHub sign-in without any scope: only the public profile id is needed.
export function GET(request: NextRequest) {
  if (missingAuthEnv().length) return NextResponse.redirect(new URL("/admin?error=config", request.url));
  const state = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.search = new URLSearchParams({ client_id: process.env.GITHUB_CLIENT_ID!, redirect_uri: `${request.nextUrl.origin}/api/auth/callback`, state, allow_signup: "false" }).toString();
  const response = NextResponse.redirect(authorize);
  response.cookies.set(STATE_COOKIE, state, { ...adminCookie, maxAge: 600 });
  return response;
}
