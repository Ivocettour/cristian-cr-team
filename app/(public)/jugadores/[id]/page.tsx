import { notFound } from "next/navigation";
import { MatchCard } from "@/components/public/MatchCard";
import { paisToFlag, nombreCompleto } from "@/lib/format";
import { getPerfilJugador } from "@/lib/queries/players";

export default async function JugadorPerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const perfil = await getPerfilJugador(id);

  if (!perfil) notFound();

  const { jugador, categoria, partidos } = perfil;
  const iniciales = `${jugador.nombre[0] ?? ""}${jugador.apellido[0] ?? ""}`;

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 border-b border-border-subtle pb-8 text-center sm:flex-row sm:text-left">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-dark to-accent font-heading text-3xl text-white">
            {iniciales}
          </div>
          <div>
            <p className="text-sm text-foreground-muted">
              {paisToFlag(jugador.pais)} {jugador.pais ?? "Sin país"}
            </p>
            <h1 className="font-heading text-3xl text-white sm:text-4xl">
              {nombreCompleto(jugador)}
            </h1>
            {categoria && (
              <p className="mt-1 font-heading text-sm tracking-wide text-accent-light">
                Categoría {categoria.nombre}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-heading text-xl text-white">Historial de partidos</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border-subtle">
            {partidos.length === 0 ? (
              <p className="p-6 text-foreground-muted">
                Todavía no jugó partidos registrados.
              </p>
            ) : (
              partidos.map((p) => <MatchCard key={p.id} partido={p} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
