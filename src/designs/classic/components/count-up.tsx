"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useRevealState } from "./reveal";

export function CountUp({ value }: { value: number }) {
  const [ref, state] = useRevealState<HTMLSpanElement>();
  const reduced = useReducedMotion();
  const count = useMotionValue(value);
  const text = useTransform(count, latest => Math.round(latest).toLocaleString("en"));
  useEffect(() => {
    if (reduced) return count.set(value);
    if (state === "pending") count.set(0);
    if (state === "shown") { const controls = animate(count, value, { duration: 1.2, ease: "easeOut" }); return () => controls.stop(); }
  }, [state, reduced, value, count]);
  return <><span className="sr-only">{value.toLocaleString("en")}</span><motion.span ref={ref} aria-hidden="true">{text}</motion.span></>;
}
