import type { CSSProperties } from "react";

// Pixel icons: one bitmap pixel is one --dot, so icons share the page's dot size.
// '#' is drawn in currentColor; 'o' is knocked out in the page background (the badge's check).
const bitmaps = {
  ne: [".####", "...##", "..#.#", ".#..#", "#...."],
  e: ["..#..", "...#.", "#####", "...#.", "..#.."],
  back: ["..#..", ".#...", "#####", ".#...", "..#.."],
  up: ["...#...", "..###..", ".#####.", "...#...", "...#...", "...#...", "...#..."],
  moon: ["..####.", ".###...", "###....", "###....", "###....", ".###...", "..####."],
  sun: ["...#...", ".#...#.", "..###..", "#.###.#", "..###..", ".#...#.", "...#..."],
  mail: ["#######", "##...##", "#.#.#.#", "#..#..#", "#.....#", "#######"],
  search: [".###...", "#...#..", "#...#..", "#...#..", ".###...", "....##.", ".....##"],
  tri: ["..#..", ".###.", "#####"],
  chev: ["#..", ".#.", "..#", ".#.", "#.."],
  menu: ["##.##.##", "##.##.##", "........", "##.##.##", "##.##.##", "........", "##.##.##", "##.##.##"],
  badge: ["..#####..", ".#######.", "#######o#", "######o##", "#o###o###", "##o#o####", "###o#####", ".#######.", "..#####.."],
  pin: [".###.", "#...#", "#.#.#", "#...#", ".#.#.", "..#.."],
  play: ["#...", "##..", "###.", "####", "###.", "##..", "#..."],
  close: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
} as const;

export type IconName = keyof typeof bitmaps;

const paths = Object.fromEntries(Object.entries(bitmaps).map(([name, rows]) => {
  let ink = "", hole = "";
  rows.forEach((row, y) => [...row].forEach((pixel, x) => {
    if (pixel === "#") ink += `M${x} ${y}h1v1h-1z`;
    else if (pixel === "o") hole += `M${x} ${y}h1v1h-1z`;
  }));
  return [name, { ink, hole, columns: rows[0].length, rows: rows.length }];
})) as Record<IconName, { ink: string; hole: string; columns: number; rows: number }>;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const icon = paths[name];
  return <svg className={className ? `px ${className}` : "px"} viewBox={`0 0 ${icon.columns} ${icon.rows}`}
    style={{ "--c": icon.columns, "--r": icon.rows } as CSSProperties} aria-hidden="true">
    <path d={icon.ink} />{icon.hole && <path d={icon.hole} fill="var(--bg)" />}
  </svg>;
}
