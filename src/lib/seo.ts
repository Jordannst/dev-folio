import type { Metadata } from "next";
import { portfolio } from "@/data/portfolio";

export const siteUrl = "https://www.jordannst.dev";
export const socialPreview = {
  type: "website" as const,
  siteName: `${portfolio.profile.name} (${portfolio.profile.githubUsername})`,
  images: [{
    url: new URL(portfolio.profile.avatar, siteUrl).href,
    width: 696,
    height: 932,
    alt: portfolio.profile.name,
  }],
};

const title = `${socialPreview.siteName} | Full Stack Developer & AI`;
const description = "Jordan Sutarto (Jordannst), a full stack developer in Indonesia building web applications with Next.js, Laravel, and practical AI integrations.";

// Shared by every design's root layout, so switching designs never changes titles, previews, or canonical URLs.
export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s | ${socialPreview.siteName}` },
  description,
  authors: [{ name: portfolio.profile.name, url: siteUrl }],
  openGraph: { ...socialPreview, title, description, url: "/" },
  twitter: { card: "summary" },
};
