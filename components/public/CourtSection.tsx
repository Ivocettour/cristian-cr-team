import { Accordion } from "@/components/ui/Accordion";
import { MatchCard } from "@/components/public/MatchCard";
import type { PartidoCompleto } from "@/lib/types";

export function CourtSection({ partidos }: { partidos: PartidoCompleto[] }) {
  const porCancha = new Map<string, PartidoCompleto[]>();
  for (const partido of partidos) {
    const lista = porCancha.get(partido.cancha) ?? [];
    lista.push(partido);
    porCancha.set(partido.cancha, lista);
  }

  const canchas = Array.from(porCancha.keys()).sort();

  if (canchas.length === 0) {
    return <p className="px-4 text-foreground-muted sm:px-6">No hay partidos para mostrar.</p>;
  }

  return (
    <div className="flex flex-col gap-4 px-4 sm:px-6">
      {canchas.map((cancha) => {
        const partidosCancha = porCancha.get(cancha)!;
        const enVivo = partidosCancha.filter((p) => p.estado === "en_curso").length;
        return (
          <Accordion
            key={cancha}
            title={cancha}
            subtitle={enVivo > 0 ? `${enVivo} en vivo` : `${partidosCancha.length} partidos`}
          >
            {partidosCancha.map((partido) => (
              <MatchCard key={partido.id} partido={partido} />
            ))}
          </Accordion>
        );
      })}
    </div>
  );
}
