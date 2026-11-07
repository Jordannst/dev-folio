"use client";

import { useEffect, useRef } from "react";

// Dithered dot landscapes for the hero and the footer. The canvas holds the still scenery and repaints only on
// resize, theme change, or (footer) a column height change; clouds and stars move in the DOM with CSS.
type Options = {
  seed: number; ground: number; far: [number, number]; mid: [number, number];
  peaks: [number, number, number][]; orb: [number, number, number]; pier: [number, number] | null;
  hand: "down" | "up"; clouds: [number, number, number, number][];
};

const P = 4, S = 2;
// Ordered (Bayer 4x4) dithering over a 4px grid of 2px dots.
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x: number, y: number) => (B4[(y & 3) * 4 + (x & 3)] + .5) / 16;
function rnd(x: number, y: number, s: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653);
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
}
function noise(x: number, s: number) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return rnd(i, 7, s) * (1 - u) + rnd(i + 1, 7, s) * u; }
const fbm = (x: number, s: number) => noise(x, s) * .6 + noise(x * 2.3, s + 1) * .28 + noise(x * 5.1, s + 2) * .12;

// Snap the column to the 4px dot grid and the dot to whole device pixels, so every dot on the page renders alike.
function snap() {
  const root = document.documentElement, ratio = devicePixelRatio || 1, vw = root.clientWidth, wide = innerWidth >= 640;
  const w = Math.floor(innerWidth * (wide ? .5 : .92) / P) * P + 2, m = Math.floor((vw - w) / 8) * P, rail = wide ? 24 : m;
  const values = { "--w": w, "--m": m, "--rail": rail, "--fl": Math.max(0, m - rail), "--fr": Math.max(0, vw - m - w - rail), "--dot": Math.round(S * ratio) / ratio };
  for (const [key, value] of Object.entries(values)) root.style.setProperty(key, `${value}px`);
}

