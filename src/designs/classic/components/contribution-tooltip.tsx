"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

const formatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export function ContributionTooltip({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const [selected, setSelected] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const clear = () => setSelected(null);
    window.addEventListener("resize", clear);
    return () => window.removeEventListener("resize", clear);
  }, []);
  const days = () => Array.from(root.current?.querySelectorAll<HTMLElement>("[data-contribution-date]") ?? []);
  const active = selected && root.current ? (() => {
    const cell = selected.getBoundingClientRect();
    const container = root.current.getBoundingClientRect();
    const x = cell.left + cell.width / 2 - container.left;
    const halfWidth = Math.min(256, container.width - 8) / 2;
    const center = Math.max(halfWidth + 4, Math.min(container.width - halfWidth - 4, x));
    return { x, center, top: cell.top - container.top, count: Number(selected.dataset.contributionCount), date: formatter.format(new Date(`${selected.dataset.contributionDate}T00:00:00Z`)) };
  })() : null;

  return <div className="calendar" ref={root} role="region" aria-label="GitHub contribution calendar"
    tabIndex={0} aria-describedby={active ? id : undefined}
    onPointerMove={event => {
      const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-contribution-date]");
      setSelected(cell);
    }}
    onPointerLeave={() => setSelected(null)}
    onBlur={() => setSelected(null)}
    onFocus={() => setSelected(days().at(-1) ?? null)}
    onKeyDown={event => {
      if (event.key === "Escape") { setSelected(null); return; }
      const offsets: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 };
      if (!(event.key in offsets)) return;
      event.preventDefault();
      const cells = days();
      const current = selected ? cells.indexOf(selected) : cells.length - 1;
      setSelected(cells[Math.max(0, Math.min(cells.length - 1, current + offsets[event.key]))] ?? null);
    }}>
    {children}
    {active && <div id={id} role="tooltip" className="contribution-tooltip" style={{ left: active.center, top: active.top }}>
      <strong>{active.count} {active.count === 1 ? "contribution" : "contributions"}</strong> on {active.date}
      <span className="contribution-tooltip-arrow" style={{ left: `calc(50% + ${active.x - active.center}px)` }} />
    </div>}
  </div>;
}
