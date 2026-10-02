"use client";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import Lenis from "lenis";
import { portfolio } from "@/data/portfolio";
import { Icon } from "./icon";

export function SiteControls() {
  const [dark, setDark] = useState(false);
  const manual = useRef(false);
  const themeTransition = useRef<ViewTransition | null>(null);
  const lenis = useRef<Lenis | null>(null);
  const pending = useRef<string | null>(null);
  const progress = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    try { manual.current = ["light", "dark"].includes(localStorage.getItem("portfolio-theme") || ""); } catch { /* Use system theme without storage. */ }
    setDark(document.documentElement.dataset.theme === "dark");
    const update = () => { if (!manual.current) { document.documentElement.dataset.theme = media.matches ? "dark" : "light"; setDark(media.matches); } };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      lenis.current?.destroy();
      lenis.current = motion.matches ? null : new Lenis({ autoRaf: true, anchors: true, prevent: node => !!node.closest("[data-lenis-prevent]") });
      if (document.querySelector('[role="dialog"]')) lenis.current?.stop();
    };
    const dialog = (event: Event) => { if ((event as CustomEvent<boolean>).detail) lenis.current?.stop(); else lenis.current?.start(); };
    const scroll = () => { const max = document.documentElement.scrollHeight - innerHeight; if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`; };
    sync(); scroll(); motion.addEventListener("change", sync); document.addEventListener("portfolio:dialog", dialog); window.addEventListener("scroll", scroll, { passive: true }); window.addEventListener("resize", scroll);
    return () => { lenis.current?.destroy(); motion.removeEventListener("change", sync); document.removeEventListener("portfolio:dialog", dialog); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); };
  }, []);
  useEffect(() => {
    function focusDestination(id: string) {
      const heading = document.getElementById(id); if (!heading) return;
      heading.focus({ preventScroll: true });
      if (lenis.current) lenis.current.scrollTo(heading, { offset: -96 });
      else heading.scrollIntoView({ block: "start", behavior: "instant" });
    }
    if (pending.current) { const id = pending.current; pending.current = null; requestAnimationFrame(() => focusDestination(id)); }
    const navigate = (event: Event) => {
      const href = (event as CustomEvent<string>).detail;
      const url = new URL(href, location.origin); const id = url.hash.slice(1) || "home";
      if (pathname === url.pathname) { history.pushState(null, "", href); requestAnimationFrame(() => focusDestination(id)); }
      else { pending.current = id; router.push(href, { scroll: false }); }
    };
    document.addEventListener("portfolio:navigate", navigate);
    return () => document.removeEventListener("portfolio:navigate", navigate);
  }, [pathname, router]);
  function backToTop() {
    const replay = () => {
      if (window.scrollY > 1) return;
      document.getElementById("home")?.focus({ preventScroll: true });
      document.dispatchEvent(new Event("portfolio:back-to-top"));
    };
    if (lenis.current) lenis.current.scrollTo(0, { duration: 1, onComplete: replay });
    else { window.scrollTo({ top: 0, behavior: "instant" }); replay(); }
  }
  function toggleTheme(event: MouseEvent<HTMLButtonElement>) {
    themeTransition.current?.skipTransition();
    const apply = () => {
      const next = document.documentElement.dataset.theme !== "dark";
      manual.current = true;
      flushSync(() => { document.documentElement.dataset.theme = next ? "dark" : "light"; setDark(next); });
      try { localStorage.setItem("portfolio-theme", next ? "dark" : "light"); } catch { /* Keep the selection for this session. */ }
    };
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(); return; }
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = left + width / 2, y = top + height / 2;
    const style = document.documentElement.style;
    style.setProperty("--theme-x", `${x}px`);
    style.setProperty("--theme-y", `${y}px`);
    // Extend the soft mask beyond the farthest corner so the final frame is fully covered.
    style.setProperty("--theme-diameter", `${3 * Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    themeTransition.current = document.startViewTransition(apply);
    void themeTransition.current.ready.catch(() => { /* A newer toggle can skip this animation. */ });
  }
  return <><div className="bottom-blur" aria-hidden="true"><div /><div /><div /><div /><div /></div><div className="scroll-progress" ref={progress} aria-hidden="true" /><div className="floating-controls"><button onClick={backToTop} aria-label="Back to top" title="Back to top"><Icon name="up" /></button><button onClick={toggleTheme} aria-label={`Switch to ${dark ? "light" : "dark"} theme`} title={`Switch to ${dark ? "light" : "dark"} theme`}><Icon name={dark ? "moon" : "sun"} /></button><a href={`mailto:${portfolio.profile.email}`} aria-label="Email Jordan" title="Email Jordan"><Icon name="mail" /></a></div></>;
}
