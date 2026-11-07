"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Experience as ExperienceItem } from "@/data/portfolio";
import { Icon } from "./icon";

const dateLabel = (value: string) => new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-01T00:00:00Z`));

export function Experience({ items }: { items: ExperienceItem[] }) {
  const [expanded, setExpanded] = useState<number[]>([]);
  const reduced = useReducedMotion();
  return <div className="experience-list">{items.map((item, index) => {
    const open = expanded.includes(index);
    return <article className="experience-row cross-line" key={item.organization}>
      <h3><button className="experience-toggle" aria-expanded={open} aria-controls={`experience-detail-${index}`} onClick={() => setExpanded(prev => open ? prev.filter(i => i !== index) : [...prev, index])}>
        <span className={`organization-mark organization-${index}${item.logo ? " organization-logo" : ""}`} aria-hidden="true">{item.logo ? <Image src={item.logo.src} width={item.logo.width} height={item.logo.height} sizes="128px" alt="" /> : ["LXVI", "KD", "UV"][index]}</span>
        <span className="experience-title"><span>{item.organization}</span><span className="experience-role">{item.role}</span></span>
        <span className="experience-date">{dateLabel(item.startDate)} – {item.endDate ? dateLabel(item.endDate) : "Present"}</span>
        <Icon name="chevron" className={open ? "chevron expanded" : "chevron"} />
      </button></h3>
      <div id={`experience-detail-${index}`}>
        <AnimatePresence initial={false}>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : .25 }} className="experience-detail-wrap">
          <div className="experience-detail"><p>{item.summary}</p><ul>{item.highlights.map(line => <li key={line}>{line}</li>)}</ul><div className="tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
        </motion.div>}</AnimatePresence>
      </div>
    </article>;
  })}</div>;
}
