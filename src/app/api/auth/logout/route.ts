import { NextResponse, type NextRequest } from "next/server";
import { adminCookie, PREVIEW_COOKIE, SESSION_COOKIE } from "@/designs/session";

export function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", { ...adminCookie, maxAge: 0 });
  response.cookies.delete(PREVIEW_COOKIE);
  return response;
}
