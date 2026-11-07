import { NextResponse, type NextRequest } from "next/server";
import { adminCookie, PREVIEW_COOKIE, previewCookie, SESSION_COOKIE } from "@/designs/session";

export function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", { ...adminCookie, maxAge: 0 });
  response.cookies.set(PREVIEW_COOKIE, "", { ...previewCookie, maxAge: 0 });
  return response;
}
