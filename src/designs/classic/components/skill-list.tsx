"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const icons = ["javascript", "typescript", "python", "go", "php", "react", "react", "nextjs", "tailwindcss", "nodejs", "express", "laravel", "mongodb", "postgresql", "git", "figma"];

export function SkillList({ skills }: { skills: { name: string }[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const origin = useRef<DOMRect | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(skills.length);
  const reduced = useReducedMotion();

  useEffect(() => {
    // Only desktop needs spare room for expanding labels.
    let previousWidth = -1;
    const resize = () => {
      const width = list.current!.clientWidth;
      if (width === previousWidth) return;
      previousWidth = width;
      origin.current = null; setHovered(null); setFocused(null);
      setColumns(Math.max(1, Math.floor((width - (innerWidth < 640 ? 0 : 104) + 8) / 48)));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(list.current!);
    return () => observer.disconnect();
  }, []);

  const rows = Array.from({ length: Math.ceil(skills.length / columns) }, (_, row) => skills.slice(row * columns, (row + 1) * columns));
  return <div ref={list} className="skill-list" role="list" aria-label="Tech stack" onPointerMove={event => {
    if (event.pointerType === "touch" || innerWidth < 640) return;
    const rect = origin.current;
    // Keep the original hover area valid when expansion moves the chip to another row.
    if (hovered && rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) return;
    const item = (event.target as HTMLElement).closest<HTMLElement>("[data-skill]");
    const name = item?.dataset.skill ?? null;
    if (name !== hovered) { origin.current = item?.getBoundingClientRect() ?? null; setHovered(name); }
  }} onPointerLeave={() => { origin.current = null; setHovered(null); }}>
    {rows.map((row, rowIndex) => <div className="skill-row" role="presentation" key={row[0].name}>
    {row.map((skill, column) => <motion.div layout role="listitem" key={skill.name} data-skill={skill.name}
      transition={{ layout: { duration: reduced ? 0 : .28, ease: [.22, 1, .36, 1] } }}>
      <button type="button" className="skill" aria-label={skill.name} data-expanded={(hovered ?? focused) === skill.name}
        onClick={() => { if (innerWidth < 640) { setHovered(null); setFocused(current => current === skill.name ? null : skill.name); } }}
        onFocus={event => { if (innerWidth >= 640 && event.currentTarget.matches(":focus-visible")) { setHovered(null); setFocused(skill.name); } }}
        onBlur={() => setFocused(null)}>
        <Image src={`/icons/${icons[rowIndex * columns + column]}.svg`} width={21} height={21} alt="" className={["nextjs", "express"].includes(icons[rowIndex * columns + column]) ? "mono-icon" : ""} />
        <span className="skill-label" aria-hidden="true">{skill.name}</span>
      </button>
    </motion.div>)}
    </div>)}
  </div>;
}
