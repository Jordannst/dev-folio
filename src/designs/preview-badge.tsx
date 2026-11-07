"use client";
import { useEffect, useState } from "react";
import { designs } from "@/designs/registry";
import { PREVIEW_COOKIE } from "@/designs/session";

// Read in the browser so design pages stay static. Inline styles keep it independent of every design's CSS.
export function PreviewBadge() {
  const [name, setName] = useState<string>();
  useEffect(() => {
    const id = document.cookie.split("; ").find(cookie => cookie.startsWith(`${PREVIEW_COOKIE}=`))?.slice(PREVIEW_COOKIE.length + 1);
    setName(designs.find(design => design.id === id)?.name);
  }, []);
  if (!name) return null;
  return <aside aria-label="Preview" className="design-preview-badge" style={{ position: "fixed", left: 12, bottom: 12, zIndex: 2147483000, padding: "6px 10px", borderRadius: 6, background: "#111", color: "#fff", font: "12px/1.4 system-ui, sans-serif" }}>
    <style>{".design-preview-badge a:focus-visible{outline:2px solid #fff!important;outline-offset:2px}"}</style>
    Preview: {name} · <a href="/admin/preview/exit" style={{ color: "#fff", textDecoration: "underline" }}>Keluar</a>
  </aside>;
}
