"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { Icon } from "./icon";

type Social = { label: string; url: string; stats?: { label: string; value: number }[]; achievements?: { name: string; image: string; tier?: number }[] };
type Profile = { name: string; role: string; focus: string; location: string; avatar: string };
const icons = ["github", "linkedin", "instagram"] as const;

export function SocialLinks({ socials, profile }: { socials: Social[]; profile: Profile }) {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();
  useEffect(() => {
    if (open === null) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [open]);

  return <div className="social-links">
    {socials.map((social, index) => {
      const handle = new URL(social.url).pathname.split("/").filter(Boolean).at(-1);
      return <div className="social-profile" key={social.label}
        onPointerEnter={event => { if (event.pointerType !== "touch") setOpen(index); }}
        onPointerLeave={() => setOpen(null)}
        onBlur={() => setOpen(null)}>
        <a className="button" href={social.url} target="_blank" rel="noopener noreferrer"
          aria-describedby={open === index ? `${id}-${index}` : undefined}
          onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setOpen(index); }}>
          <Icon name={icons[index]} />{social.label}<span className="sr-only"> (opens in new tab)</span>
        </a>
        {open === index && <div className="social-preview" id={`${id}-${index}`} role="tooltip">
          <div className={`social-card${index === 0 ? " social-card-github" : ""}`}>
            <div className="social-card-heading">
              <Image className="social-avatar" src={profile.avatar} alt="" width={58} height={58} sizes="58px" />
              <div><strong className="social-name">{profile.name}</strong><span className="social-handle">{index === 1 ? "in/" : index === 2 ? "@" : ""}{handle}</span></div>
            </div>
            <p className="social-bio">{profile.role} · {profile.focus}</p>
            <p className="social-location"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>{profile.location}</p>
            {social.stats && <dl className="social-stats">{social.stats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value.toLocaleString("en")}</dd></div>)}</dl>}
            {social.achievements && <div className="social-achievements">
              <p>Achievements</p>
              <ul>{social.achievements.map(badge => <li key={badge.name} title={`${badge.name}${badge.tier ? ` x${badge.tier}` : ""}`}>
                <Image src={badge.image} alt={`${badge.name}${badge.tier ? ` x${badge.tier}` : ""}`} width={44} height={44} sizes="44px" />
                {badge.tier && <span className="achievement-tier" data-tier={badge.tier} aria-hidden="true">x{badge.tier}</span>}
              </li>)}</ul>
            </div>}
          </div>
        </div>}
      </div>;
    })}
  </div>;
}
