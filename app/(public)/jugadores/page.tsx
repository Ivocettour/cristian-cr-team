import { PlayerCard } from "@/components/public/PlayerCard";
import { getCategorias, getJugadores } from "@/lib/queries/players";

export const metadata = { title: "Jugadores — Club Pádel del Sur" };

export default async function JugadoresPage() {
  const [jugadores, categorias] = await Promise.all([getJugadores(), getCategorias()]);
  const categoriaPorId = new Map(categorias.map((c) => [c.id, c.nombre]));

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <h1 className="px-4 font-heading text-3xl text-white sm:px-6 sm:text-4xl">
          Jugadores
        </h1>
        <div className="mt-6 grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {jugadores.map((j) => (
            <PlayerCard
              key={j.id}
              jugador={j}
              categoriaNombre={
                j.categoria_actual_id ? categoriaPorId.get(j.categoria_actual_id) : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
