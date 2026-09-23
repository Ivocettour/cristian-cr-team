import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatFechaCorta } from "@/lib/format";
import { getTorneos } from "@/lib/queries/tournaments";
import { NewTournamentForm } from "./NewTournamentForm";

export default async function AdminTorneosPage() {
  const torneos = await getTorneos();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-white">Torneos</h1>
        <p className="text-sm text-foreground-muted">CRUD de torneos de la organización.</p>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-heading text-lg text-white">Nuevo torneo</h2>
        <NewTournamentForm />
      </Card>

      <div className="flex flex-col gap-3">
        {torneos.map((t) => (
          <Card key={t.id} className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-heading text-lg text-white">{t.nombre}</p>
              <p className="text-xs text-foreground-muted">
                {t.sede} · {formatFechaCorta(t.fecha_inicio)} – {formatFechaCorta(t.fecha_fin)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge estado={t.estado} />
              <Link
                href={`/admin/torneos/${t.id}`}
                className="min-h-11 rounded-full border border-white/20 px-4 py-2 font-heading text-xs tracking-wide text-white hover:border-white"
              >
                Administrar
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
