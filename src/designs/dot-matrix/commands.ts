import { portfolio } from "../../data/portfolio.ts";

export const commands = [
  { label: "Home", href: "/" },
  { label: "Experience", href: "/#experience" },
  { label: "Skills", href: "/#skills" },
  { label: "Projects", href: "/#projects" },
  { label: "GitHub Activity", href: "/#github" },
  { label: "Contact", href: "/#contact" },
  // Actions too, so the menu covers the floating buttons that phones fold into one menu button.
  { label: "Switch theme", href: "#theme" },
  { label: "Email Jordan", href: `mailto:${portfolio.profile.email}` },
];
