"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { useInView } from "motion/react";

// Content stays visible until hydration; only elements still below the fold are hidden, then revealed once.
export function useRevealState<T extends Element>() {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [state, setState] = useState<"idle" | "pending" | "shown">("idle");
  useEffect(() => { if (ref.current!.getBoundingClientRect().top > innerHeight) setState("pending"); }, []);
  useEffect(() => { if (inView) setState(value => value === "pending" ? "shown" : value); }, [inView]);
  return [ref, state] as const;
}

export function Reveal(props: ComponentProps<"section">) {
  const [ref, state] = useRevealState<HTMLElement>();
  return <section ref={ref} data-reveal={state} {...props} />;
}
