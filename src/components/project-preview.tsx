"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Previews stream through Media Source in bounded Range requests, at most two chunks in flight.
// A plain <video src> sends one open-ended request, and the server keeps pushing that file onto the
// page's shared HTTP/2 connection after the pointer leaves; aborting cannot recall those bytes
// (dad61c4), so the next preview queued behind ~1 MB on Slow 4G. Media Source only takes fragmented
// MP4: remux new files with `ffmpeg -i in.mp4 -c copy -movflags +frag_keyframe+empty_moov+default_base_moof
// -frag_duration 500000`, so the first 128 KB chunk already holds playable frames.
const CHUNK = 128 * 1024;
const TYPE = 'video/mp4; codecs="avc1.640032"';
type Feed = { next: number; size: number; active: boolean; running: boolean; closed: boolean; source?: MediaSource; buffer?: SourceBuffer };

const request = (src: string, feed: Feed) => {
  const start = feed.next;
  feed.next += CHUNK;
  return fetch(src, { headers: { Range: `bytes=${start}-${feed.next - 1}` } });
};

const append = (buffer: SourceBuffer, data: BufferSource) => new Promise((resolve, reject) => {
  buffer.addEventListener("updateend", resolve, { once: true });
  buffer.addEventListener("error", reject, { once: true });
  buffer.appendBuffer(data);
});

async function pump(element: HTMLVideoElement, src: string, feed: Feed) {
  const buffer = feed.buffer;
  if (feed.running || !buffer) return;
  feed.running = true;
  const wanted = () => feed.active && feed.next < feed.size;
  try {
    let pending = wanted() ? request(src, feed) : null;
    while (pending) {
      const response = await pending;
      const size = Number(response.headers.get("content-range")?.split("/")[1]);
      if (response.status !== 206 || !size) throw new Error(`Unexpected ${response.status} for ${src}`);
      feed.size = size;
      // Ask for the next chunk while this one streams, so the link stays busy during playback.
      pending = wanted() ? request(src, feed) : null;
      const reader = response.body!.getReader();
      for (let part = await reader.read(); !part.done; part = await reader.read()) await append(buffer, part.value);
      pending ??= wanted() ? request(src, feed) : null;
    }
    if (feed.next >= feed.size && feed.source!.readyState === "open") feed.source!.endOfStream();
  } catch {
    if (feed.closed) return;
    // Fall back to the browser's own loader rather than leave the preview stuck.
    feed.buffer = undefined;
    element.src = src;
    if (feed.active) element.play().catch(() => {});
  } finally { feed.running = false; }
}

function attach(element: HTMLVideoElement, src: string, feed: Feed) {
  if (!window.MediaSource?.isTypeSupported(TYPE)) { element.src = src; return; }
  const source = feed.source = new MediaSource();
  element.src = URL.createObjectURL(source);
  source.addEventListener("sourceopen", () => {
    URL.revokeObjectURL(element.src);
    feed.buffer = source.addSourceBuffer(TYPE);
    void pump(element, src, feed);
  }, { once: true });
}

export function ProjectPreview({ src, poster, title, active, preload = false }: { src: string; poster: string; title: string; active: boolean; preload?: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [canAutoPlay, setCanAutoPlay] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const feed = useRef<Feed>({ next: 0, size: Infinity, active: false, running: false, closed: false });
  // Hover (or keyboard focus inside the card) is the only trigger; clicking the preview does nothing.
  const shouldPlay = !failed && visible && pageVisible && active && canAutoPlay;

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    const connection = (navigator as Navigator & { connection?: { saveData: boolean } }).connection;
    const policy = () => setCanAutoPlay(!reduced.matches && pointer.matches && !connection?.saveData);
    const visibility = () => setPageVisible(!document.hidden);
    policy(); visibility();
    reduced.addEventListener("change", policy); pointer.addEventListener("change", policy);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .1 });
    observer.observe(frame.current!);
    const current = feed.current;
    current.closed = false;
    return () => {
      current.closed = true; current.active = false;
      observer.disconnect();
      reduced.removeEventListener("change", policy); pointer.removeEventListener("change", policy);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    const element = video.current!;
    feed.current.active = shouldPlay;
    if (!shouldPlay) {
      element.pause();
      setPlaying(false);
      if (element.readyState > 0) element.currentTime = 0;
      return;
    }
    // Load on demand and start at once; the poster stays until frames flow. Warming nearby previews
    // made their downloads starve the hovered one. Leaving pauses and stops asking for chunks; what is
    // already appended stays for the next hover. A play() interrupted by a quick leave rejects with
    // AbortError, which is expected.
    if (!element.src) attach(element, src, feed.current);
    else void pump(element, src, feed.current);
    element.play().catch(() => {});
    return () => element.pause();
  }, [shouldPlay, src]);

  return <div ref={frame} className="project-preview" data-playing={playing && shouldPlay}>
    <Image className="project-image" src={poster} alt={`${title} application preview`} width={1920} height={1080} preload={preload} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 95vw" />
    <video ref={video} preload="none"
      width={1280} height={720} muted loop playsInline disablePictureInPicture aria-hidden="true"
      onPlaying={event => setPlaying(!event.currentTarget.paused)} onError={() => setFailed(true)} />
  </div>;
}
