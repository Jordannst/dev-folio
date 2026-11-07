"use client";

import { useEffect, useRef, useState } from "react";

// A random dotted underline (one or two strokes), plotted on the 4px grid and drawn in pixel steps by CSS.
export function HanddrawnRole({ children }: { children: string }) {
  const ref = useRef<HTMLElement>(null);
  const [stroke, setStroke] = useState<{ width: number; dots: [number, number][] } | null>(null);

  // Choose after hydration so server and initial client markup stay identical; measure once the font is in.
  useEffect(() => {
    let live = true;
    void document.fonts.ready.then(() => {
      if (!live || !ref.current) return;
      const width = ref.current.offsetWidth, variant = Math.floor(Math.random() * 4), phase = Math.random() * 6;
      const frequency = [1.6, 2.4, 1.1, 3][variant], amplitude = [2, 1.5, 3, 1.2][variant], dots: [number, number][] = [];
      for (let x = 0; x < width; x += 4) dots.push([x, Math.round(4 + amplitude * Math.sin(x / width * Math.PI * frequency + phase))]);
      if (variant > 1) for (let x = Math.round(width * .15 / 4) * 4; x < width * .8; x += 4) dots.push([x, Math.round(9 + amplitude * .6 * Math.sin(x / width * Math.PI * frequency * 1.3 + phase + 1))]);
      setStroke({ width, dots });
    });
    return () => { live = false; };
  }, []);

  return <strong ref={ref} className="role">{children}
    {stroke && <svg className="scribble" viewBox={`0 0 ${stroke.width} 12`} width={stroke.width} height="12" aria-hidden="true">
      {stroke.dots.map(([x, y], index) => <rect key={index} x={x} y={y} width="2" height="2" />)}
    </svg>}
  </strong>;
}
