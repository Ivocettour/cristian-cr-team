"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { marcarNotificacionesLeidas } from "@/lib/actions/cuenta";
import type { Notificacion } from "@/lib/types";

function formatRelativo(fechaIso: string): string {
  const diffMs = Date.now() - new Date(fechaIso).getTime();
  const minutos = Math.floor(diffMs / 60000);
  if (minutos < 1) return "ahora";
  if (minutos < 60) return `hace ${minutos}m`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas}h`;
  return `hace ${Math.floor(horas / 24)}d`;
}

export function NotificationBell({
  usuarioId,
  notificacionesIniciales,
}: {
  usuarioId: string;
  notificacionesIniciales: Notificacion[];
}) {
  const [notificaciones, setNotificaciones] = useState(notificacionesIniciales);
  const [open, setOpen] = useState(false);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`notificaciones_${usuarioId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificacion",
          filter: `usuario_id=eq.${usuarioId}`,
        },
        (payload) => {
          setNotificaciones((prev) => [payload.new as Notificacion, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [usuarioId]);

  function abrir() {
    setOpen((v) => !v);
    if (!open && noLeidas > 0) {
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      marcarNotificacionesLeidas();
    }
  }

  return (
    <div className="relative">
      <button
        aria-label="Notificaciones"
        onClick={abrir}
        className="relative flex h-11 w-11 items-center justify-center text-white"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
          />
        </svg>
        {noLeidas > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            aria-label="Cerrar notificaciones"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-border-subtle bg-panel shadow-xl">
            <div className="border-b border-border-subtle px-4 py-3">
              <span className="font-heading text-sm tracking-wide text-white">NOTIFICACIONES</span>
            </div>
            {notificaciones.length === 0 ? (
              <p className="p-4 text-sm text-foreground-muted">Todavía no tenés notificaciones.</p>
            ) : (
              notificaciones.map((n) => (
                <Link
                  key={n.id}
                  href={n.url ?? "#"}
                  onClick={() => setOpen(false)}
                  className="block border-b border-border-subtle/60 px-4 py-3 last:border-b-0 hover:bg-white/5"
                >
                  <p className="text-sm text-white">{n.titulo}</p>
                  <p className="text-xs text-foreground-muted">{n.cuerpo}</p>
                  <p className="mt-1 text-[10px] text-foreground-muted">{formatRelativo(n.creado_at)}</p>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
