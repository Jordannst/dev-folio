import { ViewTransition } from "react";

const slide = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };

// Slides the whole page only for typed links (SEE MORE / Back home); other updates stay untouched.
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <ViewTransition enter={slide} exit={slide} default="none">{children}</ViewTransition>;
}
