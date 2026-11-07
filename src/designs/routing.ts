import { isDesignId, resolveDesign } from "./registry.ts";

export type RouteDecision = { kind: "rewrite"; pathname: string; clearPreview: boolean } | { kind: "not-found" } | { kind: "next" };

const publicPaths: Record<string, string> = { "/": "", "/projects": "/projects" };

// Pure routing for src/proxy.ts: public paths rewrite to the active design (or the admin's preview),
// internal /designs paths stay hidden outside development.
export function decideRoute({ pathname, activeDesign, previewDesign, hasAdminSession, dev }: { pathname: string; activeDesign: unknown; previewDesign: string | undefined; hasAdminSession: boolean; dev: boolean }): RouteDecision {
  if (pathname === "/designs" || pathname.startsWith("/designs/")) return dev ? { kind: "next" } : { kind: "not-found" };
  if (!Object.hasOwn(publicPaths, pathname)) return { kind: "next" };
  const preview = hasAdminSession && isDesignId(previewDesign) ? previewDesign : undefined;
  return { kind: "rewrite", pathname: `/designs/${preview ?? resolveDesign(activeDesign)}${publicPaths[pathname]}`, clearPreview: previewDesign !== undefined && !preview };
}
