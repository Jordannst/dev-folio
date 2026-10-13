"use client";

import { useEffect, useRef } from "react";

const GAP = 14, RADIUS = 120, PUSH = 18, STIFFNESS = .12, DAMPING = .78;
// Intro: a wave spreads from the avatar; each dot fades in over FADE ms, SPEED ms per px of distance.
// Progress is drawn in LEVELS batches so a frame changes canvas state a handful of times, not per dot.
const FADE = 350, SPEED = .55, LEVELS = 6, INTRO_KEY = "hero-dots-intro";

type Dot = { x: number; y: number; dx: number; dy: number; vx: number; vy: number; delay: number; done: boolean };

export function HeroDots() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!, context = canvas.getContext("2d")!, settled = document.createElement("canvas").getContext("2d")!;
    const live = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    let dots: Dot[] = [], width = 0, rest = "", frame = 0, visible = true;
    let intro: number | null = null, introLength = 0, introChecked = false;
    let leaf: CanvasGradient | string = "";
    const pointer = { x: -1e4, y: -1e4 };
    const levels: Dot[][] = Array.from({ length: LEVELS }, () => []);

    const draw = () => {
      let elapsed = Infinity;
      if (intro !== null) {
        elapsed = performance.now() - intro;
        // Mark the intro as seen only once it has fully played (StrictMode remounts would otherwise skip it).
        if (elapsed >= introLength) { intro = null; elapsed = Infinity; try { sessionStorage.setItem(INTRO_KEY, "1"); } catch { /* replays next load */ } }
      }
      context.clearRect(0, 0, width, canvas.height);
      for (const level of levels) level.length = 0;
      if (intro !== null) {
        // During the intro, finished dots are stamped once into a cache and blitted, so each frame
        // rasterises only the wavefront ring instead of every dot.
        settled.fillStyle = rest; settled.globalAlpha = .5;
        for (const dot of dots) {
          if (dot.done) continue;
          const progress = (elapsed - dot.delay) / FADE;
          if (progress >= 1 && dot.dx === 0 && dot.dy === 0) { dot.done = true; settled.fillRect(dot.x - .6, dot.y - .6, 1.2, 1.2); }
          else if (progress > 0 && dot.dx === 0 && dot.dy === 0) levels[Math.floor(progress * LEVELS)].push(dot);
        }
        context.drawImage(settled.canvas, 0, 0, width, canvas.height / (devicePixelRatio || 1));
      } else {
        // Resting dots stay quieter than the rails; displaced dots draw at full strength.
        context.fillStyle = rest;
        context.globalAlpha = .5;
        for (const dot of dots) if (dot.dx === 0 && dot.dy === 0) context.fillRect(dot.x - .6, dot.y - .6, 1.2, 1.2);
      }
      // Wavefront: dots fade in at their resting colour while a leaf-coloured flash shrinks away.
      levels.forEach((level, index) => {
        if (!level.length) return;
        const progress = (index + .5) / LEVELS, size = 1.2 + (1 - progress) * 1.2;
        context.fillStyle = rest; context.globalAlpha = .5 * progress;
        for (const dot of level) context.fillRect(dot.x - .6, dot.y - .6, 1.2, 1.2);
        context.fillStyle = leaf; context.globalAlpha = 1 - progress;
        for (const dot of level) context.fillRect(dot.x - size / 2, dot.y - size / 2, size, size);
      });
      // Displaced dots pick up the leaf gradient across the viewport width.
      context.fillStyle = leaf;
      for (const dot of dots) {
        if (dot.dx === 0 && dot.dy === 0) continue;
        context.globalAlpha = .45 + .55 * Math.min(1, Math.hypot(dot.dx, dot.dy) / PUSH);
        context.fillRect(dot.x + dot.dx - .9, dot.y + dot.dy - .9, 1.8, 1.8);
      }
      context.globalAlpha = 1;
    };

    const step = () => {
      let moving = intro !== null;
      for (const dot of dots) {
        const distanceX = dot.x - pointer.x, distanceY = dot.y - pointer.y;
        // Cheap reject: resting dots outside the cursor radius need no physics this frame.
        if (dot.dx === 0 && dot.dy === 0 && distanceX * distanceX + distanceY * distanceY >= RADIUS * RADIUS) continue;
        const distance = Math.hypot(distanceX, distanceY);
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
      settled.canvas.width = canvas.width; settled.canvas.height = canvas.height;
      settled.setTransform(ratio, 0, 0, ratio, 0, 0);
      const gradient = context.createLinearGradient(0, 0, rect.width, 0);
      gradient.addColorStop(0, "#a6c9a9"); gradient.addColorStop(1, "#8da7ff");
      leaf = gradient;
      const avatar = canvas.parentElement?.querySelector(".avatar-frame")?.getBoundingClientRect();
      const originX = avatar ? avatar.left + avatar.width / 2 - rect.left : rect.width / 2;
      const originY = avatar ? avatar.top + avatar.height / 2 - rect.top : rect.height / 2;
      dots = []; introLength = 0;
      for (let y = GAP / 2; y < rect.height; y += GAP) for (let x = GAP / 2; x < rect.width; x += GAP) {
        const delay = Math.hypot(x - originX, y - originY) * SPEED;
        introLength = Math.max(introLength, delay + FADE);
        dots.push({ x, y, dx: 0, dy: 0, vx: 0, vy: 0, delay, done: false });
      }
      rest = getComputedStyle(canvas).color;
      // First layout only: play the intro once per session, never with reduced motion or on later resizes.
      if (!introChecked) {
        introChecked = true;
        let seen = false;
        try { seen = !!sessionStorage.getItem(INTRO_KEY); } catch { /* storage blocked: play */ }
        if (motion.matches && !seen) { intro = performance.now(); frame ||= requestAnimationFrame(step); }
      }
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
