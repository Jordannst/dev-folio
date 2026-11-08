"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { designs } from "@/designs/registry";
import { Pogo } from "./pogo";

// A browser window cycling through the catalog. The current segment's fill animation drives the
// next slide, so pausing it (hover, focus, reduced motion) pauses the slideshow too.
export function Stage() {
  const [shown, setShown] = useState({ current: 0, previous: -1 });
  const frame = useRef<HTMLDivElement>(null);
  const show = (index: number) => setShown(state => index === state.current ? state : { current: index, previous: state.current });

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const style = frame.current!.style;
    let raf = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        style.setProperty("--px", (event.clientX / innerWidth - .5).toFixed(3));
        style.setProperty("--py", (event.clientY / innerHeight - .5).toFixed(3));
      });
    };
    addEventListener("pointermove", move);
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);

  return <div className="stage">
    <div className="frame" ref={frame}>
      <Pogo />
      <div className="frame-bar" aria-hidden="true"><span className="dots"><i /><i /><i /></span><span className="url">jordannst.dev</span></div>
      <div className="screen" aria-hidden="true">
        {designs.map((item, index) => <Image
          key={item.id}
          src={`/design-thumbnails/${item.id}.webp`}
          width={640}
          height={400}
          alt=""
          sizes="(max-width: 679px) 100vw, 560px"
          priority={index === 0}
          data-state={index === shown.current ? "current" : index === shown.previous ? "previous" : undefined}
        />)}
      </div>
    </div>
    <div className="segments">
      {designs.map((item, index) => <button key={item.id} type="button" aria-label={`Show ${item.name}`} aria-pressed={index === shown.current} onClick={() => show(index)}>
        <span className="fill" onAnimationEnd={() => show((index + 1) % designs.length)} />
      </button>)}
    </div>
  </div>;
}
