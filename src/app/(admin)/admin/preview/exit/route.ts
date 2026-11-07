import { NextResponse, type NextRequest } from "next/server";
import { PREVIEW_COOKIE, previewCookie } from "@/designs/session";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(PREVIEW_COOKIE, "", { ...previewCookie, maxAge: 0 });
  return response;
}
