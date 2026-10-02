import Image from "next/image";
import { Suspense } from "react";
import { GitHubActivity } from "@/components/github-activity";
import Link from "next/link";
import { portfolio } from "@/data/portfolio";
import { CommandMenu } from "@/components/command-menu";
import { Experience } from "@/components/experience";
import { Projects } from "@/components/projects";
import { Footer, Leaf, SectionHeading } from "@/components/site-frame";
import { Icon } from "@/components/icon";

const skillIcons = ["javascript", "typescript", "python", "go", "php", "react", "react", "nextjs", "tailwindcss", "nodejs", "express", "laravel", "mongodb", "postgresql", "git", "figma"];
export default function HomePage() {
  return <main id="main" className="site-shell">
    <Leaf className="hero-leaf" />
    <header className="hero"><div className="hero-intro cross-line">
      <div className="avatar-frame"><Image src={portfolio.profile.avatar} alt="Jordan Sutarto" width={696} height={932} priority sizes="(min-width: 640px) 96px, 72px" /></div>
      <div className="hero-identity"><h1 id="home" tabIndex={-1}>Hi, I’m {portfolio.profile.name} <span className="name-star" aria-hidden="true">✧</span></h1><p>cs · fullstack · ai</p></div><CommandMenu />
    </div><p className="bio">{portfolio.profile.bio.split(/(Fullstack Developer|AI enthusiast|fourth-year Computer Science student|Indonesia)/g).map((text, index) => index % 2 ? <strong key={index} className={text === portfolio.profile.role ? "role-accent" : undefined}>{text}</strong> : text)}</p>
    <a href={`mailto:${portfolio.profile.email}`} className="button hero-cta">Get in touch <Icon name="arrow" /></a>
    <div className="socials"><p>Here are my <strong>socials</strong></p><div className="social-links">{portfolio.socials.map((social, index) => <a className="button" href={social.url} key={social.label} target="_blank" rel="noopener noreferrer"><Icon name={(["github", "linkedin", "instagram"] as const)[index]} />{social.label}<span className="sr-only"> (opens in new tab)</span></a>)}</div></div></header>
    <section className="experience-section" aria-labelledby="experience"><SectionHeading id="experience">Experience</SectionHeading><Experience items={portfolio.experience} /></section>
    <section className="skills-section" aria-labelledby="skills"><SectionHeading id="skills">Skills</SectionHeading><ul className="skill-list">{portfolio.skills.map((skill, index) => <li key={skill.name}><span tabIndex={0} className="skill" aria-label={skill.name}><Image src={`/icons/${skillIcons[index]}.svg`} width={21} height={21} alt="" className={['nextjs', 'express'].includes(skillIcons[index]) ? 'mono-icon' : ''} /><span className="skill-tooltip" aria-hidden="true">{skill.name}</span></span></li>)}</ul></section>
    <section className="projects-section wide-mobile" aria-labelledby="projects"><SectionHeading id="projects">Projects</SectionHeading><Projects projects={portfolio.projects} /><div className="see-more"><Link href="/projects" className="see-more-button">SEE MORE</Link></div></section>
    <section className="github-section" aria-labelledby="github"><SectionHeading id="github">GitHub Activity</SectionHeading><Suspense fallback={<p role="status" className="muted">Loading GitHub activity…</p>}><GitHubActivity /></Suspense></section>
    <Footer />
  </main>;
}
