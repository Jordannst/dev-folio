import Image from "next/image";
import type { Experience as ExperienceItem } from "@/data/portfolio";

const dateLabel = (value: string) => new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-01T00:00:00Z`));

// Native disclosure rows; the open/close height animation is CSS (::details-content).
export function Experience({ items }: { items: ExperienceItem[] }) {
  return <div className="experience">{items.map((item, index) => <details key={item.organization} open={index === 0}>
    <summary>
      <span className={`logo${index === 1 ? " logo-crop" : ""}`} aria-hidden="true">{item.logo ? <Image src={item.logo.src} width={item.logo.width} height={item.logo.height} sizes="72px" alt="" /> : <b>{["LXVI", "KD", "UV"][index]}</b>}</span>
      <span><h3>{item.organization}</h3><small>{item.role}</small></span>
      <time>{dateLabel(item.startDate)} – {item.endDate ? dateLabel(item.endDate) : "Present"}</time>
      <span className="pm" aria-hidden="true" />
    </summary>
    <div className="body"><p>{item.summary}</p><ul>{item.highlights.map(line => <li key={line}>{line}</li>)}</ul><div className="tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
  </details>)}</div>;
}
