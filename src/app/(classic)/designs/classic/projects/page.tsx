import type { Metadata } from "next";
import Link from "next/link";
import { portfolio } from "@/data/portfolio";
import { Projects } from "@/designs/classic/components/projects";
import { Footer } from "@/designs/classic/components/site-frame";
import { CommandMenu } from "@/designs/classic/components/command-menu";
import { Icon } from "@/designs/classic/components/icon";
import { PageTransition } from "@/designs/classic/components/page-transition";
import { socialPreview } from "@/lib/seo";

const title = "Web, Mobile & AI Projects";
const description = "Explore Jordan Sutarto's web, mobile, and AI projects: RAG document chat, cloud POS, logistics invoicing, and civic reporting.";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/projects" },
  openGraph: { ...socialPreview, title: `${title} | ${socialPreview.siteName}`, description, url: "/projects" },
};
export default function ProjectsPage() {
  return <PageTransition><main id="main" className="site-shell archive-shell"><header className="archive-header cross-line"><Link href="/" className="text-link" prefetch transitionTypes={["nav-back"]}><Icon name="back" />Back home</Link><div><h1 id="home" tabIndex={-1}>Projects</h1><CommandMenu /></div></header><section className="wide-mobile" aria-label="Selected projects"><Projects projects={portfolio.projects} preloadFirstImage /></section><Footer /></main></PageTransition>;
}
