import { useId } from "react";
import { portfolio } from "@/data/portfolio";
import { Icon } from "./icon";

export function Leaf({ className = "" }: { className?: string }) {
  const id = useId();
  return <svg className={`leaf ${className}`} viewBox="0 0 180 180" aria-hidden="true"><defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a6c9a9" /><stop offset="1" stopColor="#8da7ff" /></linearGradient></defs><path fill="#a6c9a9" d="M173 37C145 11 122 78 41 60 18 55 12 41 19 25-3 43 5 83 43 83c50 0 90-49 130-46Z"/><path fill={`url(#${id})`} d="M126 44c-24 21-50 32-57 63-7 29 22 44 16 65 32-15 42-39 29-66-14-29-6-46 12-62Z"/><path d="M81 90c14-25 33-46 54-57" fill="none" stroke="#a6c9a9" strokeWidth="3"/></svg>;
}

export function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return <div className="section-heading cross-line"><h2 id={id} tabIndex={-1}>{children}</h2></div>;
}

export function Footer() {
  return <footer className="footer wide-mobile cross-line">
    <Leaf className="footer-leaf" />
    <h2 id="contact" tabIndex={-1}>{portfolio.profile.name}</h2>
    <p>Building practical apps &amp; thoughtful experiences <span aria-hidden="true">✧</span></p>
    <a className="button contact-button" href={`mailto:${portfolio.profile.email}`}>Get in touch <Icon name="arrow" /></a>
    <div className="footer-bottom"><span>Made with care <span aria-hidden="true">♡</span></span><span>© {new Date().getFullYear()} {portfolio.profile.name}</span></div>
  </footer>;
}
