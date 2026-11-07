import Image from "next/image";
import { cookies } from "next/headers";
import { missingAuthEnv } from "@/designs/admin-config";
import { readActiveDesign } from "@/designs/edge-config";
import { defaultDesign, designs, isDesignId } from "@/designs/registry";
import { SESSION_COOKIE, verifySession } from "@/designs/session";
import { activateDesign } from "./actions";

type Params = Record<string, string | string[] | undefined>;
const nameOf = (id: string) => designs.find(design => design.id === id)?.name;

// Only known values produce a message; anything else in the query is ignored.
function notice({ activated, error, status }: Params) {
  if (isDesignId(activated)) return `${nameOf(activated)} aktif. Perubahan menyebar dalam beberapa detik.`;
  if (error === "login") return "Login gagal. Coba lagi.";
  if (error === "denied") return "Akun ini tidak punya akses";
  if (error === "config") return "Login belum dikonfigurasi";
  if (error === "edge-config") return "Edge Config belum terhubung ke project.";
  if (error === "save") return `Gagal menyimpan pilihan${typeof status === "string" && /^\d{3}$/.test(status) ? ` (status ${status})` : ""}. Desain aktif tidak berubah.`;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<Params> }) {
  const message = notice(await searchParams);
  const missing = missingAuthEnv();
  const signedIn = !missing.length && await verifySession((await cookies()).get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET, process.env.ADMIN_GITHUB_ID);
  return <main className="admin">
    <div className="admin-head">
      <h1>Katalog desain</h1>
      {signedIn && <form action="/api/auth/logout" method="post"><button type="submit" className="button">Logout</button></form>}
    </div>
    {message && <p className="notice" role="status">{message}</p>}
    {missing.length ? <section className="notice">
      <h2>Login belum dikonfigurasi</h2>
      <p>Env yang belum diisi:</p>
      <ul>{missing.map(name => <li key={name}><code>{name}</code></li>)}</ul>
    </section> : signedIn ? <Catalog /> : <a className="button primary" href="/api/auth/login">Login dengan GitHub</a>}
  </main>;
}

async function Catalog() {
  const active = await readActiveDesign();
  return <>
    {!active.ok && <p className="notice" role="status">Desain aktif tidak bisa dibaca; situs memakai default {nameOf(defaultDesign)}</p>}
    <ul className="catalog">{designs.map(design => <li key={design.id} className="card">
      <Image src={`/design-thumbnails/${design.id}.webp`} width={640} height={400} alt={`Tampilan ${design.name}`} sizes="(max-width: 639px) 100vw, 464px" />
      <div className="card-body">
        <h2>{design.name}{active.id === design.id && <span className="badge">Aktif</span>}</h2>
        <p>{design.description}</p>
        <div className="actions">
          <a className="button" href={`/admin/preview/${design.id}`} target="_blank" rel="noopener">Preview</a>
          <form action={activateDesign}>
            <input type="hidden" name="id" value={design.id} />
            <button type="submit" className="button primary" disabled={active.id === design.id}>Aktifkan</button>
          </form>
        </div>
      </div>
    </li>)}</ul>
  </>;
}
