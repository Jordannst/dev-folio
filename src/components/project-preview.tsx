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
      // Video bytes only flow while a preview is active. Over HTTP/2 an idle open-ended range request
      // keeps streaming the whole file and queues navigation responses behind it on slow links.
      // src is already removed here, so load() aborts that request and rewinds to the first frame.
      if (element.networkState !== HTMLMediaElement.NETWORK_EMPTY) element.load();
      return;
    }

    let cancelled = false;
    let requested = false;
    const startWhenBuffered = () => {
      if (requested || element.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      // Mobile browsers may stop preloading early once they signal canplaythrough.
      const target = Math.min(element.currentTime + 4, element.duration);
      const readyToStart = element.currentTime === 0 && element.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA;
      for (let index = 0; index < element.buffered.length; index++) {
        if (element.buffered.start(index) <= element.currentTime && (readyToStart || element.buffered.end(index) >= target - .05)) {
          requested = true;
          void element.play().catch(() => { if (!cancelled) setPlaying(false); });
          break;
        }
      }
    };
    const refillBuffer = () => {
      // Avoid repeated stop/start playback when the connection falls behind.
      // Preserve the last displayed frame while gathering another buffer window.
      element.pause();
      requested = false;
      startWhenBuffered();
    };
    const events = ["progress", "loadeddata", "canplay", "canplaythrough", "durationchange"];
    events.forEach(event => element.addEventListener(event, startWhenBuffered));
    element.addEventListener("waiting", refillBuffer);
    startWhenBuffered();
    return () => {
      cancelled = true;
      events.forEach(event => element.removeEventListener(event, startWhenBuffered));
      element.removeEventListener("waiting", refillBuffer);
      element.pause();
    };
  }, [shouldPlay]);

  return <button ref={frame} type="button" className="project-preview" data-playing={playing && shouldPlay}
    aria-label={`Video preview: ${title}`} aria-pressed={shouldPlay} disabled={failed} onClick={() => setManual(!shouldPlay)}>
    <Image className="project-image" src={poster} alt={`${title} application preview`} width={1920} height={1080} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 95vw" />
    <video ref={video} src={shouldPlay ? src : undefined} preload={shouldPlay ? "auto" : "none"}
      width={1280} height={720} muted loop playsInline disablePictureInPicture aria-hidden="true"
      onPlaying={() => setPlaying(true)} onError={() => setFailed(true)} />
  </button>;
}
