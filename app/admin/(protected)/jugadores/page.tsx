import { Card } from "@/components/ui/Card";
import { paisToFlag, nombreCompleto } from "@/lib/format";
import { getCategorias, getJugadores } from "@/lib/queries/players";
import { NewJugadorForm } from "./NewJugadorForm";
import { CategoriaSelect } from "./CategoriaSelect";

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
          <Card key={j.id} className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
            <span className="font-heading text-white">
              {paisToFlag(j.pais)} {nombreCompleto(j)}
            </span>
            <CategoriaSelect
              jugadorId={j.id}
              categoriaActualId={j.categoria_actual_id}
              categorias={categorias}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
