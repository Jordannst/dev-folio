import { portfolio } from "@/data/portfolio";
import { Icon } from "./icon";
import { SceneCanvas } from "./scene";

const mail = `mailto:${portfolio.profile.email}`;

export function SectionHeading({ id, index, children }: { id: string; index: number; children: string }) {
  return <div className="head"><h2 className="dot" id={id} tabIndex={-1}>{children}</h2><span aria-hidden="true">0{index} / 04</span></div>;
}

// Connect-the-dots envelope. The line is plotted on the 4px grid in drawing order (1→2→3→4→1→5→4),
// and a stroke mask along the same path uncovers it as the footer scrolls in (CSS scroll timeline).
const corners = [[24, 24], [24, 136], [216, 136], [216, 24], [24, 24], [120, 84], [216, 24]];
const labels = [[24, 24, 12, 28], [24, 136, 12, 140], [216, 136, 228, 140], [216, 24, 228, 28], [120, 84, 120, 104]];
const envelope = (() => {
  const seen = new Set<string>(), dots: [number, number][] = [];
  for (let i = 1; i < corners.length; i++) {
    const [a, b] = corners[i - 1], [c, d] = corners[i], steps = Math.max(Math.abs(c - a), Math.abs(d - b)) / 4;
    for (let s = 0; s <= steps; s++) {
      const x = Math.round((a + (c - a) * s / steps) / 4) * 4, y = Math.round((b + (d - b) * s / steps) / 4) * 4;
      if (!seen.has(`${x},${y}`)) { seen.add(`${x},${y}`); dots.push([x, y]); }
    }
  }
  return dots;
})();

function ConnectDots() {
  return <svg viewBox="0 0 240 152" width="240" height="152" aria-hidden="true">
    <mask id="connect-dots-path" maskUnits="userSpaceOnUse"><polyline className="ink" points={corners.join(" ")} pathLength={1} /></mask>
    <g className="line" mask="url(#connect-dots-path)">{envelope.map(([x, y]) => <rect key={`${x},${y}`} x={x} y={y} width="2" height="2" />)}</g>
    {labels.map(([x, y, tx, ty], index) => <g key={index}><rect className="vertex" x={x - 1} y={y - 1} width="4" height="4" /><text x={tx} y={ty}>{index + 1}</text></g>)}
  </svg>;
}

export function Footer() {
  return <div className="cross foot">
    <a className="connect-dots" href={mail} aria-label="Email Jordan"><ConnectDots /></a>
    <h2 className="dot" id="contact" tabIndex={-1}>Let’s connect</h2>
    <p>Building practical apps &amp; thoughtful experiences.</p>
    <a className="btn solid" href={mail}>Get in touch <Icon name="e" /></a>
  </div>;
}

export function Ground() {
  return <footer className="scene ground">
    <SceneCanvas kind="ground" />
    <a className="mailbox" href={mail} aria-label="Email Jordan"><span className="tip" aria-hidden="true">MAIL ME</span>
      <svg viewBox="0 0 16 24" aria-hidden="true"><rect x="7" y="12" width="2" height="12" fill="var(--wood)" /><rect x="1" y="4" width="12" height="9" fill="var(--dot-hi)" /><rect x="2" y="3" width="10" height="1" fill="var(--dot-hi)" /><rect x="2" y="6" width="5" height="5" fill="var(--bg)" /><rect x="3" y="7" width="3" height="1" fill="var(--dot-hi)" /><g className="flag"><rect x="13" y="6" width="1" height="7" fill="var(--accent)" /><rect x="13" y="6" width="3" height="2" fill="var(--accent)" /></g></svg>
    </a>
    <div className="base"><span>Made with care <span className="heart"><Icon name="heart" /></span></span><span>© {new Date().getFullYear()} {portfolio.profile.name}</span></div>
  </footer>;
}
