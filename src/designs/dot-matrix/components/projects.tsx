"use client";

import Image from "next/image";
import { useEffect, useRef, useState, ViewTransition, type CSSProperties } from "react";
import { filterProjects, type Project, type ProjectFilter } from "@/data/portfolio";
import { Icon } from "./icon";
import { ProjectPreview } from "./project-preview";

const filters: { id: ProjectFilter; label: string }[] = [{ id: "all", label: "All" }, { id: "ai", label: "AI" }, { id: "business", label: "Business" }];

export function Projects({ projects, preloadFirstImage = false }: { projects: Project[]; preloadFirstImage?: boolean }) {
  const [active, setActive] = useState<ProjectFilter>("all");
  const [focused, setFocused] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  return <>
    <div className="tabs" role="tablist" aria-label="Project category">
      {filters.map((filter, index) => <button key={filter.id} ref={node => { tabs.current[index] = node; }} role="tab" id={`tab-${filter.id}`} aria-controls="project-panel" aria-selected={active === filter.id} tabIndex={focused === index ? 0 : -1} onFocus={() => setFocused(index)} onClick={() => setActive(filter.id)} onKeyDown={event => {
        const next = event.key === "ArrowRight" ? (index + 1) % 3 : event.key === "ArrowLeft" ? (index + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : -1;
        if (next >= 0) { event.preventDefault(); tabs.current[next]?.focus(); }
      }}>{filter.label}</button>)}
    </div>
    {/* Keyed by filter so the cards replay their entrance when the filter changes. */}
    <div id="project-panel" role="tabpanel" aria-labelledby={`tab-${active}`} tabIndex={0} className="grid" key={active}>
      {filterProjects(active, projects).map((project, index) => <ProjectCard key={project.slug} project={project} index={index} preload={preloadFirstImage && project.slug === projects[0]?.slug} />)}
    </div>
  </>;
}

function ProjectCard({ project, index, preload }: { project: Project; index: number; preload: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const card = useRef<HTMLElement>(null);
  // A pointer that entered before hydration never fires onPointerEnter.
  useEffect(() => { if (card.current?.matches(":hover")) setHovered(true); }, []);
  return <article ref={card} className="card" style={{ "--i": index } as CSSProperties} onPointerEnter={event => { if (event.pointerType !== "touch") setHovered(true); }}
    onPointerLeave={() => setHovered(false)} onFocusCapture={event => { if (event.target.matches(":focus-visible")) setFocused(true); }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="media">
      {project.award && <span className="award"><Icon name="tri" />{project.award}</span>}
      <ViewTransition name={`project-${project.slug}`} share="morph" default="none">{project.previewVideo ? <ProjectPreview src={project.previewVideo} poster={project.image} title={project.title} active={hovered || focused} preload={preload} /> :
        <Image className="project-image" src={project.image} alt={`${project.title} application preview`} width={project.imageWidth} height={project.imageHeight} preload={preload} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 95vw" />}</ViewTransition>
    </div>
    <div className="in">
      <h3>{project.title}<time>{project.year}</time></h3>
      <p>{project.description}</p>
      <div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <div className="row">{project.links.map(link => <a className="btn" key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${link.label}: ${project.title} (opens in new tab)`}>{link.label}<Icon name="ne" /></a>)}</div>
    </div>
  </article>;
}
