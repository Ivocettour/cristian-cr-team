import { notFound } from "next/navigation";
import { TournamentDetail } from "@/components/public/TournamentDetail";
import { getTorneoCompleto } from "@/lib/queries/tournaments";

export default async function TorneoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const torneo = await getTorneoCompleto(id);

  if (!torneo) notFound();

  return <TournamentDetail torneo={torneo} />;
}
