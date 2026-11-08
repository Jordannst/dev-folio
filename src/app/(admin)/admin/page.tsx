import Image from "next/image";
import { cookies } from "next/headers";
import { missingAuthEnv } from "@/designs/admin-config";
import { readActiveDesign } from "@/designs/edge-config";
import { defaultDesign, designs, isDesignId } from "@/designs/registry";
import { SESSION_COOKIE, verifySession } from "@/designs/session";
import { LoginButton } from "./login-button";
import { Stage } from "./stage";

type Params = Record<string, string | string[] | undefined>;
const nameOf = (id: string) => designs.find(design => design.id === id)?.name;

// Only known values produce a message; anything else in the query is ignored.
function notice({ activated, error, status }: Params) {
  if (isDesignId(activated)) return `${nameOf(activated)} aktif. Perubahan menyebar dalam beberapa detik.`;
  if (error === "login") return "Login gagal. Coba lagi.";
  if (error === "denied") return "Akun ini tidak punya akses";
  if (error === "config") return "Login belum dikonfigurasi";
  if (error === "edge-config") return "Global Config (dulu Edge Config) belum terhubung ke project.";
  if (error === "save") return `Gagal menyimpan pilihan${typeof status === "string" && /^\d{3}$/.test(status) ? ` (status ${status})` : ""}. Desain aktif tidak berubah.`;
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
    <div className="admin-head">
      <h1>Katalog desain</h1>
      <form action="/api/auth/logout" method="post"><button type="submit" className="button">Logout</button></form>
    </div>
    {message && <p className="notice" role="status">{message}</p>}
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
  const active = await readActiveDesign();
  return <>
    {!active.ok && <p className="notice" role="status">Desain aktif tidak bisa dibaca; situs memakai default {nameOf(defaultDesign)}</p>}
    <ul className="catalog">{designs.map((design, index) => <li key={design.id} className="card" style={{ "--i": index } as React.CSSProperties}>
      <div className="thumb">
        <Image src={`/design-thumbnails/${design.id}.webp`} width={640} height={400} alt={`Tampilan ${design.name}`} sizes="(max-width: 639px) 100vw, 464px" />
      </div>
      <div className="card-body">
        <h2>{design.name}{active.id === design.id && <span className="badge">Aktif</span>}</h2>
        <p>{design.description}</p>
        <div className="actions">
          <a className="button" href={`/admin/preview/${design.id}`} target="_blank" rel="noopener">Preview</a>
          <form action="/api/admin/activate" method="post">
            <input type="hidden" name="id" value={design.id} />
            <button type="submit" className="button primary" disabled={active.id === design.id}>Aktifkan</button>
          </form>
        </div>
      </div>
    </li>)}</ul>
  </>;
}
