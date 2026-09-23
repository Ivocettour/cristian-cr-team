import { notFound } from "next/navigation";
import { getTorneoCompleto } from "@/lib/queries/tournaments";
import { LiveMatchCard } from "./LiveMatchCard";

export default async function VivoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { id } = await params;
  const { categoria } = await searchParams;
  const torneo = await getTorneoCompleto(id);

  if (!torneo) notFound();

  const torneoCategoria =
    torneo.torneo_categorias.find((tc) => tc.id === categoria) ?? torneo.torneo_categorias[0];

  if (!torneoCategoria) {
    return <p className="text-foreground-muted">Este torneo todavía no tiene categorías.</p>;
  }

  const partidos = [
    ...torneoCategoria.zonas.flatMap((z) => z.partidos),
    ...torneoCategoria.partidos_eliminatoria,
  ].filter((p) => p.estado !== "finalizado");

  const finalizados = [
    ...torneoCategoria.zonas.flatMap((z) => z.partidos),
    ...torneoCategoria.partidos_eliminatoria,
  ].filter((p) => p.estado === "finalizado");

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div>
        <h1 className="font-heading text-3xl text-white">
          Carga en vivo <span className="text-accent">· {torneoCategoria.categoria.nombre}</span>
        </h1>
        <p className="text-sm text-foreground-muted">{torneo.nombre}</p>
      </div>

      {torneo.torneo_categorias.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {torneo.torneo_categorias.map((tc) => (
            <a
              key={tc.id}
              href={`?categoria=${tc.id}`}
              className={`min-h-11 rounded-full border px-4 py-2 font-heading text-xs tracking-wide ${
                tc.id === torneoCategoria.id
                  ? "border-accent bg-accent text-white"
                  : "border-white/20 text-foreground-muted"
              }`}
            >
              {tc.categoria.nombre}
            </a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {partidos.length === 0 && (
          <p className="text-foreground-muted">No hay partidos pendientes o en curso.</p>
        )}
        {partidos.map((p) => (
          <LiveMatchCard key={p.id} partido={p} torneoId={torneo.id} />
        ))}
      </div>

      {finalizados.length > 0 && (
        <details className="rounded-2xl border border-border-subtle p-4">
          <summary className="cursor-pointer font-heading text-sm tracking-wide text-foreground-muted">
            Partidos finalizados ({finalizados.length})
          </summary>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {finalizados.map((p) => (
              <LiveMatchCard key={p.id} partido={p} torneoId={torneo.id} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
