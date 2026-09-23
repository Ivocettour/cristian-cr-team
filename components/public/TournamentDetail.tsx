"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { LiveResultsTab } from "@/components/public/LiveResultsTab";
import { PlayerCard } from "@/components/public/PlayerCard";
import { EliminationBracketTab } from "@/components/public/EliminationBracketTab";
import { FollowTournamentButton } from "@/components/public/FollowTournamentButton";
import { calcularPosiciones } from "@/lib/standings";
import { formatFechaLarga } from "@/lib/format";
import type { PartidoCompleto, TorneoCompleto } from "@/lib/types";

const TABS: TabItem[] = [
  { id: "vivo", label: "Resultados en vivo" },
  { id: "zonas", label: "Zonas / Posiciones" },
  { id: "cuadro", label: "Cuadro eliminatorio" },
  { id: "jugadores", label: "Jugadores" },
  { id: "info", label: "Información" },
];

export function TournamentDetail({
  torneo,
  usuarioId,
  siguiendoInicial,
}: {
  torneo: TorneoCompleto;
  usuarioId: string | null;
  siguiendoInicial: boolean;
}) {
  const [categoriaId, setCategoriaId] = useState(
    torneo.torneo_categorias[0]?.id ?? ""
  );
  const [tab, setTab] = useState("vivo");

  const torneoCategoria = torneo.torneo_categorias.find((tc) => tc.id === categoriaId);

  const partidosIniciales = useMemo<PartidoCompleto[]>(() => {
    if (!torneoCategoria) return [];
    return [
      ...torneoCategoria.zonas.flatMap((z) => z.partidos),
      ...torneoCategoria.partidos_eliminatoria,
    ];
  }, [torneoCategoria]);

  const jugadores = useMemo(() => {
    if (!torneoCategoria) return [];
    const vistos = new Set<string>();
    const lista = [];
    for (const pareja of torneoCategoria.parejas) {
      for (const j of [pareja.jugador1, pareja.jugador2]) {
        if (!vistos.has(j.id)) {
          vistos.add(j.id);
          lista.push(j);
        }
      }
    }
    return lista;
  }, [torneoCategoria]);

  return (
    <div>
      <div className="border-b border-border-subtle bg-gradient-to-b from-panel to-background px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge estado={torneo.estado} className="mb-3" />
            <h1 className="font-heading text-3xl text-white sm:text-4xl">{torneo.nombre}</h1>
            <p className="mt-1 text-sm text-foreground-muted">
              {torneo.sede} · {formatFechaLarga(torneo.fecha_inicio)} – {formatFechaLarga(torneo.fecha_fin)}
            </p>
          </div>
          <FollowTournamentButton
            torneoId={torneo.id}
            usuarioId={usuarioId}
            siguiendoInicial={siguiendoInicial}
          />
        </div>
      </div>

      {torneo.torneo_categorias.length > 1 && (
        <div className="scroll-snap-x flex gap-2 overflow-x-auto px-4 py-4 sm:px-6">
          {torneo.torneo_categorias.map((tc) => (
            <button
              key={tc.id}
              onClick={() => setCategoriaId(tc.id)}
              className={`scroll-snap-item min-h-11 shrink-0 whitespace-nowrap rounded-full border px-5 font-heading text-sm tracking-wide ${
                tc.id === categoriaId
                  ? "border-accent bg-accent text-white"
                  : "border-white/20 text-foreground-muted hover:border-white/50"
              }`}
            >
              {tc.categoria.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2">
        <Tabs tabs={TABS} activeId={tab} onChange={setTab} />
      </div>

      {!torneoCategoria ? (
        <p className="px-4 py-10 text-foreground-muted sm:px-6">
          Esta categoría todavía no tiene fixture cargado.
        </p>
      ) : (
        <div className="py-6 sm:py-8">
          {tab === "vivo" && (
            <LiveResultsTab
              key={categoriaId}
              torneoCategoriaId={categoriaId}
              partidosIniciales={partidosIniciales}
            />
          )}

          {tab === "zonas" && (
            <div className="flex flex-col gap-6 px-4 sm:px-6">
              {torneoCategoria.zonas.length === 0 && (
                <p className="text-foreground-muted">Todavía no hay zonas armadas.</p>
              )}
              {torneoCategoria.zonas.map((zona) => {
                const posiciones = calcularPosiciones(zona);
                return (
                  <Card key={zona.id} className="overflow-hidden">
                    <div className="border-b border-border-subtle px-5 py-3">
                      <h3 className="font-heading text-lg text-white">{zona.nombre}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-foreground-muted">
                            <th className="px-5 py-2 font-heading font-normal">Pareja</th>
                            <th className="px-3 py-2 text-center font-heading font-normal">PJ</th>
                            <th className="px-3 py-2 text-center font-heading font-normal">PG</th>
                            <th className="px-3 py-2 text-center font-heading font-normal">PP</th>
                            <th className="px-3 py-2 text-center font-heading font-normal">Sets</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posiciones.map((fila) => {
                            const pareja = zona.parejas.find((p) => p.id === fila.parejaId);
                            if (!pareja) return null;
                            return (
                              <tr key={fila.parejaId} className="border-t border-border-subtle/60">
                                <td className="px-5 py-2.5 text-white">
                                  {pareja.jugador1.apellido} / {pareja.jugador2.apellido}
                                </td>
                                <td className="px-3 py-2.5 text-center text-foreground-muted">{fila.jugados}</td>
                                <td className="px-3 py-2.5 text-center text-white">{fila.ganados}</td>
                                <td className="px-3 py-2.5 text-center text-foreground-muted">{fila.perdidos}</td>
                                <td className="px-3 py-2.5 text-center text-foreground-muted">
                                  {fila.setsFavor}-{fila.setsContra}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {tab === "cuadro" && (
            <EliminationBracketTab
              key={categoriaId}
              torneoCategoriaId={categoriaId}
              partidosIniciales={torneoCategoria.partidos_eliminatoria}
            />
          )}

          {tab === "jugadores" && (
            <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
              {jugadores.length === 0 && (
                <p className="text-foreground-muted">Todavía no hay jugadores cargados.</p>
              )}
              {jugadores.map((j) => (
                <PlayerCard key={j.id} jugador={j} categoriaNombre={torneoCategoria.categoria.nombre} />
              ))}
            </div>
          )}

          {tab === "info" && (
            <div className="px-4 sm:px-6">
              <Card className="max-w-xl p-6">
                <dl className="flex flex-col gap-4 text-sm">
                  <div>
                    <dt className="font-heading text-xs tracking-wide text-foreground-muted">Sede</dt>
                    <dd className="text-white">{torneo.sede}</dd>
                  </div>
                  <div>
                    <dt className="font-heading text-xs tracking-wide text-foreground-muted">Fechas</dt>
                    <dd className="text-white">
                      {formatFechaLarga(torneo.fecha_inicio)} – {formatFechaLarga(torneo.fecha_fin)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-heading text-xs tracking-wide text-foreground-muted">Categorías</dt>
                    <dd className="text-white">
                      {torneo.torneo_categorias.map((tc) => tc.categoria.nombre).join(", ")}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-heading text-xs tracking-wide text-foreground-muted">Formato</dt>
                    <dd className="text-white">Zonas + cuadro eliminatorio</dd>
                  </div>
                </dl>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
