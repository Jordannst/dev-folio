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
