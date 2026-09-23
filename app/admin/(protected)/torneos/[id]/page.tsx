import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatFechaLarga } from "@/lib/format";
import { getTorneoCompleto } from "@/lib/queries/tournaments";
import { getCategorias } from "@/lib/queries/players";
import { EstadoTorneoButtons } from "./EstadoTorneoButtons";
import { NewSubtorneoForm } from "./NewSubtorneoForm";

export default async function AdminTorneoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [torneo, categorias] = await Promise.all([getTorneoCompleto(id), getCategorias()]);

  if (!torneo) notFound();

  const categoriasDisponibles = categorias.filter(
    (c) => !torneo.torneo_categorias.some((tc) => tc.categoria_id === c.id)
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-white">{torneo.nombre}</h1>
        <p className="text-sm text-foreground-muted">
          {torneo.sede} · {formatFechaLarga(torneo.fecha_inicio)} – {formatFechaLarga(torneo.fecha_fin)}
        </p>
      </div>

      <div>
        <p className="mb-2 font-heading text-xs tracking-wide text-foreground-muted">Estado</p>
        <EstadoTorneoButtons torneoId={torneo.id} estadoActual={torneo.estado} />
      </div>

      <section>
        <h2 className="mb-3 font-heading text-xl text-white">Categorías / subtorneos</h2>
        <div className="flex flex-col gap-3">
          {torneo.torneo_categorias.length === 0 && (
            <p className="text-sm text-foreground-muted">Todavía no agregaste categorías.</p>
          )}
          {torneo.torneo_categorias.map((tc) => (
            <Card key={tc.id} className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-heading text-lg text-white">{tc.categoria.nombre}</p>
                <p className="text-xs text-foreground-muted">
                  {tc.parejas.length} parejas · {tc.zonas.length} zonas
                </p>
              </div>
              <Link
                href={`/admin/torneos/${torneo.id}/partidos?categoria=${tc.id}`}
                className="min-h-11 rounded-full bg-accent px-4 py-2 font-heading text-xs tracking-wide text-white hover:bg-accent-light"
              >
                Gestionar partidos
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {categoriasDisponibles.length > 0 && (
        <Card className="p-5">
          <NewSubtorneoForm torneoId={torneo.id} categorias={categoriasDisponibles} />
        </Card>
      )}
    </div>
  );
}
