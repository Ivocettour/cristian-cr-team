import { cambiarEstadoTorneo } from "@/lib/actions/torneos";
import type { EstadoTorneo } from "@/lib/types";

const OPCIONES: { estado: EstadoTorneo; label: string }[] = [
  { estado: "proximo", label: "Próximo" },
  { estado: "en_curso", label: "En vivo" },
  { estado: "finalizado", label: "Completado" },
];

export function EstadoTorneoButtons({
  torneoId,
  estadoActual,
}: {
  torneoId: string;
  estadoActual: EstadoTorneo;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPCIONES.map((op) => (
        <form key={op.estado} action={cambiarEstadoTorneo.bind(null, torneoId, op.estado)}>
          <button
            type="submit"
            disabled={op.estado === estadoActual}
            className={`min-h-11 rounded-full border px-4 font-heading text-xs tracking-wide ${
              op.estado === estadoActual
                ? "border-accent bg-accent text-white"
                : "border-white/20 text-foreground-muted hover:border-white/50"
            }`}
          >
            {op.label}
          </button>
        </form>
      ))}
    </div>
  );
}
