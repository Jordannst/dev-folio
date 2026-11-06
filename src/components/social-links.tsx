"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { Icon } from "./icon";

type Social = { label: string; url: string; stats?: { label: string; value: number }[]; achievements?: { name: string; image: string; tier?: number }[] };
type Profile = { name: string; role: string; focus: string; location: string; avatar: string };

// Profile preview on mouse hover or keyboard focus (not on touch); Escape dismisses it.
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
      return <div className="soc" key={social.label}
        onPointerEnter={event => { if (event.pointerType !== "touch") setOpen(index); }}
        onPointerLeave={() => setOpen(null)}
        onBlur={() => setOpen(null)}>
        <a className="btn" href={social.url} target="_blank" rel="noopener noreferrer"
          aria-describedby={open === index ? `${id}-${index}` : undefined}
          onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setOpen(index); }}>
          {social.label}<Icon name="ne" /><span className="sr-only"> (opens in new tab)</span>
        </a>
        {open === index && <div className={`pop${index === 0 ? " gh" : ""}`} id={`${id}-${index}`} role="tooltip">
          <div className="pop-in">
            <div className="pop-head">
              <Image className="pop-av" src={profile.avatar} alt="" width={56} height={56} sizes="56px" />
              <div><strong>{profile.name}</strong><span>{index === 1 ? "in/" : index === 2 ? "@" : ""}{handle}</span></div>
            </div>
            <p className="pop-bio">{profile.role} · {profile.focus}</p>
            <p className="pop-loc"><Icon name="pin" />{profile.location}</p>
            {social.stats && <dl className="pop-stats">{social.stats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value.toLocaleString("en")}</dd></div>)}</dl>}
            {social.achievements && <div className="pop-ach">
              <p>Achievements</p>
              <ul>{social.achievements.map(badge => <li key={badge.name} title={`${badge.name}${badge.tier ? ` x${badge.tier}` : ""}`}>
                <Image src={badge.image} alt={`${badge.name}${badge.tier ? ` x${badge.tier}` : ""}`} width={44} height={44} sizes="44px" />
                {badge.tier && <span className="tier" data-tier={badge.tier} aria-hidden="true">x{badge.tier}</span>}
              </li>)}</ul>
            </div>}
          </div>
        </div>}
      </div>;
    })}
  </div>;
}
