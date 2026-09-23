import { Card } from "@/components/ui/Card";
import { getCategorias } from "@/lib/queries/players";
import { eliminarCategoria } from "@/lib/actions/categorias";
import { NewCategoriaForm } from "./NewCategoriaForm";

export default async function AdminCategoriasPage() {
  const categorias = await getCategorias();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-white">Categorías</h1>
        <p className="text-sm text-foreground-muted">
          Categorías propias de la organización (ej. 1ra, 5ta, Damas A).
        </p>
      </div>

      <Card className="p-5">
        <NewCategoriaForm />
      </Card>

      <div className="flex flex-col gap-2">
        {categorias.map((c) => (
          <Card key={c.id} className="flex items-center justify-between p-4">
            <span className="font-heading text-white">{c.nombre}</span>
            <form action={eliminarCategoria.bind(null, c.id)}>
              <button className="min-h-11 rounded-full border border-white/20 px-4 font-heading text-xs tracking-wide text-foreground-muted hover:border-white hover:text-white">
                Eliminar
              </button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
