import { get, parseConnectionString } from "@vercel/edge-config";
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

export const edgeConfigId = (connectionString: string | undefined): string | null => (connectionString && parseConnectionString(connectionString)?.id) || null;

type WriteResult = { ok: true } | { ok: false; reason: "edge-config" } | { ok: false; reason: "save"; status?: number };

// Writes through the Vercel REST API (the read token in EDGE_CONFIG cannot write). Never throws.
export async function writeActiveDesign(id: DesignId): Promise<WriteResult> {
  const store = edgeConfigId(process.env.EDGE_CONFIG);
  const token = process.env.VERCEL_TOKEN;
  if (!store || !token) return { ok: false, reason: "edge-config" };
  const team = process.env.VERCEL_TEAM_ID ? `?teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}` : "";
  try {
    const response = await fetch(`https://api.vercel.com/v1/edge-config/${store}/items${team}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ operation: "upsert", key: "activeDesign", value: id }] }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok ? { ok: true } : { ok: false, reason: "save", status: response.status };
  } catch {
    return { ok: false, reason: "save" };
  }
}
