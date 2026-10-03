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
import { Companion } from "@/components/companion";
import { SocialLinks } from "@/components/social-links";
import { SkillList } from "@/components/skill-list";

export default function HomePage() {
  return <main id="main" className="site-shell">
    <Companion />
    <Leaf className="hero-leaf" />
    <header className="hero"><div className="hero-intro cross-line">
      <div className="avatar-frame"><Image src={portfolio.profile.avatar} alt="Jordan Sutarto" width={696} height={932} priority sizes="(min-width: 640px) 96px, 72px" /></div>
      <div className="hero-identity"><h1 id="home" tabIndex={-1}>Hi, I’m {portfolio.profile.name} <svg className="name-verified" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1.5c1.2 0 1.8 1.4 2.8 1.8s2.4-.2 3.3.6.3 2.3.7 3.3 1.7 1.6 1.7 2.8c0 .8 1.5 1.1 1.5 2s-1.5 1.2-1.5 2c0 1.2-1.3 1.8-1.7 2.8s.2 2.5-.7 3.3-2.3.2-3.3.6S13.2 22.5 12 22.5s-1.8-1.4-2.8-1.8-2.4.2-3.3-.6-.3-2.3-.7-3.3S3.5 15.2 3.5 14C3.5 13.2 2 12.9 2 12s1.5-1.2 1.5-2c0-1.2 1.3-1.8 1.7-2.8s-.2-2.5.7-3.3 2.3-.2 3.3-.6S10.8 1.5 12 1.5Z"/><path d="m8 12 2.5 2.5 5.5-6" fill="none" stroke="var(--background)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></h1><p>cs · fullstack · ai</p></div><CommandMenu />
    </div><p className="bio">{portfolio.profile.bio.split(/(Fullstack Developer|AI enthusiast|fourth-year Computer Science student|Indonesia)/g).map((text, index) => index % 2 ? <strong key={index} className={text === portfolio.profile.role ? "role-accent" : undefined}>{text}</strong> : text)}</p>
    <a href={`mailto:${portfolio.profile.email}`} className="button hero-cta"><span className="button-face">Get in touch <Icon name="arrow" /></span></a>
    <div className="socials"><p>Here are my <strong>socials</strong></p><SocialLinks socials={portfolio.socials} profile={portfolio.profile} /></div></header>
    <section className="experience-section" aria-labelledby="experience"><SectionHeading id="experience">Experience</SectionHeading><Experience items={portfolio.experience} /></section>
    <section className="skills-section" aria-labelledby="skills"><Leaf className="skills-bud" variant="bud" /><SectionHeading id="skills">Skills</SectionHeading><SkillList skills={portfolio.skills} /></section>
    <section className="projects-section wide-mobile" aria-labelledby="projects"><SectionHeading id="projects">Projects</SectionHeading><Projects projects={portfolio.projects} /><div className="see-more"><Link href="/projects" className="see-more-button">SEE MORE</Link></div></section>
    <section className="github-section" aria-labelledby="github"><SectionHeading id="github">GitHub Activity</SectionHeading><Suspense fallback={<p role="status" className="muted">Loading GitHub activity…</p>}><GitHubActivity /></Suspense></section>
    <Footer />
  </main>;
}
