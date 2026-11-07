import { get } from "@vercel/edge-config";
import { defaultDesign, resolveDesign, type DesignId } from "./registry.ts";

// ok=false means the store was unreachable or unset; callers still get a usable design.
export async function readActiveDesign(): Promise<{ id: DesignId; ok: boolean }> {
  if (!process.env.EDGE_CONFIG) return { id: defaultDesign, ok: false };
  try {
    return { id: resolveDesign(await get("activeDesign")), ok: true };
  } catch {
    return { id: defaultDesign, ok: false };
  }
}
