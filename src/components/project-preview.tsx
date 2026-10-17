"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function ProjectPreview({ src, poster, title, active }: { src: string; poster: string; title: string; active: boolean }) {
  const frame = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [canAutoPlay, setCanAutoPlay] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [manual, setManual] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const shouldPlay = !failed && visible && pageVisible && (manual ?? (active && canAutoPlay));

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    const connection = (navigator as Navigator & { connection?: { saveData: boolean } }).connection;
    const policy = () => setCanAutoPlay(!reduced.matches && pointer.matches && !connection?.saveData);
    const visibility = () => { setPageVisible(!document.hidden); if (document.hidden) setManual(null); };
    policy(); visibility();
    reduced.addEventListener("change", policy); pointer.addEventListener("change", policy);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (!entry.isIntersecting) setManual(null);
    }, { threshold: .1 });
    observer.observe(frame.current!);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", policy); pointer.removeEventListener("change", policy);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => { if (!active) setManual(null); }, [active]);

  useEffect(() => {
    const element = video.current!;
    if (!shouldPlay) {
      element.pause();
      setPlaying(false);
      if (element.readyState > 0) element.currentTime = 0;
      return;
    }
    // Load on demand and start at once; the poster stays until frames flow. Warming nearby previews
    // made their downloads starve the hovered one. Leaving only pauses: load() would abort a response
    // that stays queued on the shared HTTP/2 connection and stalls the next preview (dad61c4).
    // A play() interrupted by a quick leave rejects with AbortError, which is expected.
    element.play().catch(() => {});
    return () => element.pause();
  }, [shouldPlay]);

  return <button ref={frame} type="button" className="project-preview" data-playing={playing && shouldPlay}
    aria-label={`Video preview: ${title}`} aria-pressed={shouldPlay} disabled={failed} onClick={() => setManual(!shouldPlay)}>
    <Image className="project-image" src={poster} alt={`${title} application preview`} width={1920} height={1080} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 95vw" />
    <video ref={video} src={src} preload="none"
      width={1280} height={720} muted loop playsInline disablePictureInPicture aria-hidden="true"
      onPlaying={event => setPlaying(!event.currentTarget.paused)} onError={() => setFailed(true)} />
  </button>;
}
