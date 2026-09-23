import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { CollapsibleForm } from "@/components/admin/CollapsibleForm";
import { getTorneoCompleto } from "@/lib/queries/tournaments";
import { getJugadores } from "@/lib/queries/players";
import { NewParejaForm } from "./NewParejaForm";
import { NewZonaForm } from "./NewZonaForm";
import { ZonaParejaToggle } from "./ZonaParejaToggle";
import { NewPartidoZonaForm } from "./NewPartidoZonaForm";
import { NewPartidoEliminatoriaForm } from "./NewPartidoEliminatoriaForm";
import { MatchRow } from "./MatchRow";
import { BorrarParejaButton } from "./BorrarParejaButton";

export default async function PartidosPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { id } = await params;
  const { categoria } = await searchParams;
  const [torneo, jugadores] = await Promise.all([getTorneoCompleto(id), getJugadores()]);

  if (!torneo) notFound();

  const torneoCategoria =
    torneo.torneo_categorias.find((tc) => tc.id === categoria) ?? torneo.torneo_categorias[0];

  if (!torneoCategoria) {
    return (
      <p className="text-foreground-muted">
        Este torneo todavía no tiene categorías. Agregá una desde la página del torneo.
      </p>
    );
  }

  const idsUsadosComoFeeder = new Set(
    torneoCategoria.partidos_eliminatoria.flatMap((p) =>
      [p.feeder_a_partido_id, p.feeder_b_partido_id].filter((id): id is string => Boolean(id))
    )
  );
  const partidosDisponiblesComoFeeder = torneoCategoria.partidos_eliminatoria.filter(
    (p) => !idsUsadosComoFeeder.has(p.id)
  );

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div>
        <h1 className="font-heading text-3xl text-white">
          {torneo.nombre} <span className="text-accent">· {torneoCategoria.categoria.nombre}</span>
        </h1>
        <p className="text-sm text-foreground-muted">
          Parejas, zonas, cuadro eliminatorio y resultados — todo en un solo lugar.
        </p>
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

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl text-white">Parejas</h2>
        <Card className="p-5">
          <NewParejaForm
            torneoId={torneo.id}
            torneoCategoriaId={torneoCategoria.id}
            jugadores={jugadores}
          />
        </Card>
        <div className="flex flex-wrap gap-2">
          {torneoCategoria.parejas.map((p) => (
            <BorrarParejaButton
              key={p.id}
              parejaId={p.id}
              torneoId={torneo.id}
              label={`${p.jugador1.nombre} ${p.jugador1.apellido} / ${p.jugador2.nombre} ${p.jugador2.apellido}`}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl text-white">Zonas</h2>
          <CollapsibleForm label="Nueva zona">
            <NewZonaForm torneoId={torneo.id} torneoCategoriaId={torneoCategoria.id} />
          </CollapsibleForm>
        </div>

        <div className="flex flex-col gap-4">
          {torneoCategoria.zonas.length === 0 && (
            <p className="text-sm text-foreground-muted">Todavía no hay zonas armadas.</p>
          )}
          {torneoCategoria.zonas.map((zona) => {
            const jugados = zona.partidos.filter((p) => p.estado === "finalizado").length;
            return (
              <Card key={zona.id} className="flex flex-col gap-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-heading text-lg text-white">{zona.nombre}</h3>
                  {zona.partidos.length > 0 && (
                    <span className="text-xs text-foreground-muted">
                      {jugados}/{zona.partidos.length} partidos jugados
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {torneoCategoria.parejas.map((p) => (
                    <ZonaParejaToggle
                      key={p.id}
                      zonaId={zona.id}
                      parejaId={p.id}
                      torneoId={torneo.id}
                      asignada={zona.parejas.some((zp) => zp.id === p.id)}
                      label={`${p.jugador1.apellido} / ${p.jugador2.apellido}`}
                    />
                  ))}
                </div>

                {zona.partidos.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-border-subtle">
                    {zona.partidos.map((p) => (
                      <MatchRow key={p.id} partido={p} torneoId={torneo.id} />
                    ))}
                  </div>
                )}

                <CollapsibleForm label="Nuevo partido">
                  <NewPartidoZonaForm
                    torneoId={torneo.id}
                    torneoCategoriaId={torneoCategoria.id}
                    zonaId={zona.id}
                    parejas={zona.parejas}
                  />
                </CollapsibleForm>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl text-white">Cuadro eliminatorio</h2>
        {torneoCategoria.partidos_eliminatoria.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-border-subtle">
            {torneoCategoria.partidos_eliminatoria.map((p) => (
              <MatchRow key={p.id} partido={p} torneoId={torneo.id} />
            ))}
          </div>
        )}
        <CollapsibleForm label="Nuevo partido de eliminatoria">
          <NewPartidoEliminatoriaForm
            torneoId={torneo.id}
            torneoCategoriaId={torneoCategoria.id}
            parejas={torneoCategoria.parejas}
            partidosDisponibles={partidosDisponiblesComoFeeder}
          />
        </CollapsibleForm>
      </section>
    </div>
  );
}
