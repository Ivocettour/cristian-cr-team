import Link from "next/link";
import { SupabaseBanner } from "@/components/admin/SupabaseBanner";
import { logout } from "@/lib/actions/auth";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/torneos", label: "Torneos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/jugadores", label: "Jugadores" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SupabaseBanner />
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-subtle bg-black/80 px-4 backdrop-blur sm:px-6">
        <Link href="/admin" className="font-heading text-lg text-white">
          PANEL ADMIN <span className="text-accent">·</span> CR&LB TEAM
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="hidden font-heading text-xs tracking-wide text-foreground-muted hover:text-white sm:inline">
            Ver sitio público
          </Link>
          <form action={logout}>
            <button className="min-h-11 rounded-full border border-white/20 px-4 font-heading text-xs tracking-wide text-white hover:border-white">
              Salir
            </button>
          </form>
        </div>
      </header>

      <div className="scroll-snap-x flex gap-1 overflow-x-auto border-b border-border-subtle px-4 lg:hidden">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="scroll-snap-item flex min-h-11 shrink-0 items-center whitespace-nowrap px-3 font-heading text-sm tracking-wide text-foreground-muted hover:text-white"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8 sm:px-6">
        <nav className="hidden w-48 shrink-0 flex-col gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2.5 font-heading text-sm tracking-wide text-foreground-muted hover:bg-panel hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
