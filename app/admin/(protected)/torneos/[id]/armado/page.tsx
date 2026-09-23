import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { MatchCard } from "@/components/public/MatchCard";
import { getTorneoCompleto } from "@/lib/queries/tournaments";
import { getJugadores } from "@/lib/queries/players";
import { NewParejaForm } from "./NewParejaForm";
import { NewZonaForm } from "./NewZonaForm";
import { ZonaParejaToggle } from "./ZonaParejaToggle";
import { NewPartidoEliminatoriaForm } from "./NewPartidoEliminatoriaForm";

export default async function ArmadoPage({
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

  const torneoCategoria = torneo.torneo_categorias.find((tc) => tc.id === categoria) ?? torneo.torneo_categorias[0];

  if (!torneoCategoria) {
    return (
      <p className="text-foreground-muted">
        Este torneo todavía no tiene categorías. Agregá una desde la página del torneo.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-white">
          {torneo.nombre} <span className="text-accent">· {torneoCategoria.categoria.nombre}</span>
        </h1>
        <p className="text-sm text-foreground-muted">Armado de parejas, zonas y cuadro eliminatorio.</p>
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
            <span
              key={p.id}
              className="rounded-full border border-white/10 bg-panel px-3 py-2 text-sm text-white"
            >
              {p.jugador1.nombre} {p.jugador1.apellido} / {p.jugador2.nombre} {p.jugador2.apellido}
            </span>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl text-white">Zonas</h2>
        <Card className="p-5">
          <NewZonaForm torneoId={torneo.id} torneoCategoriaId={torneoCategoria.id} />
        </Card>
        <div className="flex flex-col gap-3">
          {torneoCategoria.zonas.map((zona) => (
            <Card key={zona.id} className="p-5">
              <h3 className="mb-3 font-heading text-lg text-white">{zona.nombre}</h3>
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
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl text-white">Cuadro eliminatorio</h2>
        <Card className="p-5">
          <NewPartidoEliminatoriaForm
            torneoId={torneo.id}
            torneoCategoriaId={torneoCategoria.id}
            parejas={torneoCategoria.parejas}
          />
        </Card>
        <div className="overflow-hidden rounded-2xl border border-border-subtle">
          {torneoCategoria.partidos_eliminatoria.length === 0 ? (
            <p className="p-5 text-foreground-muted">Todavía no hay partidos de eliminatoria.</p>
          ) : (
            torneoCategoria.partidos_eliminatoria.map((p) => <MatchCard key={p.id} partido={p} />)
          )}
        </div>
      </section>
    </div>
  );
}
