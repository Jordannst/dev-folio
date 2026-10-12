import type { Metadata } from "next";
import Link from "next/link";
import { portfolio } from "@/data/portfolio";
import { Projects } from "@/components/projects";
import { Footer } from "@/components/site-frame";
import { CommandMenu } from "@/components/command-menu";
import { Icon } from "@/components/icon";
import { PageTransition } from "@/components/page-transition";
export const metadata: Metadata = { description: "Selected web and mobile applications by Jordan Sutarto." };
export default function ProjectsPage() {
  return <PageTransition><main id="main" className="site-shell archive-shell"><header className="archive-header cross-line"><Link href="/" className="text-link" prefetch transitionTypes={["nav-back"]}><Icon name="back" />Back home</Link><div><h1 id="home" tabIndex={-1}>Projects</h1><CommandMenu /></div></header><section className="wide-mobile" aria-label="Selected projects"><Projects projects={portfolio.projects} preloadFirstImage /></section><Footer /></main></PageTransition>;
}
