import { notFound } from "next/navigation";
import { TournamentDetail } from "@/components/public/TournamentDetail";
import { getTorneoCompleto } from "@/lib/queries/tournaments";
import { estaSiguiendoTorneo, getUsuarioActual } from "@/lib/queries/social";

export default async function TorneoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const torneo = await getTorneoCompleto(id);

  if (!torneo) notFound();

  const usuarioActual = await getUsuarioActual();
  const siguiendoInicial = usuarioActual
    ? await estaSiguiendoTorneo(usuarioActual.id, id)
    : false;

  return (
    <TournamentDetail
      torneo={torneo}
      usuarioId={usuarioActual?.id ?? null}
      siguiendoInicial={siguiendoInicial}
    />
  );
}
