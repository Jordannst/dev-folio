import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { GitHubActivity } from "@/components/github-activity";
import { portfolio } from "@/data/portfolio";
import { CommandMenu } from "@/components/command-menu";
import { Experience } from "@/components/experience";
import { Projects } from "@/components/projects";
import { Footer, Ground, SectionHeading } from "@/components/site-frame";
import { Icon } from "@/components/icon";
import { Companion } from "@/components/companion";
import { SocialLinks } from "@/components/social-links";
import { SkillList } from "@/components/skill-list";
import { HanddrawnRole } from "@/components/handdrawn-role";
import { PageTransition } from "@/components/page-transition";
import { SceneCanvas } from "@/components/scene";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = { alternates: { canonical: "/" } };
// Static HTML from the CDN, regenerated on the GitHub calendar's own 6-hour cache cadence (src/lib/github.ts).
export const revalidate = 21600;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: `${siteUrl}/`,
  mainEntity: {
    "@type": "Person",
    name: portfolio.profile.name,
    alternateName: portfolio.profile.githubUsername,
    url: `${siteUrl}/`,
    image: new URL(portfolio.profile.avatar, siteUrl).href,
    description: portfolio.profile.bio,
    sameAs: portfolio.socials.map(social => social.url),
  },
};
const { profile } = portfolio;
const marker = [[4, 0], [3, 1], [5, 1], [2, 2], [6, 2], [1, 3], [7, 3], [0, 4], [4, 4], [8, 4], [1, 5], [7, 5], [2, 6], [6, 6], [3, 7], [5, 7], [4, 8]];

export default function HomePage() {
  return <PageTransition><div className="page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <header className="scene hero">
      <SceneCanvas kind="hero" />
      <div className="copy"><div className="wrap">
        <h1 className="dot" id="home" tabIndex={-1}><span>Jordan</span> <span>Sutarto</span></h1>
        <span className="chip">CS · Fullstack · AI</span>
      </div></div>
      <svg className="marker" viewBox="0 0 9 9" aria-hidden="true"><g fill="var(--accent)">{marker.map(([x, y]) => <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" />)}</g></svg>
      <Companion />
    </header>
    <main id="main" className="col">
      <div className="intro">
        <div className="avatar"><Image src={profile.avatar} alt={profile.name} width={696} height={932} priority sizes="88px" /></div>
        <div className="who"><p>Hi, I’m <span className="name">Jordan<span className="verified" aria-hidden="true"><Icon name="badge" /></span></span></p><p>{profile.role} · {profile.focus} · {profile.location}</p></div>
        <CommandMenu />
      </div>
      <p className="bio">{profile.bio.split(/(Fullstack Developer|AI enthusiast|fourth-year Computer Science student|Indonesia)/g).map((text, index) => index % 2 ? text === profile.role ? <HanddrawnRole key={index}>{text}</HanddrawnRole> : <strong key={index}>{text}</strong> : text)}</p>
      <div className="cta"><a className="btn solid" href={`mailto:${profile.email}`}>Get in touch <Icon name="e" /></a></div>
      <div className="socials"><p>Here are my <strong>socials</strong></p><SocialLinks socials={portfolio.socials} profile={profile} /></div>
      <section className="cross" aria-labelledby="experience"><SectionHeading id="experience" index={1}>Experience</SectionHeading><Experience items={portfolio.experience} /></section>
      <section className="cross" aria-labelledby="skills"><SectionHeading id="skills" index={2}>Skills</SectionHeading><SkillList skills={portfolio.skills} /></section>
      <section className="cross" aria-labelledby="projects"><SectionHeading id="projects" index={3}>Projects</SectionHeading><Projects projects={portfolio.projects} />
        <div className="see-more"><Link href="/projects" className="btn" transitionTypes={["nav-forward"]}>See more projects</Link></div></section>
      <section className="cross" aria-labelledby="github"><SectionHeading id="github" index={4}>GitHub</SectionHeading><Suspense fallback={<p role="status" className="muted">Loading GitHub activity…</p>}><GitHubActivity /></Suspense></section>
      <Footer />
    </main>
    <Ground />
  </div></PageTransition>;
}
