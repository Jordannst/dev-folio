"use client";

import { useEffect, useState } from "react";

const strokes = [
  ["M3 8C35 3 63 7 94 6S157 3 197 5"],
  ["M3 9C42 8 65 4 100 5S159 7 197 3"],
  ["M3 7C32 3 57 4 83 6S132 9 158 5S184 2 197 3", "M17 12C44 8 75 9 104 10S140 10 155 8"],
  ["M3 5C33 7 59 4 91 5S154 8 197 4", "M62 11C99 8 143 11 184 8"],
  ["M3 9C37 4 68 6 103 4S166 5 197 2", "M8 12C36 10 63 10 88 11"],
];

export function HanddrawnRole({ children }: { children: string }) {
  const [variant, setVariant] = useState<number | null>(null);

  // Choose after hydration so server and initial client markup stay identical.
  useEffect(() => setVariant(Math.floor(Math.random() * strokes.length)), []);

  return <strong className="role-accent">{children}
    {variant !== null && <svg className="role-underline" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true" data-style={variant}>
      {strokes[variant].map((path, index) => <path key={index} d={path} pathLength={1} className={index ? "role-underline-second" : undefined} />)}
    </svg>}
  </strong>;
}