function paint(scene: HTMLElement, canvas: HTMLCanvasElement, sky: HTMLElement, o: Options & { phase: number }) {
  const W = canvas.clientWidth, H = canvas.clientHeight, r = devicePixelRatio || 1, c = canvas.getContext("2d")!;
  canvas.width = Math.round(W * r); canvas.height = Math.round(H * r);
  const style = getComputedStyle(document.documentElement), css = (name: string) => style.getPropertyValue(name).trim();
  const main = document.querySelector("main")!, mr = main.getBoundingClientRect();
  const cl = Math.round(mr.left + parseFloat(getComputedStyle(main, "::before").left)), cR = Math.round(mr.left + parseFloat(getComputedStyle(main, "::after").left)), cr = cR + 2;
  // One 4px dot grid for the whole page: offset the scene's grid so the rails (and their rhythm) land on it.
  const ox = (cl % P + P) % P, oy = o.phase, dark = document.documentElement.dataset.theme === "dark", G = oy + Math.round(H * o.ground / P) * P;
  scene.style.setProperty("--ground", `${G}px`);
  const k = { far: css("--dot-far"), mid: css("--dot-mid"), hi: css("--dot-hi"), gnd: css("--dot-gnd"), speck: css("--dot-speck"), star: css("--dot-star"), acc: css("--accent"), sun: css("--sun"), water: css("--water"), wood: css("--wood"), line: css("--line") };
  const D = (v: number) => Math.round(v * r), sd = Math.round(S * r);
  const dot = (x: number, y: number, fill: string) => { c.fillStyle = fill; c.fillRect(D(x), D(y), sd, sd); };
  const rect = (x: number, y: number, w: number, h: number) => c.fillRect(D(x), D(y), D(x + w) - D(x), D(y + h) - D(y));
  const clear = (x: number, y: number, w: number, h: number) => c.clearRect(D(x), D(y), D(x + w) - D(x), D(y + h) - D(y));
  // Handoff to the column: a dotted floor line bends 90° into the rails (hero: down into the page, footer: back out).
  const R = 24, up = o.hand === "up", bend = cl > R + 8;
  const yL = up ? oy + 40 : Math.round((G + (H - G) * .5) / P) * P;
  const flow = (x: number, y: number) => {
    if (!bend || (x >= cl && x < cr) || (up ? y > yL : y < yL)) return true;
    const ex = x < cl ? x - cl + R : cr + R - x, dy = up ? y - yL + R : y - yL - R;
    return ex >= 0 && (up ? dy > 0 : dy < 0) && Math.hypot(ex, dy) > R;
  };
  for (let x = ox; x < W; x += P) {
    const gx = (x - ox) / P, far = G - H * (o.far[0] + fbm(x / 320 + o.seed, o.seed) * o.far[1]), mid = G - H * (o.mid[0] + fbm(x / 150 + o.seed, o.seed + 9) * o.mid[1]);
    let peak = G; for (const [px, ph, sl] of o.peaks) { const t = G - H * ph + Math.abs(x - W * px) * sl; if (t < peak) peak = t; }
    for (let y = oy; y < H; y += P) {
      if (!flow(x, y)) continue;
      const gy = (y - oy) / P, b = bay(gx, gy), n = rnd(gx, gy, o.seed);
      if (y >= G) {
        const t = (y - G) / (H - G);
        if (o.hand === "down") { if (n > .968 + t * .03) dot(x, y, k.speck); else if (b < .5 * (1 - t) ** 1.5) dot(x, y, k.gnd); }
        else if (n > .968) dot(x, y, k.speck); else if (b < .3 + t * .32) dot(x, y, k.gnd);
        continue;
      }
      if (y >= peak) { if (b < (y - peak < 9 ? .9 : .6)) dot(x, y, k.hi); continue; }
      if (y >= mid) { if (b < (y - mid < 7 ? .72 : .46)) dot(x, y, k.mid); continue; }
      if (y >= far) { if (b < (y - far < 7 ? .55 : .28)) dot(x, y, k.far); continue; }
      if (dark && n > .993) dot(x, y, rnd(gx, gy, 3) > .7 ? k.acc : k.star);
    }
  }
  // Moon (night) or sun (day), snapped to the same grid.
  const cx = W * o.orb[0], cy = H * o.orb[1], OR = o.orb[2];
  for (let gy = Math.floor((cy - OR - 18) / P); gy <= (cy + OR + 18) / P; gy++) for (let gx = Math.floor((cx - OR - 18) / P); gx <= (cx + OR + 18) / P; gx++) {
    const x = ox + gx * P, y = oy + gy * P, d1 = Math.hypot(x - cx, y - cy), b = bay(gx, gy);
    if (dark) { const d2 = Math.hypot(x - cx - OR * .45, y - cy + OR * .25); if (d1 < OR && d2 > OR * .88) { clear(x, y, P, P); if (OR - d1 < 5 || d2 - OR * .88 < 5 || b < .4) dot(x, y, k.hi); } }
    else if (d1 < OR) { clear(x, y, P, P); if (b < .8) dot(x, y, k.sun); } else if (d1 > OR + 8 && d1 < OR + 13 && b < .4) dot(x, y, k.sun);
  }
  if (o.pier) {
    const a = ox + Math.round(W * o.pier[0] / P) * P, z = ox + Math.round(W * o.pier[1] / P) * P;
    clear(a, G, z - a, 32); for (let y = G + 4; y < G + 32; y += P) for (let x = a; x < z; x += P) if (bay(x / P, y / P) < .5 - (y - G) / 80) dot(x, y, k.water);
    c.fillStyle = k.wood; rect(a - 6, G + 2, z - a + 12, 4); for (let x = a + 12; x < z; x += 48) rect(x, G + 6, 4, 24);
  }
  // The bend itself, dotted at the rails' 2px-on/4px-off rhythm and phase-matched where it meets them.
  if (bend) {
    const e = up ? yL : H - yL, Lv = e - R, arc = Math.PI * R / 2, end = Lv + arc + cl - R, seen = new Set<number>();
    for (let s = 0; s < end; s++) {
      let u: number, v: number;
      if (s < Lv) { u = 0; v = s; } else if (s < Lv + arc) { const a = (s - Lv) / R; u = R - R * Math.cos(a); v = Lv + R * Math.sin(a); } else { u = R + s - Lv - arc; v = e; }
      // Rasterise onto the grid so the curve is a pixel staircase, not anti-aliased dots.
      const X = cl - Math.round(u / P) * P, Y = oy + Math.round(((up ? v : H - v) - oy) / P) * P, key = X * 1e4 + Y;
      if (Y < 0 || Y >= H || seen.has(key)) continue;
      seen.add(key); dot(X, Y, k.line); dot(cR + cl - X, Y, k.line);
    }
  }
  sky.replaceChildren();
  for (const [cloudY, cw, time, delay] of o.clouds) {
    const cloud = document.createElement("canvas"), ch = 36;
    cloud.className = "cloud"; cloud.width = Math.round(cw * r); cloud.height = Math.round(ch * r);
    cloud.style.cssText = `width:${cw}px;height:${ch}px;--y:${Math.round(cloudY * H / P) * P}px;--t:${time}s;--n:${Math.ceil(W / P) + 80};--dl:${delay}s`;
    const cc = cloud.getContext("2d")!; cc.fillStyle = css("--dot-cloud");
    const blobs = [[.5, .6, .5, .42], [.3, .65, .22, .32], [.72, .55, .24, .4]];
    for (let y = 0; y < ch; y += P) for (let x = 0; x < cw; x += P) {
      let e = 0; for (const [bx, by, rx, ry] of blobs) e = Math.max(e, 1 - ((x / cw - bx) / rx) ** 2 - ((y / ch - by) / ry) ** 2);
      if (e > 0 && bay(x / P, y / P) < .18 + e * .5) cc.fillRect(Math.round(x * r), Math.round(y * r), sd, sd);
    }
    sky.append(cloud);
  }
  const top = bend && up ? yL + 8 : 0;
  if (dark) for (let n = 0; n < 16; n++) {
    const star = document.createElement("i"); star.className = "twinkle";
    star.style.cssText = `left:${ox + Math.round(rnd(n, 1, o.seed) * W / P) * P}px;top:${oy + Math.round((top + rnd(n, 2, o.seed) * (G * .6 - top)) / P) * P}px;--c:${n % 3 ? "var(--dot-star)" : "var(--accent)"};--t:${1.2 + rnd(n, 3, 1) * 2.4}s;--dl:${-rnd(n, 4, 1) * 3}s`;
    sky.append(star);
  }
}

