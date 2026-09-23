"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { buscarGlobal, type ResultadoBusqueda } from "@/lib/actions/search";

const SIN_RESULTADOS: ResultadoBusqueda = { torneos: [], jugadores: [] };

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda>(SIN_RESULTADOS);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function onChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResultados(SIN_RESULTADOS);
      return;
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await buscarGlobal(value);
        setResultados(res);
      });
    }, 300);
  }

  function cerrar() {
    setOpen(false);
    setQuery("");
    setResultados(SIN_RESULTADOS);
  }

  const sinResultados =
    query.trim().length >= 2 && !isPending && resultados.torneos.length === 0 && resultados.jugadores.length === 0;

  return (
    <div className="relative">
      <button
        aria-label="Buscar"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center text-white"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
      </button>

      {open && (
        <>
          <button
            aria-label="Cerrar búsqueda"
            className="fixed inset-0 z-40 cursor-default"
            onClick={cerrar}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-2xl border border-border-subtle bg-panel shadow-xl">
            <div className="border-b border-border-subtle p-3">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Buscar torneos o jugadores…"
                className="min-h-11 w-full rounded-lg border border-white/20 bg-background px-3 text-sm text-white outline-none focus:border-accent"
              />
            </div>

            <div className="max-h-80 overflow-y-auto">
              {query.trim().length < 2 && (
                <p className="p-4 text-sm text-foreground-muted">Escribí al menos 2 letras.</p>
              )}
              {sinResultados && (
                <p className="p-4 text-sm text-foreground-muted">No se encontraron resultados.</p>
              )}

              {resultados.torneos.length > 0 && (
                <div>
                  <p className="px-4 pt-3 font-heading text-xs tracking-wide text-foreground-muted">
                    TORNEOS
                  </p>
                  {resultados.torneos.map((t) => (
                    <Link
                      key={t.id}
                      href={`/torneos/${t.id}`}
                      onClick={cerrar}
                      className="block px-4 py-2.5 text-sm text-white hover:bg-white/5"
                    >
                      {t.nombre}
                    </Link>
                  ))}
                </div>
              )}

              {resultados.jugadores.length > 0 && (
                <div>
                  <p className="px-4 pt-3 font-heading text-xs tracking-wide text-foreground-muted">
                    JUGADORES
                  </p>
                  {resultados.jugadores.map((j) => (
                    <Link
                      key={j.id}
                      href={`/jugadores/${j.id}`}
                      onClick={cerrar}
                      className="block px-4 py-2.5 text-sm text-white hover:bg-white/5"
                    >
                      {j.nombre} {j.apellido}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
