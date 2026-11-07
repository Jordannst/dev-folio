"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeActiveDesign } from "@/designs/edge-config";
import { isDesignId } from "@/designs/registry";
import { SESSION_COOKIE, verifySession } from "@/designs/session";

// Next checks the Origin header of Server Action requests, so no extra CSRF token is needed.
export async function activateDesign(formData: FormData) {
  if (!await verifySession((await cookies()).get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET, process.env.ADMIN_GITHUB_ID)) redirect("/admin");
  const id = formData.get("id");
  if (!isDesignId(id)) redirect("/admin");
  const result = await writeActiveDesign(id);
  if (result.ok) {
    revalidatePath("/admin");
    redirect(`/admin?activated=${id}`);
  }
  if (result.reason === "edge-config") redirect("/admin?error=edge-config");
  redirect(`/admin?error=save${result.status ? `&status=${result.status}` : ""}`);
}
