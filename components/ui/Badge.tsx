import type { EstadoPartido, EstadoTorneo } from "@/lib/types";

type Estado = EstadoTorneo | EstadoPartido;

const labels: Record<Estado, string> = {
  proximo: "Próximo",
  en_curso: "En vivo",
  finalizado: "Completado",
  pendiente: "Pendiente",
};

const styles: Record<Estado, string> = {
  proximo: "bg-white/10 text-white border-white/20",
  en_curso: "bg-win/15 text-win border-win/40",
  finalizado: "bg-white/5 text-foreground-muted border-white/10",
  pendiente: "bg-white/10 text-foreground-muted border-white/20",
};

export function Badge({ estado, className = "" }: { estado: Estado; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-heading text-xs tracking-wide ${styles[estado]} ${className}`}
    >
      {estado === "en_curso" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-win" />
      )}
      {labels[estado]}
    </span>
  );
}
