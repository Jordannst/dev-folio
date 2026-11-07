import type { Metadata } from "next";
import "./admin.css";

// Neutral on purpose: the panel never loads a design's fonts, CSS, or components.
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
