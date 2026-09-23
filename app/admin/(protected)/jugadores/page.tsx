import { Card } from "@/components/ui/Card";
import { getCategorias, getJugadores } from "@/lib/queries/players";
import { NewJugadorForm } from "./NewJugadorForm";
import { JugadorRow } from "./JugadorRow";

export default async function AdminJugadoresPage() {
  const [jugadores, categorias] = await Promise.all([getJugadores(), getCategorias()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-white">Jugadores</h1>
        <p className="text-sm text-foreground-muted">
          Alta y edición de jugadores, incluida su categoría actual.
        </p>
      </div>

      <Card className="p-5">
        <NewJugadorForm categorias={categorias} />
      </Card>

      <div className="flex flex-col gap-2">
        {jugadores.map((j) => (
          <JugadorRow key={j.id} jugador={j} categorias={categorias} />
        ))}
      </div>
    </div>
  );
}
