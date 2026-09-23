"use client";

import Link from "next/link";
import { useState } from "react";
import { Countdown } from "@/components/ui/Countdown";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/torneos", label: "Torneos" },
  { href: "/jugadores", label: "Jugadores" },
];

export function Header({
  proximoTorneo,
}: {
  proximoTorneo: { nombre: string; fecha_inicio: string } | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {proximoTorneo && (
        <div className="border-b border-border-subtle bg-panel px-4 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1 sm:flex-row sm:justify-between">
            <span className="hidden font-heading text-xs tracking-wide text-white sm:inline">
              Próximo torneo: {proximoTorneo.nombre}
            </span>
            <Countdown target={proximoTorneo.fecha_inicio} label={proximoTorneo.nombre} />
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-border-subtle bg-black/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-heading text-xl text-white">
            CLUB PÁDEL <span className="text-accent">DEL SUR</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-heading text-sm tracking-wide text-white/90 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden font-heading text-xs tracking-wide text-foreground-muted hover:text-white lg:inline"
            >
              Panel admin
            </Link>
            <button
              aria-label="Abrir menú"
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 items-center justify-center text-white lg:hidden"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="font-heading text-xl text-white">MENÚ</span>
            <button
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
              className="flex h-11 w-11 items-center justify-center text-white"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-2 px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-4 font-heading text-3xl text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="py-4 font-heading text-xl text-foreground-muted"
            >
              Panel admin
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
