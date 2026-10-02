"use client";

import { useEffect, useRef } from "react";
import styles from "./companion.module.css";

const poses = {
  idle: { offset: 0, durations: [350, 160, 80, 90, 100, 900] },
  walk: { offset: 6, durations: [160, 160, 160, 160, 160, 160, 160, 160] },
  wave: { offset: 14, durations: [120, 160, 180, 160, 220, 650, 250] },
  curious: { offset: 21, durations: [650, 650, 450, 850] },
};
type Pose = keyof typeof poses;

export function Companion() {
  const stageRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLButtonElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current!, pet = petRef.current!, sprite = spriteRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let pose: Pose = "idle", frame = 0, elapsed = 0, age = 0, cooldown = 0;
    let x = 0, direction = 1, width = 0, petWidth = 80;
    let hovered = false, focused = false, visible = false, dialog = false;
    let raf = 0, last = 0, idleDelay = 900;
    const target = () => width - petWidth * .8125;
    const position = () => { pet.style.transform = `translateX(${x}px)`; };
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
      const ratio = width ? x / width : .64;
      width = stage.clientWidth; petWidth = pet.offsetWidth;
      x = pose === "curious" ? target() : Math.max(0, Math.min(target(), width * ratio));
      position();
    };
    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 80) : 0; last = now;
      elapsed += dt; age += dt; cooldown = Math.max(0, cooldown - dt);
      if (elapsed >= poses[pose].durations[frame]) {
        elapsed = 0; frame++;
        if (frame === poses[pose].durations.length) {
          if (pose === "curious") { direction = -1; cooldown = 30000; change("idle"); }
          else if (pose === "wave") { change("idle"); idleDelay = 500; }
          else frame = 0;
        }
        paint();
      }
      if (pose === "idle" && age > idleDelay && !hovered && !focused) change("walk");
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
      if (reduced.matches) change("idle");
      if (active) raf = requestAnimationFrame(tick);
    };
    const hello = () => {
      if (reduced.matches || pose === "wave") return;
      if (pose === "curious") { cooldown = 30000; direction = -1; }
      change("wave");
    };
    const enter = (event: PointerEvent) => { if (event.pointerType !== "touch") { hovered = true; hello(); } };
    const resumeSoon = () => { if (pose === "idle") { age = 0; idleDelay = 450; } };
    const leave = () => { hovered = false; resumeSoon(); };
    // Pointer focus must not pin Pogo in place after a click or tap.
    const pointerDown = () => { focused = false; };
    const focus = () => { focused = pet.matches(":focus-visible"); if (focused && pose === "walk") change("idle"); };
    const blur = () => { focused = false; resumeSoon(); };
    const onDialog = (event: Event) => { dialog = (event as CustomEvent<boolean>).detail; sync(); };
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    const sizing = new ResizeObserver(resize);
    resize(); paint(); intersection.observe(stage); sizing.observe(stage);
    pet.addEventListener("pointerenter", enter); pet.addEventListener("pointerleave", leave);
    pet.addEventListener("pointerdown", pointerDown);
    pet.addEventListener("click", hello); pet.addEventListener("focus", focus); pet.addEventListener("blur", blur);
    reduced.addEventListener("change", sync); document.addEventListener("visibilitychange", sync);
    document.addEventListener("portfolio:dialog", onDialog);
    return () => {
      cancelAnimationFrame(raf); intersection.disconnect(); sizing.disconnect();
      pet.removeEventListener("pointerenter", enter); pet.removeEventListener("pointerleave", leave);
      pet.removeEventListener("pointerdown", pointerDown);
      pet.removeEventListener("click", hello); pet.removeEventListener("focus", focus); pet.removeEventListener("blur", blur);
      reduced.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("portfolio:dialog", onDialog);
    };
  }, []);

  return <div ref={stageRef} className={styles.stage} data-companion="pogo">
    <span className={styles.dot} aria-hidden="true" />
    <button ref={petRef} type="button" className={styles.pet} aria-label="Say hello to Pogo">
      <span ref={spriteRef} className={styles.sprite} aria-hidden="true" />
    </button>
  </div>;
}
