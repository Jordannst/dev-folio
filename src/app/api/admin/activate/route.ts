import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { writeActiveDesign } from "@/designs/edge-config";
import { isDesignId } from "@/designs/registry";
import { SESSION_COOKIE, verifySession } from "@/designs/session";

// Plain POST route; it checks Origin itself, as a Server Action would.
export async function POST(request: NextRequest) {
  const back = (query = "") => NextResponse.redirect(new URL(`/admin${query}`, request.url), 303);
  if (request.headers.get("origin") !== request.nextUrl.origin) return back();
  if (!await verifySession(request.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET, process.env.ADMIN_GITHUB_ID)) return back();
  const id = (await request.formData().catch(() => null))?.get("id");
  if (!isDesignId(id)) return back();
  const result = await writeActiveDesign(id);
  if (result.ok) {
    revalidatePath("/admin");
    return back(`?activated=${id}`);
  }
  return back(result.reason === "edge-config" ? "?error=edge-config" : `?error=save${result.status ? `&status=${result.status}` : ""}`);
}
