import { NextResponse, type NextRequest } from "next/server";
import { isDesignId } from "@/designs/registry";
import { PREVIEW_COOKIE, previewCookie, SESSION_COOKIE, verifySession } from "@/designs/session";

// Session-only cookie (no Max-Age), readable by PreviewBadge; the proxy honors it only alongside a valid admin session.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDesignId(id) || !await verifySession(request.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET, process.env.ADMIN_GITHUB_ID)) return NextResponse.redirect(new URL("/admin", request.url));
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(PREVIEW_COOKIE, id, previewCookie);
  return response;
}
