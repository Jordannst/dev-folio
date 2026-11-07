"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";

const formatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export function ContributionTooltip({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const id = useId();
  const [selected, setSelected] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // Open on the latest weeks; older ones scroll in from the left on narrow columns.
    scroller.current!.scrollLeft = scroller.current!.scrollWidth;
    const clear = () => setSelected(null);
    window.addEventListener("resize", clear);
    return () => window.removeEventListener("resize", clear);
  }, []);
  useEffect(() => {
    if (!selected) return;
    selected.dataset.active = "true";
    return () => { delete selected.dataset.active; };
  }, [selected]);
  const days = () => Array.from(root.current?.querySelectorAll<HTMLElement>("[data-contribution-date]") ?? []);
  const active = selected && root.current ? (() => {
    const cell = selected.getBoundingClientRect();
    const container = root.current.getBoundingClientRect();
    const x = cell.left + cell.width / 2 - container.left;
    const halfWidth = Math.min(240, container.width - 8) / 2;
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
      const next = cells[Math.max(0, Math.min(cells.length - 1, current + offsets[event.key]))];
      if (!next) return;
      const cell = next.getBoundingClientRect(), view = scroller.current!.getBoundingClientRect();
      if (cell.left < view.left) scroller.current!.scrollLeft += cell.left - view.left - 8;
      else if (cell.right > view.right) scroller.current!.scrollLeft += cell.right - view.right + 8;
      setSelected(next);
    }}>
    <div className="calendar-scroll" ref={scroller}>{children}</div>
    {active && <div id={id} role="tooltip" className="contribution-tooltip" style={{ left: active.center, top: active.top, "--arrow": `calc(50% + ${active.x - active.center}px)` } as CSSProperties}>
      <strong>{active.count} {active.count === 1 ? "contribution" : "contributions"}</strong> on {active.date}
    </div>}
  </div>;
}
