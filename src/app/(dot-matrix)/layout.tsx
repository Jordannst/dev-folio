import { Doto, Geist, Geist_Mono } from "next/font/google";
import "@/designs/dot-matrix/styles.css";
import "lenis/dist/lenis.css";
import { SiteControls } from "@/designs/dot-matrix/components/site-controls";
import { Analytics } from "@vercel/analytics/next";
import { baseMetadata } from "@/lib/seo";

// Doto draws headings as dot-matrix type; Geist and Geist Mono carry body text and labels.
const doto = Doto({ subsets: ["latin"], variable: "--font-doto", display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata = baseMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `(function(){var theme;try{theme=localStorage.getItem('portfolio-theme')}catch{}document.documentElement.dataset.theme=theme==='dark'||theme==='light'?theme:'dark'})()` }} /></head>
      <body className={`${doto.variable} ${geist.variable} ${geistMono.variable}`}>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
        <SiteControls />
        <Analytics />
      </body>
    </html>
  );
}
