"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/admin/FormError";
import { CategoriaSelect } from "./CategoriaSelect";
import { editarJugador, eliminarJugador } from "@/lib/actions/jugadores";
import { paisToFlag, nombreCompleto } from "@/lib/format";
import type { Categoria, Jugador } from "@/lib/types";

const inputClass =
  "min-h-11 w-full rounded-lg border border-white/20 bg-background px-3 text-sm text-white outline-none focus:border-accent";

export function JugadorRow({
  jugador,
  categorias,
}: {
  jugador: Jugador;
  categorias: Categoria[];
}) {
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [borrando, setBorrando] = useState(false);

  async function handleSubmit(formData: FormData) {
    setGuardando(true);
    formData.set("jugador_id", jugador.id);
    const res = await editarJugador({ error: null }, formData);
    setGuardando(false);
    if (res.error) {
      setError(res.error);
    } else {
      setError(null);
      setEditando(false);
    }
  }

  async function handleBorrar() {
    if (!confirm(`¿Borrar a ${nombreCompleto(jugador)}?`)) return;
    setBorrando(true);
    const res = await eliminarJugador(jugador.id);
    setBorrando(false);
    if (res.error) alert(res.error);
  }

  if (editando) {
    return (
      <Card className="p-4">
        <form action={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input name="nombre" defaultValue={jugador.nombre} required className={inputClass} />
            <input name="apellido" defaultValue={jugador.apellido} required className={inputClass} />
            <input
              name="pais"
              defaultValue={jugador.pais ?? ""}
              maxLength={2}
              placeholder="País"
              className={inputClass}
            />
          </div>
          <FormError message={error} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={guardando}
              className="min-h-11 rounded-full bg-accent px-4 font-heading text-xs tracking-wide text-white disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="min-h-11 rounded-full border border-white/20 px-4 font-heading text-xs tracking-wide text-foreground-muted hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
      <span className="font-heading text-white">
        {paisToFlag(jugador.pais)} {nombreCompleto(jugador)}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <CategoriaSelect
          jugadorId={jugador.id}
          categoriaActualId={jugador.categoria_actual_id}
          categorias={categorias}
        />
        <button
          onClick={() => setEditando(true)}
          className="min-h-11 rounded-full border border-white/20 px-3 font-heading text-xs tracking-wide text-foreground-muted hover:border-white hover:text-white"
        >
          Editar
        </button>
        <button
          onClick={handleBorrar}
          disabled={borrando}
          className="min-h-11 rounded-full border border-white/20 px-3 font-heading text-xs tracking-wide text-foreground-muted hover:border-white hover:text-white disabled:opacity-50"
        >
          Borrar
        </button>
      </div>
    </Card>
  );
}
