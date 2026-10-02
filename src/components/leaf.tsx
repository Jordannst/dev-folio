"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useInView } from "motion/react";

export function Leaf({ className = "" }: { className?: string }) {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const replay = () => setCycle(value => value + 1);
    document.addEventListener("portfolio:back-to-top", replay);
    return () => document.removeEventListener("portfolio:back-to-top", replay);
  }, []);
  return <GrowingLeaf key={cycle} className={className} />;
}

function GrowingLeaf({ className }: { className: string }) {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.3 });

  return <svg ref={ref} className={`leaf ${className}`} data-grown={visible} viewBox="0 0 180 180" aria-hidden="true">
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a6c9a9" /><stop offset="1" stopColor="#8da7ff" /></linearGradient></defs>
    <g className="leaf-sway">
      <path className="leaf-blade leaf-green" fill="#a6c9a9" d="M173 37C145 11 122 78 41 60 18 55 12 41 19 25-3 43 5 83 43 83c50 0 90-49 130-46Z"/>
      <path className="leaf-blade leaf-blue" fill={`url(#${id})`} d="M126 44c-24 21-50 32-57 63-7 29 22 44 16 65 32-15 42-39 29-66-14-29-6-46 12-62Z"/>
      <path className="leaf-stem" pathLength="1" d="M81 90c14-25 33-46 54-57" fill="none" stroke="#a6c9a9" strokeWidth="3"/>
    </g>
  </svg>;
}
