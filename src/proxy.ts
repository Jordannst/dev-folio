import { NextResponse, type NextRequest } from "next/server";
import { readActiveDesign } from "@/designs/edge-config";
import { decideRoute } from "@/designs/routing";
import { PREVIEW_COOKIE, previewCookie, SESSION_COOKIE, verifySession } from "@/designs/session";

export const config = { matcher: ["/", "/projects", "/designs/:path*"] };

// Serves the design chosen in /admin: public paths rewrite to /designs/<id>, which stay hidden outside development.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const previewDesign = request.cookies.get(PREVIEW_COOKIE)?.value;
  const hasAdminSession = previewDesign !== undefined && await verifySession(request.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET, process.env.ADMIN_GITHUB_ID);
  const activeDesign = pathname === "/" || pathname === "/projects" ? (await readActiveDesign()).id : undefined;
  const decision = decideRoute({ pathname, activeDesign, previewDesign, hasAdminSession, dev: process.env.NODE_ENV === "development" });
  if (decision.kind === "next") return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = decision.kind === "rewrite" ? decision.pathname : "/__design-not-found";
  const response = NextResponse.rewrite(url);
  if (decision.kind === "rewrite" && decision.clearPreview) response.cookies.set(PREVIEW_COOKIE, "", { ...previewCookie, maxAge: 0 });
  return response;
}
