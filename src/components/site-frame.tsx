import { portfolio } from "@/data/portfolio";
import { Icon } from "./icon";
import { Leaf } from "./leaf";

export { Leaf };

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
