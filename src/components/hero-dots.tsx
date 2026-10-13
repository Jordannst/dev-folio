"use client";

import { useEffect, useRef } from "react";

const GAP = 14, RADIUS = 120, PUSH = 18, STIFFNESS = .12, DAMPING = .78;
const GREEN = [166, 201, 169], BLUE = [141, 167, 255];

type Dot = { x: number; y: number; dx: number; dy: number; vx: number; vy: number };

export function HeroDots() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!, context = canvas.getContext("2d")!;
    const live = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let dots: Dot[] = [], width = 0, rest = "", frame = 0, visible = true;
    const pointer = { x: -1e4, y: -1e4 };

    const draw = () => {
      context.clearRect(0, 0, width, canvas.height);
      // Resting dots stay quieter than the rails; displaced dots draw at full strength.
      context.fillStyle = rest;
      context.globalAlpha = .5;
      for (const dot of dots) if (dot.dx === 0 && dot.dy === 0) context.fillRect(dot.x - .6, dot.y - .6, 1.2, 1.2);
      context.globalAlpha = 1;
      for (const dot of dots) {
        if (dot.dx === 0 && dot.dy === 0) continue;
        // Displaced dots pick up the leaf gradient across the viewport width.
        const t = dot.x / width, strength = Math.min(1, Math.hypot(dot.dx, dot.dy) / PUSH);
        const [r, g, b] = GREEN.map((channel, index) => Math.round(channel + (BLUE[index] - channel) * t));
        context.fillStyle = `rgba(${r},${g},${b},${.45 + .55 * strength})`;
        context.fillRect(dot.x + dot.dx - .9, dot.y + dot.dy - .9, 1.8, 1.8);
      }
    };

    const step = () => {
      let moving = false;
      for (const dot of dots) {
        const distanceX = dot.x - pointer.x, distanceY = dot.y - pointer.y, distance = Math.hypot(distanceX, distanceY);
        if (distance >= RADIUS && dot.dx === 0 && dot.dy === 0) continue;
        // Quadratic falloff: strongest push under the cursor, none at the radius edge.
        const force = distance < RADIUS && distance > 0 ? (1 - distance / RADIUS) ** 2 * PUSH : 0;
        const targetX = force ? distanceX / distance * force : 0, targetY = force ? distanceY / distance * force : 0;
        dot.vx = (dot.vx + (targetX - dot.dx) * STIFFNESS) * DAMPING;
        dot.vy = (dot.vy + (targetY - dot.dy) * STIFFNESS) * DAMPING;
        dot.dx += dot.vx; dot.dy += dot.vy;
        // Settle onto the target so a resting cursor stops the animation loop.
        if (Math.abs(targetX - dot.dx) < .05 && Math.abs(targetY - dot.dy) < .05 && Math.abs(dot.vx) < .05 && Math.abs(dot.vy) < .05) { dot.dx = targetX; dot.dy = targetY; dot.vx = dot.vy = 0; }
        else moving = true;
      }
      draw();
      frame = moving ? requestAnimationFrame(step) : 0;
    };
    const start = () => { if (!frame && visible && live.matches) frame = requestAnimationFrame(step); };

    const resize = () => {
      const rect = canvas.getBoundingClientRect(), ratio = devicePixelRatio || 1;
      width = rect.width;
      canvas.width = Math.round(rect.width * ratio); canvas.height = Math.round(rect.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dots = [];
      for (let y = GAP / 2; y < rect.height; y += GAP) for (let x = GAP / 2; x < rect.width; x += GAP) dots.push({ x, y, dx: 0, dy: 0, vx: 0, vy: 0 });
      rest = getComputedStyle(canvas).color;
      draw();
    };
    const client = { x: -1e4, y: -1e4 };
    const track = () => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = client.x - rect.left; pointer.y = client.y - rect.top;
      start();
    };
    const move = (event: PointerEvent) => { client.x = event.clientX; client.y = event.clientY; track(); };
    const leave = () => { client.x = client.y = -1e4; track(); };
    const theme = () => { rest = getComputedStyle(canvas).color; draw(); };

    const resizer = new ResizeObserver(resize);
    resizer.observe(canvas);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); });
    observer.observe(canvas);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("scroll", track, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.addEventListener("portfolio:theme", theme);
    return () => {
      cancelAnimationFrame(frame);
      resizer.disconnect(); observer.disconnect();
      removeEventListener("pointermove", move);
      removeEventListener("scroll", track);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("portfolio:theme", theme);
    };
  }, []);

  return <canvas ref={ref} className="hero-dots" aria-hidden="true" />;
}
