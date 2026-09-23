import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatFechaCorta } from "@/lib/format";
import type { Torneo } from "@/lib/types";

export function TournamentCard({
  torneo,
  className = "scroll-snap-item w-[280px] shrink-0 sm:w-[320px]",
}: {
  torneo: Torneo;
  className?: string;
}) {
  return (
    <Link
      href={`/torneos/${torneo.id}`}
      className={`group relative flex h-72 flex-col justify-end overflow-hidden rounded-2xl border border-accent/40 bg-gradient-to-br from-panel to-black p-5 transition-transform hover:-translate-y-1 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent-dark/30 via-transparent to-transparent" />
      <div className="relative">
        <Badge estado={torneo.estado} className="mb-3" />
        <p className="font-heading text-xs tracking-wide text-foreground-muted">
          {formatFechaCorta(torneo.fecha_inicio)} – {formatFechaCorta(torneo.fecha_fin)}
        </p>
        <h3 className="font-heading text-2xl leading-tight text-white">
          {torneo.nombre}
        </h3>
        <p className="mt-1 text-sm text-foreground-muted">{torneo.sede}</p>
      </div>
    </Link>
  );
}
