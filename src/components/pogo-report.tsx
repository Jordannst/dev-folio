"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useDragControls, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { TrafficReport } from "@/lib/web-analytics";
import styles from "./pogo-report.module.css";

export function PogoReport({ open, close }: { open: boolean; close: () => void }) {
  const [days, setDays] = useState<7 | 30>(7);
  const [report, setReport] = useState<TrafficReport | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const closeRef = useRef<HTMLButtonElement>(null);
  const boundsRef = useRef<HTMLDivElement>(null);
  const drag = useDragControls();
  const x = useMotionValue(0), y = useMotionValue(0), drop = useMotionValue(0), ropeBase = useMotionValue(76);
  const ropeEnd = useTransform([y, drop, ropeBase], values => values.reduce((total: number, value) => total + Number(value), 0));
  const reduced = useReducedMotion();
  const spring = { type: "spring" as const, stiffness: 180, damping: reduced ? 32 : 13 };
  const release = () => { animate(x, 0, spring); animate(y, 0, spring); };

  useEffect(() => {
    if (open) { x.stop(); y.stop(); x.set(0); y.set(0); }
  }, [open, x, y]);

  useEffect(() => {
    const mobile = matchMedia("(width < 640px)");
    const resize = () => ropeBase.set(mobile.matches ? 52 : 76);
    resize(); mobile.addEventListener("change", resize);
    return () => mobile.removeEventListener("change", resize);
  }, [ropeBase]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setStatus("loading"); setReport(null);
    void fetch(`/api/traffic?days=${days}`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Unavailable");
      const result = await response.json() as TrafficReport;
      if (!controller.signal.aborted) { setReport(result); setStatus("ready"); }
    }).catch(() => { if (!controller.signal.aborted) setStatus("error"); });
    return () => controller.abort();
  }, [open, days]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.stopPropagation(); close(); } };
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("keydown", escape); previous?.focus({ preventScroll: true }); };
  }, [open, close]);

  const tugWithKeys = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const offset = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 56] }[event.key];
    if (!offset) return;
    event.preventDefault();
    x.stop(); y.stop(); x.set(offset[0]); y.set(offset[1]);
  };

  const values = report?.daily ?? [];
  const peak = Math.max(1, ...values.map(point => point.pageviews));
  const points = values.map((point, index) => `${12 + index * 236 / Math.max(1, values.length - 1)},${70 - point.pageviews / peak * 56}`).join(" ");
  const number = new Intl.NumberFormat("en-US");
  return <AnimatePresence>{open && <div className={styles.overlay}>
    <div className={styles.cords} aria-hidden="true">{[0, 1].map(side => <svg key={side}>
      <motion.line x1="0" y1="0" x2={x} y2={ropeEnd} stroke="#77766e" strokeWidth="2" />
      <motion.line x1="0" y1="0" x2={x} y2={ropeEnd} stroke="#b1aaa0" strokeWidth="2" strokeDasharray="3 2" />
    </svg>)}</div>
    <div className={styles.hanging}>
    <div ref={boundsRef} className={styles.bounds} />
    <motion.aside role="dialog" aria-modal="false" aria-labelledby="pogo-report-title" className={styles.tether} data-lenis-prevent
      drag dragControls={drag} dragListener={false} dragConstraints={boundsRef} dragElastic={0} dragMomentum={false} dragSnapToOrigin
      dragTransition={{ bounceStiffness: spring.stiffness, bounceDamping: spring.damping, restDelta: .2, restSpeed: 2 }} style={{ x, y }}>
    <motion.div className={styles.paper} style={{ y: drop }}
      initial={reduced ? { opacity: 0, y: 0 } : { y: -400, rotate: 0 }}
      animate={reduced ? { opacity: 1, y: 0 } : { y: 0, rotate: [0, 2, -1, .5, 0] }}
      exit={reduced ? { opacity: 0 } : { y: -400, rotate: -2 }}
      transition={{ duration: reduced ? .1 : .85, ease: [.22, 1, .36, 1] }}>
      <div className={styles.clips} aria-hidden="true"><i /><i /></div>
      <div className={styles.paperContent}>
      <button ref={closeRef} className={styles.close} type="button" aria-label="Close Pogo's report" onClick={close}>×</button>
      <h2 id="pogo-report-title"><button type="button" className={styles.dragHandle} aria-describedby="pogo-report-move"
        onPointerDown={event => { if (event.isPrimary && event.button === 0) drag.start(event); }} onKeyDown={tugWithKeys} onKeyUp={release} onBlur={release}>Pogo’s little report</button></h2>
      <span id="pogo-report-move" className="sr-only">Pull this title and release to let the report swing back. You can also hold and release an arrow key when focused.</span>
      <div className={styles.ranges} role="group" aria-label="Analytics time range">{([7, 30] as const).map(range => <button key={range} type="button" aria-pressed={days === range} onClick={() => setDays(range)}>{range}D</button>)}</div>
      <div className={styles.stats} aria-live="polite"><div><span>Visitors</span><strong>{status === "ready" ? number.format(report!.visitors) : "—"}</strong></div><div><span>Page views</span><strong>{status === "ready" ? number.format(report!.pageviews) : "—"}</strong></div></div>
      <div className={styles.chart}>
        {status === "ready" ? <><svg viewBox="0 0 260 84" role="img" aria-label={`Daily page views over the last ${days} days`}>
          <path d="M12 14H248M12 42H248M12 70H248" fill="none" stroke="#6a755733" strokeDasharray="3 4" />
          <polygon points={`12,70 ${points} 248,70`} fill="#71876822" />
          <polyline points={points} fill="none" stroke="#66805e" strokeWidth="2" strokeLinejoin="round" />
        </svg><div className={styles.dates}><span>{values[0]?.date.slice(5)}</span><span>{values.at(-1)?.date.slice(5)} · UTC</span></div></> : <p role="status">{status === "loading" ? "Gathering a little report…" : "Analytics isn’t available yet."}</p>}
      </div>
      <p className={styles.updated}>{report ? `Checked ${new Date(report.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · daily page views` : "A little peek at this corner of the web."}</p>
      </div>
    </motion.div>
  </motion.aside></div></div>}</AnimatePresence>;
}
