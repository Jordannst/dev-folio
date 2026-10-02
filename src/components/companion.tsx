"use client";

import { useEffect, useRef } from "react";
import { clampCompanion } from "@/lib/companion-bounds";
import { companionPoses as poses, readCompanionState, type CompanionPose as Pose, type CompanionState } from "@/lib/companion-state";
import styles from "./companion.module.css";

const storageKey = "portfolio:pogo:v1";

export function Companion() {
  const stageRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLButtonElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current!, pet = petRef.current!, sprite = spriteRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let pose: Pose = "idle", frame = 0, elapsed = 0, age = 0, cooldown = 0;
    let x = 0, direction = 1, width = 0, petWidth = 80;
    let lift = 0, velocity = 0, dropping = false, keyboardDrag = false, suppressClick = false;
    let drag: { id: number; startX: number; startY: number; x: number; lift: number; moved: boolean } | null = null;
    let hovered = false, focused = false, visible = false, dialog = false;
    let raf = 0, last = 0, idleDelay = 900;
    let departureSaved = false;
    const save = () => {
      if (departureSaved) return;
      const state: CompanionState = {
        version: 1, pose, frame, xRatio: width ? x / width : .64,
        liftRatio: stage.clientHeight ? lift / stage.clientHeight : 0,
        direction, elapsed, age, cooldown, idleDelay, velocity,
      };
      try { sessionStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Storage can be disabled. */ }
    };
    const saveDeparture = () => { save(); departureSaved = true; };
    const target = () => width - petWidth * .8125;
    const position = () => { pet.style.transform = `translate(${x}px, ${-lift}px)`; };
    const clamp = () => {
      const rect = stage.getBoundingClientRect();
      ({ x, lift } = clampCompanion(x, lift, width, Math.min(rect.height, rect.bottom), petWidth, pet.offsetHeight));
    };
    const paint = () => {
      const index = poses[pose].offset + frame;
      sprite.style.backgroundPosition = `${(index % 8) / 7 * 100}% ${Math.floor(index / 8) / 3 * 100}%`;
      sprite.style.transform = pose === "walk" && direction < 0 ? "scaleX(-1)" : "";
      stage.dataset.touching = String(pose === "curious" && frame === 2);
      pet.dataset.pose = pose;
      pet.dataset.frame = String(frame);
    };
    const change = (next: Pose) => {
      pose = next; frame = 0; elapsed = 0; age = 0;
      if (next === "idle") idleDelay = 1000 + Math.random() * 1000;
      paint();
    };
    const resize = () => {
      if (width === stage.clientWidth && petWidth === pet.offsetWidth) return;
      if (drag || keyboardDrag || dropping) finish(true);
      const ratio = width ? x / width : .64;
      width = stage.clientWidth; petWidth = pet.offsetWidth;
      x = pose === "curious" ? target() : Math.max(0, Math.min(target(), width * ratio));
      position();
    };
    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 80) : 0; last = now;
      elapsed += dt; age += dt; cooldown = Math.max(0, cooldown - dt);
      if (dropping) {
        velocity += dt * .002;
        lift = Math.max(0, lift - velocity * dt);
        if (!lift) { dropping = false; change("land"); }
        position();
      }
      if (elapsed >= poses[pose].durations[frame]) {
        elapsed = 0; frame++;
        if (frame === poses[pose].durations.length) {
          if (pose === "curious") { direction = -1; cooldown = 30000; change("idle"); }
          else if (pose === "wave") { change("idle"); idleDelay = 500; }
          else if (pose === "land") { change("idle"); idleDelay = 450; }
          else frame = 0;
        }
        paint();
      }
      if (pose === "idle" && age > idleDelay && !hovered && !focused && !drag && !keyboardDrag) change("walk");
      if (pose === "walk") {
        x += direction * dt * .022;
        if (x >= target()) {
          x = target();
          if (!cooldown) change("curious");
          else { direction = -1; change("idle"); }
        } else if (x <= 0) { x = 0; direction = 1; change("idle"); }
        else if (age > 5500) change("idle");
        position();
      }
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      const active = visible && !document.hidden && !reduced.matches && !dialog;
      stage.dataset.paused = String(!active);
      if (!visible || document.hidden || dialog || reduced.matches) finish(true);
      if (reduced.matches) change("idle");
      if (active) raf = requestAnimationFrame(tick);
    };
    const hello = (event?: Event) => {
      if (event?.type === "click" && suppressClick) { suppressClick = false; return; }
      if (drag?.moved || keyboardDrag || dropping || reduced.matches || pose === "wave") return;
      if (pose === "curious") { cooldown = 30000; direction = -1; }
      change("wave");
    };
    const enter = (event: PointerEvent) => { if (event.pointerType !== "touch") { hovered = true; hello(); } };
    const resumeSoon = () => { if (pose === "idle") { age = 0; idleDelay = 450; } };
    const leave = () => { hovered = false; resumeSoon(); };
    const finish = (immediate = false) => {
      const wasMoving = drag?.moved || keyboardDrag || dropping;
      const pointer = drag?.id;
      drag = null; keyboardDrag = false;
      if (pointer !== undefined && pet.hasPointerCapture(pointer)) pet.releasePointerCapture(pointer);
      stage.dataset.dragging = "false";
      if (!wasMoving) return;
      hovered = false; velocity = 0; cooldown = 30000;
      dropping = lift > 0 && !immediate && !reduced.matches;
      if (!dropping) { lift = 0; change(immediate || reduced.matches ? "idle" : "land"); idleDelay = 450; }
      position();
    };
    const pointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || keyboardDrag) return;
      focused = false; suppressClick = false;
      const catching = dropping;
      if (catching) { dropping = false; suppressClick = true; change("drag"); stage.dataset.dragging = "true"; }
      if (pose === "walk") change("idle");
      drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x, lift, moved: catching };
      pet.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      if (!drag.moved) { drag.moved = true; suppressClick = true; change("drag"); stage.dataset.dragging = "true"; }
      x = drag.x + dx; lift = drag.lift - dy;
      clamp(); position();
    };
    const pointerEnd = (event: PointerEvent) => { if (drag?.id === event.pointerId) finish(event.type !== "pointerup"); };
    const keyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !drag) {
        event.preventDefault();
        if (event.repeat) return;
        if (keyboardDrag) finish();
        else { dropping = false; keyboardDrag = true; clamp(); change("drag"); stage.dataset.dragging = "true"; position(); }
      } else if (keyboardDrag && (event.key === "Enter" || event.key === "Escape")) {
        event.preventDefault(); finish();
      } else if (keyboardDrag && event.key.startsWith("Arrow")) {
        event.preventDefault();
        x += event.key === "ArrowRight" ? 12 : event.key === "ArrowLeft" ? -12 : 0;
        lift += event.key === "ArrowUp" ? 12 : event.key === "ArrowDown" ? -12 : 0;
        clamp(); position();
      }
    };
    const focus = () => { focused = pet.matches(":focus-visible"); if (focused && pose === "walk") change("idle"); };
    const blur = () => { focused = false; if (keyboardDrag) finish(); resumeSoon(); };
    const scroll = () => { if (drag || keyboardDrag || dropping) finish(true); };
    const onDialog = (event: Event) => { dialog = (event as CustomEvent<boolean>).detail; sync(); };
    const visibility = () => {
      if (document.hidden) saveDeparture();
      else departureSaved = false;
      sync();
    };
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    const sizing = new ResizeObserver(resize);
    resize();
    const initialRect = stage.getBoundingClientRect();
    visible = initialRect.bottom > 0 && initialRect.top < innerHeight;
    try {
      const saved = readCompanionState(sessionStorage.getItem(storageKey));
      if (saved) {
        ({ pose, frame, direction, elapsed, age, cooldown, idleDelay, velocity } = saved);
        x = Math.min(target(), saved.xRatio * width);
        lift = saved.liftRatio * stage.clientHeight;
        if (pose === "curious") x = target();
        // A browser refresh cannot retain a pressed pointer or a keyboard grab.
        if (lift > 0 || pose === "drag") {
          clamp(); dropping = lift > 0;
          if (!dropping) change("land");
          else if (pose !== "drag") change("drag");
        }
      }
    } catch { /* Start normally when session storage is unavailable. */ }
    position(); paint(); stage.dataset.ready = "true";
    intersection.observe(stage); sizing.observe(stage);
    pet.addEventListener("pointerenter", enter); pet.addEventListener("pointerleave", leave);
    pet.addEventListener("pointerdown", pointerDown);
    pet.addEventListener("pointermove", pointerMove); pet.addEventListener("pointerup", pointerEnd);
    pet.addEventListener("pointercancel", pointerEnd); pet.addEventListener("lostpointercapture", pointerEnd);
    pet.addEventListener("keydown", keyDown); window.addEventListener("scroll", scroll, { passive: true });
    pet.addEventListener("click", hello); pet.addEventListener("focus", focus); pet.addEventListener("blur", blur);
    reduced.addEventListener("change", sync); document.addEventListener("visibilitychange", visibility);
    window.addEventListener("beforeunload", saveDeparture); window.addEventListener("pagehide", saveDeparture);
    window.addEventListener("pageshow", visibility);
    document.addEventListener("portfolio:dialog", onDialog);
    return () => {
      save();
      cancelAnimationFrame(raf); intersection.disconnect(); sizing.disconnect();
      pet.removeEventListener("pointerenter", enter); pet.removeEventListener("pointerleave", leave);
      pet.removeEventListener("pointerdown", pointerDown);
      pet.removeEventListener("pointermove", pointerMove); pet.removeEventListener("pointerup", pointerEnd);
      pet.removeEventListener("pointercancel", pointerEnd); pet.removeEventListener("lostpointercapture", pointerEnd);
      pet.removeEventListener("keydown", keyDown); window.removeEventListener("scroll", scroll);
      pet.removeEventListener("click", hello); pet.removeEventListener("focus", focus); pet.removeEventListener("blur", blur);
      reduced.removeEventListener("change", sync); document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("beforeunload", saveDeparture); window.removeEventListener("pagehide", saveDeparture);
      window.removeEventListener("pageshow", visibility);
      document.removeEventListener("portfolio:dialog", onDialog);
    };
  }, []);

  return <div ref={stageRef} className={styles.stage} data-companion="pogo">
    <span className={styles.dot} aria-hidden="true" />
    <button ref={petRef} type="button" className={styles.pet} aria-label="Say hello to Pogo" aria-describedby="pogo-controls">
      <span ref={spriteRef} className={styles.sprite} aria-hidden="true" />
    </button>
    <span id="pogo-controls" className="sr-only">Drag to move Pogo. Keyboard: Space to pick up, arrow keys to move, Enter or Escape to put down.</span>
  </div>;
}
