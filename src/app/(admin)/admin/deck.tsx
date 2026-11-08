"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Decorative stack of catalog thumbnails; every few seconds the front card tucks behind the others.
export function Deck({ ids }: { ids: string[] }) {
  const [turn, setTurn] = useState(0);
  useEffect(() => {
    if (ids.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setTurn(count => count + 1), 3600);
    return () => clearInterval(timer);
  }, [ids.length]);

  return <div className="deck" aria-hidden="true">
    {ids.map((id, index) => {
      const slot = (index - turn % ids.length + ids.length) % ids.length;
      return <Image
        key={id}
        src={`/design-thumbnails/${id}.webp`}
        width={640}
        height={400}
        alt=""
        sizes="320px"
        priority={index === 0}
        data-tuck={(turn > 0 && slot === ids.length - 1) || undefined}
        style={{ "--slot": slot } as React.CSSProperties}
      />;
    })}
  </div>;
}