const scenes = {
  hero: (narrow: boolean): Options => ({
    seed: 11, ground: narrow ? .8 : .79, far: [.12, .16], mid: [.04, .12],
    peaks: narrow ? [[.88, .2, 2]] : [[.83, .24, 1.9], [.885, .29, 2.1]],
    orb: narrow ? [.83, .52, 24] : [innerWidth < 1000 ? 1 - 110 / innerWidth : .74, .18, 34],
    pier: narrow ? [.52, .86] : [.34, .56], hand: "down",
    clouds: narrow ? [[.08, 180, 70, -10], [.3, 140, 95, -50]] : [[.07, 260, 110, -20], [.12, 200, 140, -80], [.2, 300, 160, -40], [.1, 180, 120, -100]],
  }),
  ground: (narrow: boolean): Options => ({
    seed: 5, ground: .72, far: [.12, .14], mid: [.04, .1],
    peaks: narrow ? [[.12, .24, 2]] : [[.1, .22, 1.9], [.15, .28, 2.2]],
    orb: narrow ? [.78, .3, 22] : [.72, .3, 30], pier: null, hand: "up",
    clouds: [[.22, 220, 150, -30], [.4, 160, 120, -90]],
  }),
};

export function SceneCanvas({ kind }: { kind: keyof typeof scenes }) {
  const canvas = useRef<HTMLCanvasElement>(null), sky = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scene = canvas.current!.parentElement!, main = document.querySelector("main");
    let timer = 0, height = -1;
    const draw = () => {
      snap();
      // The footer's grid continues the rails' rhythm, so it shifts with the column height.
      const phase = kind === "ground" && main ? (4 - Math.round(main.getBoundingClientRect().height) % 4) % 4 : 0;
      paint(scene, canvas.current!, sky.current!, { ...scenes[kind](innerWidth < 640), phase });
    };
    const later = () => { clearTimeout(timer); timer = window.setTimeout(draw, 150); };
    const resized = new ResizeObserver(() => {
      const next = main ? Math.round(main.getBoundingClientRect().height) : 0;
      if (kind === "ground" && next !== height) { height = next; later(); }
    });
    const theme = new MutationObserver(draw);
    draw();
    if (main) resized.observe(main);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    addEventListener("resize", later);
    return () => { clearTimeout(timer); resized.disconnect(); theme.disconnect(); removeEventListener("resize", later); };
  }, [kind]);
  return <><canvas ref={canvas} className="land" aria-hidden="true" /><div ref={sky} className="sky" aria-hidden="true" /></>;
}
