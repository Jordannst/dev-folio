"use client";

import { useEffect, useRef } from "react";
import { companionPoses } from "@/lib/companion-state";

// Pogo perches on the stage: blinks while idle, greets once, and waves when the login button is hovered.
export function Pogo() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sprite = ref.current!;
    let pose: "idle" | "wave" = "idle", frame = 0, timer = 0;
    const paint = () => {
      const index = companionPoses[pose].offset + frame;
      sprite.style.backgroundPosition = `${(index % 8) / 7 * 100}% ${Math.floor(index / 8) / 3 * 100}%`;
    };
    const schedule = () => {
      const wait = pose === "idle" && frame === 0 ? 1600 + Math.random() * 2400 : companionPoses[pose].durations[frame];
      timer = window.setTimeout(step, wait);
    };
    const step = () => {
      frame += 1;
      if (frame === companionPoses[pose].durations.length) [pose, frame] = ["idle", 0];
      paint();
      schedule();
    };
    const wave = () => {
      if (pose === "wave") return;
      clearTimeout(timer);
      [pose, frame] = ["wave", 0];
      paint();
      schedule();
    };
    const greet = window.setTimeout(wave, 1900);
    addEventListener("pogo:wave", wave);
    schedule();
    return () => { clearTimeout(timer); clearTimeout(greet); removeEventListener("pogo:wave", wave); };
  }, []);
  return <span ref={ref} className="pogo" aria-hidden="true" onPointerEnter={() => dispatchEvent(new Event("pogo:wave"))} />;
}
