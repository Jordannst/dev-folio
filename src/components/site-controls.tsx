"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import Lenis from "lenis";
import { portfolio } from "@/data/portfolio";
import { Icon } from "./icon";

function scrollOptions(target: number) {
  const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const distance = Math.abs(Math.min(max, Math.max(0, target)) - window.scrollY);
  return { duration: Math.min(1.1, 0.4 + distance / 3000), easing: (t: number) => 1 - Math.pow(1 - t, 3) };
}

export function SiteControls() {
  const [dark, setDark] = useState(true);
  const themeTransition = useRef<ViewTransition | null>(null);
  const lenis = useRef<Lenis | null>(null);
  const pending = useRef<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const toggleTheme = useCallback((x: number, y: number) => {
    themeTransition.current?.skipTransition();
    const animate = !!document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const apply = () => {
      const next = document.documentElement.dataset.theme !== "dark";
      flushSync(() => { document.documentElement.dataset.theme = next ? "dark" : "light"; setDark(next); });
      document.dispatchEvent(new CustomEvent("portfolio:theme", { detail: { light: !next, delay: animate ? 450 : 0 } }));
      try { localStorage.setItem("portfolio-theme", next ? "dark" : "light"); } catch { /* Keep the selection for this session. */ }
    };
    if (!animate) { apply(); return; }
    const style = document.documentElement.style;
    style.setProperty("--theme-x", `${x}px`);
    style.setProperty("--theme-y", `${y}px`);
    style.setProperty("--theme-diameter", `${2 * Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    // Scope the stepped circular reveal to theme changes; page navigations also use view transitions.
    document.documentElement.classList.add("theme-transition");
    const transition = themeTransition.current = document.startViewTransition(apply);
    void transition.ready.catch(() => { /* A newer toggle can skip this animation. */ });
    void transition.finished.finally(() => { if (themeTransition.current === transition) document.documentElement.classList.remove("theme-transition"); });
  }, []);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
    // The command menu's "Switch theme" reveals from the middle of the screen.
    const fromMenu = () => toggleTheme(innerWidth / 2, innerHeight / 2);
    document.addEventListener("portfolio:toggle-theme", fromMenu);
    return () => document.removeEventListener("portfolio:toggle-theme", fromMenu);
  }, [toggleTheme]);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      lenis.current?.destroy();
      lenis.current = motion.matches ? null : new Lenis({ autoRaf: true, lerp: 0.085, smoothWheel: true, syncTouch: false, anchors: true, prevent: node => !!node.closest("[data-lenis-prevent]") });
      if (document.querySelector('[role="dialog"]')) lenis.current?.stop();
    };
    const dialog = (event: Event) => { if ((event as CustomEvent<boolean>).detail) lenis.current?.stop(); else lenis.current?.start(); };
    const scroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.scale = `${max > 0 ? Math.min(1, scrollY / max) : 0} 1`;
      // "Back to top" only once there is a top to go back to.
      if (controls.current) controls.current.dataset.away = String(scrollY > innerHeight * .5);
    };
    sync(); scroll(); motion.addEventListener("change", sync); document.addEventListener("portfolio:dialog", dialog); window.addEventListener("scroll", scroll, { passive: true }); window.addEventListener("resize", scroll);
    return () => { lenis.current?.destroy(); motion.removeEventListener("change", sync); document.removeEventListener("portfolio:dialog", dialog); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); };
  }, []);
  // Lenis outlives route changes: drop an in-flight smooth scroll before its next frame drags the new page toward the old target.
  useLayoutEffect(() => {
    lenis.current?.stop();
    if (!document.querySelector('[role="dialog"]')) lenis.current?.start();
  }, [pathname]);
  useEffect(() => {
    function focusDestination(id: string) {
      const heading = document.getElementById(id); if (!heading) return;
      heading.focus({ preventScroll: true });
      // Use a numeric target so Lenis does not also subtract CSS scroll padding/margin.
      const target = Math.max(0, window.scrollY + heading.getBoundingClientRect().top - 96);
      if (lenis.current) lenis.current.scrollTo(target, scrollOptions(target));
      else window.scrollTo({ top: target, behavior: "instant" });
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
    const arrive = () => { if (window.scrollY <= 1) document.getElementById("home")?.focus({ preventScroll: true }); };
    if (lenis.current) lenis.current.scrollTo(0, { ...scrollOptions(0), onComplete: arrive });
    else { window.scrollTo({ top: 0, behavior: "instant" }); arrive(); }
  }
  const label = `Switch to ${dark ? "light" : "dark"} theme`;
  return <>
    <div className="bar" ref={bar} aria-hidden="true" />
    <div className="controls" ref={controls}>
      <button className="top" type="button" onClick={backToTop} aria-label="Back to top" title="Back to top"><Icon name="up" /></button>
      <button type="button" onClick={event => { const { left, top, width, height } = event.currentTarget.getBoundingClientRect(); toggleTheme(left + width / 2, top + height / 2); }} aria-label={label} title={label}><Icon name={dark ? "moon" : "sun"} /></button>
      <a href={`mailto:${portfolio.profile.email}`} aria-label="Email Jordan" title="Email Jordan"><Icon name="mail" /></a>
      {/* Phones fold the stack into the command menu, which carries the same actions. */}
      <button className="more" type="button" onClick={() => document.dispatchEvent(new Event("portfolio:command"))} aria-label="Open menu" title="Open menu"><Icon name="menu" /></button>
    </div>
  </>;
}
