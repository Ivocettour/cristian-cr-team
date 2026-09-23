"use client";

import { useState, useTransition } from "react";
import { suscribirseAPush } from "@/lib/push-client";
import { guardarPushSubscription } from "@/lib/actions/cuenta";

type Estado = "idle" | "activando" | "activo" | "rechazado" | "no-soportado";

export function PushOptIn() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [isPending, startTransition] = useTransition();

  async function activar() {
    setEstado("activando");
    const suscripcion = await suscribirseAPush();

    if (!suscripcion) {
      const soportado = "serviceWorker" in navigator && "PushManager" in window;
      setEstado(soportado ? "rechazado" : "no-soportado");
      return;
    }

    const json = suscripcion.toJSON();
    startTransition(() => {
      guardarPushSubscription({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
    });
    setEstado("activo");
  }

  if (estado === "activo") {
    return <p className="text-sm text-win">Notificaciones push activadas en este dispositivo.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={activar}
        disabled={estado === "activando" || isPending}
        className="min-h-11 w-fit rounded-full border border-white/30 px-4 py-2 font-heading text-xs tracking-wide text-white hover:border-white disabled:opacity-50"
      >
        {estado === "activando" ? "Activando…" : "Activar notificaciones push"}
      </button>
      {estado === "rechazado" && (
        <p className="text-xs text-foreground-muted">
          No diste permiso de notificaciones. Podés habilitarlo desde la configuración del navegador.
        </p>
      )}
      {estado === "no-soportado" && (
        <p className="text-xs text-foreground-muted">
          Tu navegador no soporta notificaciones push.
        </p>
      )}
    </div>
  );
}
