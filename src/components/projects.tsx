"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { filterProjects, type Project, type ProjectFilter } from "@/data/portfolio";
import { Icon } from "./icon";
import { ProjectPreview } from "./project-preview";

const filters: { id: ProjectFilter; label: string }[] = [{ id: "all", label: "All" }, { id: "ai", label: "AI" }, { id: "business", label: "Business" }];

export function Projects({ projects, preloadFirstImage = false }: { projects: Project[]; preloadFirstImage?: boolean }) {
  const [active, setActive] = useState<ProjectFilter>("all");
  const [focused, setFocused] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  return <>
    <div className="project-tabs" role="tablist" aria-label="Project category">
      {filters.map((filter, index) => <button key={filter.id} ref={node => { tabs.current[index] = node; }} role="tab" id={`tab-${filter.id}`} aria-controls="project-panel" aria-selected={active === filter.id} tabIndex={focused === index ? 0 : -1} onFocus={() => setFocused(index)} onClick={() => setActive(filter.id)} onKeyDown={event => {
        const next = event.key === "ArrowRight" ? (index + 1) % 3 : event.key === "ArrowLeft" ? (index + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : -1;
        if (next >= 0) { event.preventDefault(); tabs.current[next]?.focus(); }
      }}>{filter.label}{filter.id === "business" && <span aria-hidden="true"> ✧</span>}</button>)}
    </div>
    <div id="project-panel" role="tabpanel" aria-labelledby={`tab-${active}`} tabIndex={0} className="projects-grid project-panel-enter" key={active}>
      {filterProjects(active, projects).map(project => <ProjectCard key={project.slug} project={project} preload={preloadFirstImage && project.slug === projects[0]?.slug} />)}
    </div>
  </>;
}

function ProjectCard({ project, preload }: { project: Project; preload: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return <article className="project-card" onPointerEnter={event => { if (event.pointerType !== "touch") setHovered(true); }}
    onPointerLeave={() => setHovered(false)} onFocusCapture={event => { if (event.target.matches(":focus-visible")) setFocused(true); }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        {project.previewVideo ? <ProjectPreview src={project.previewVideo} poster={project.image} title={project.title} active={hovered || focused} /> :
          <Image className="project-image" src={project.image} alt={`${project.title} application preview`} width={project.imageWidth} height={project.imageHeight} preload={preload} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 95vw" />}
        <div className="project-title"><h3>{project.title}</h3><time>{project.year}</time></div>
        <p>{project.description}</p>
        <div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        <div className="project-links">{project.links.map(link => <a className={`button ${link.label === "GitHub" ? "github-button" : "live-button"}`} key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${link.label}: ${project.title} (opens in new tab)`}>{link.label === "GitHub" && <Icon name="github" />}{link.label}<Icon name="arrow" /></a>)}</div>
      </article>;
}
