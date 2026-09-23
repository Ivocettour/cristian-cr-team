import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatFechaCorta } from "@/lib/format";
import { getTorneos } from "@/lib/queries/tournaments";

export default async function AdminDashboard() {
  const torneos = await getTorneos();
  const activos = torneos.filter((t) => t.estado === "en_curso");
  const proximos = torneos.filter((t) => t.estado === "proximo");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-white">Dashboard</h1>
        <p className="text-sm text-foreground-muted">Resumen de la actividad del club.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/torneos"
          className="min-h-11 rounded-2xl border border-accent/40 bg-gradient-to-br from-accent-dark/30 to-transparent p-5 font-heading text-white hover:border-accent"
        >
          + Nuevo torneo
        </Link>
        <Link
          href="/admin/jugadores"
          className="min-h-11 rounded-2xl border border-border-subtle bg-panel p-5 font-heading text-white hover:border-white/40"
        >
          + Nuevo jugador
        </Link>
        <Link
          href="/admin/categorias"
          className="min-h-11 rounded-2xl border border-border-subtle bg-panel p-5 font-heading text-white hover:border-white/40"
        >
          Gestionar categorías
        </Link>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-xl text-white">En curso</h2>
        {activos.length === 0 ? (
          <p className="text-sm text-foreground-muted">No hay torneos en curso.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activos.map((t) => (
              <TorneoRow key={t.id} torneo={t} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl text-white">Próximos</h2>
        {proximos.length === 0 ? (
          <p className="text-sm text-foreground-muted">No hay torneos próximos.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {proximos.map((t) => (
              <TorneoRow key={t.id} torneo={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TorneoRow({
  torneo,
}: {
  torneo: { id: string; nombre: string; sede: string; fecha_inicio: string; estado: "proximo" | "en_curso" | "finalizado" };
}) {
  return (
    <Card className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
      <div>
        <p className="font-heading text-lg text-white">{torneo.nombre}</p>
        <p className="text-xs text-foreground-muted">
          {torneo.sede} · {formatFechaCorta(torneo.fecha_inicio)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge estado={torneo.estado} />
        <Link
          href={`/admin/torneos/${torneo.id}`}
          className="min-h-11 rounded-full border border-white/20 px-4 py-2 font-heading text-xs tracking-wide text-white hover:border-white"
        >
          Administrar
        </Link>
      </div>
    </Card>
  );
}
