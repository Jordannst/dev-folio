import Image from "next/image";
import { cookies } from "next/headers";
import { missingAuthEnv } from "@/designs/admin-config";
import { readActiveDesign } from "@/designs/edge-config";
import { defaultDesign, designs, isDesignId } from "@/designs/registry";
import { SESSION_COOKIE, verifySession } from "@/designs/session";
import { ActivateButton } from "./activate-button";
import { LoginButton } from "./login-button";
import { Stage } from "./stage";

type Params = Record<string, string | string[] | undefined>;
const nameOf = (id: string) => designs.find(design => design.id === id)?.name;

// Only known values produce a message; anything else in the query is ignored.
function notice({ activated, error, status }: Params): { tone: "ok" | "error"; text: string } | undefined {
  if (isDesignId(activated)) return { tone: "ok", text: `${nameOf(activated)} sekarang tayang. Pengunjung melihatnya dalam beberapa detik.` };
  const text = error === "login" ? "Login gagal. Coba lagi."
    : error === "denied" ? "Akun ini tidak punya akses."
    : error === "config" ? "Login belum dikonfigurasi."
    : error === "edge-config" ? "Global Config (dulu Edge Config) belum terhubung ke project."
    : error === "save" ? `Gagal menyimpan pilihan${typeof status === "string" && /^\d{3}$/.test(status) ? ` (status ${status})` : ""}. Desain aktif tidak berubah.`
    : undefined;
  return text ? { tone: "error", text } : undefined;
}

// The login page is public, so it speaks the site's English; the catalog behind it stays Indonesian.
const loginNotices: Record<string, string> = {
  login: "Sign-in failed. Try again.",
  denied: "This account doesn't have access.",
  config: "Sign-in isn't configured yet.",
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const message = notice(params);
  const missing = missingAuthEnv();
  const signedIn = !missing.length && await verifySession((await cookies()).get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET, process.env.ADMIN_GITHUB_ID);
  const loginNotice = typeof params.error === "string" && Object.hasOwn(loginNotices, params.error) ? loginNotices[params.error] : undefined;
  if (!signedIn) return <main className="login" lang="en">
    <section className="login-copy" aria-labelledby="login-title">
      <Fold />
      <p className="eyebrow">jordannst.dev / admin</p>
      <h1 id="login-title">Design catalog</h1>
      <p className="lede">This page is for Jordan only. Sign in with GitHub to choose the design visitors see.</p>
      {loginNotice && !(missing.length && params.error === "config") && <p className="notice alert" role="alert">{loginNotice}</p>}
      {missing.length ? <div className="notice alert" role="alert">
        <h2>Sign-in isn't configured yet</h2>
        <p>Missing environment variables:</p>
        <ul>{missing.map(name => <li key={name}><code>{name}</code></li>)}</ul>
      </div> : <LoginButton />}
      <a className="home" href="/"><span aria-hidden="true">←</span>Back to home</a>
    </section>
    <Stage />
  </main>;
  return <main className="admin">
    <header className="admin-head">
      <div className="brand">
        <Fold />
        <div>
          <p className="eyebrow">jordannst.dev / admin</p>
          <h1>Katalog desain</h1>
        </div>
      </div>
      <div className="head-actions">
        <a className="button ghost" href="/"><span className="back" aria-hidden="true">←</span>Kembali ke beranda</a>
        <form action="/api/auth/logout" method="post"><button type="submit" className="button ghost">Logout</button></form>
      </div>
    </header>
    {message && <p className={`notice ${message.tone}`} role={message.tone === "error" ? "alert" : "status"}>{message.text}</p>}
    <Catalog />
  </main>;
}

// The Fold mark from src/app/icon.svg; its two planes fold in on load.
function Fold() {
  return <svg className="fold" viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
    <path className="fold-top" d="M39.4 4 19.6 15.5Q16.4 17.3 16.4 20.2V33L39.4 19.9Z" />
    <path className="fold-bottom" d="m28.9 28.3 17.3 7.6q1.4.6 1.4 1.6v10.4q0 2.6-2.4 4.2L32.3 60V43.3L16.5 35.7Z" />
  </svg>;
}

async function Catalog() {
  const active = await readActiveDesign({ consistentRead: true });
  const live = designs.find(design => design.id === active.id)!;
  const others = designs.filter(design => design.id !== active.id);
  return <>
    {!active.ok && <p className="notice warn" role="status">Desain aktif tidak bisa dibaca; situs memakai default {nameOf(defaultDesign)}.</p>}
    <section className="live" aria-labelledby="live-name">
      <div className="frame">
        <div className="frame-bar" aria-hidden="true"><span className="dots"><i /><i /><i /></span><span className="url">jordannst.dev</span></div>
        <div className="screen">
          <Image src={`/design-thumbnails/${live.id}.webp`} width={640} height={400} alt={`Tampilan ${live.name}`} sizes="(max-width: 719px) 100vw, 560px" priority data-state="current" />
        </div>
      </div>
      <div className="live-body">
        <p className="live-label"><span className="pulse" aria-hidden="true" />Sedang tayang</p>
        <h2 id="live-name">{live.name}</h2>
        <p>{live.description}</p>
      </div>
    </section>
    <section className="others" aria-labelledby="others-title">
      <h2 id="others-title" className="section-title">Desain lain <span className="count">{others.length}</span></h2>
      {others.length ? <ul className="catalog">{others.map((design, index) => <li key={design.id} className="card" style={{ "--i": index } as React.CSSProperties}>
        <div className="thumb">
          <Image src={`/design-thumbnails/${design.id}.webp`} width={640} height={400} alt={`Tampilan ${design.name}`} sizes="(max-width: 639px) 100vw, 464px" />
        </div>
        <div className="card-body">
          <h3>{design.name}</h3>
          <p>{design.description}</p>
          <div className="actions">
            <a className="button ghost" href={`/admin/preview/${design.id}`} target="_blank" rel="noopener">Preview<span aria-hidden="true">↗</span><span className="sr-only"> (tab baru)</span></a>
            <ActivateButton id={design.id} name={design.name} />
          </div>
        </div>
      </li>)}</ul> : <p className="empty">Belum ada desain lain. Desain baru masuk lewat kode.</p>}
    </section>
  </>;
}
