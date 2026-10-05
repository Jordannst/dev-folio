import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { SiteControls } from "@/components/site-controls";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jordannst | Full Stack Developer & AI",
  description: "Fullstack Developer and AI enthusiast based in Indonesia.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `(function(){var theme;try{theme=localStorage.getItem('portfolio-theme')}catch{}document.documentElement.dataset.theme=theme==='dark'||theme==='light'?theme:'dark'})()` }} /></head>
      <body className={`${inter.variable} ${instrumentSerif.variable} font-sans antialiased`}>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
        <SiteControls />
        <Analytics />
      </body>
    </html>
  );
}
