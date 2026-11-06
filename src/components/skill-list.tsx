"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const icons = ["javascript", "typescript", "python", "go", "php", "react", "react", "nextjs", "tailwindcss", "nodejs", "express", "laravel", "mongodb", "postgresql", "git", "figma"];

// Icon chips that open their label on hover or keyboard focus (CSS); phones show every label.
export function SkillList({ skills }: { skills: { name: string }[] }) {
  const list = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(skills.length);
  useEffect(() => {
    const node = list.current!;
    const fit = () => {
      // Every row keeps room for the widest label plus its 10px gap, so an opening label never wraps
      // its own chip away from the pointer. A closed chip is 48px wide with a 10px gap.
      const spare = Math.max(...[...node.querySelectorAll("span")].map(label => label.scrollWidth)) + 10;
      setColumns(Math.max(1, Math.floor((node.clientWidth - spare + 10) / 58)));
    };
    fit();
    void document.fonts.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const rows = Array.from({ length: Math.ceil(skills.length / columns) }, (_, row) => skills.slice(row * columns, (row + 1) * columns));
  return <div ref={list} className="skills" role="list" aria-label="Tech stack">{rows.map(row => <div className="skill-row" role="presentation" key={row[0].name}>
    {row.map(skill => { const icon = icons[skills.indexOf(skill)]; return <div role="listitem" key={skill.name}>
      <button type="button" className="skill" aria-label={skill.name}>
        <Image src={`/icons/${icon}.svg`} width={22} height={22} alt="" className={["nextjs", "express"].includes(icon) ? "mono-icon" : undefined} />
        <span aria-hidden="true">{skill.name}</span>
      </button>
    </div>; })}
  </div>)}</div>;
}
