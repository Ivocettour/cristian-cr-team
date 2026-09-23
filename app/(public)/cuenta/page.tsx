import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { FollowTournamentButton } from "@/components/public/FollowTournamentButton";
import { FollowPlayerButton } from "@/components/public/FollowPlayerButton";
import { PushOptIn } from "@/components/public/PushOptIn";
import { getUsuarioActual, getJugadoresSeguidos, getTorneosSeguidos } from "@/lib/queries/social";
import { cerrarSesionPublico } from "@/lib/actions/cuenta";

export const metadata = { title: "Mi cuenta — CR&LB team" };

export default async function CuentaPage() {
  const usuarioActual = await getUsuarioActual();
  if (!usuarioActual) redirect("/cuenta/login");

  const [torneosSeguidos, jugadoresSeguidos] = await Promise.all([
    getTorneosSeguidos(usuarioActual.id),
    getJugadoresSeguidos(usuarioActual.id),
  ]);

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-3 border-b border-border-subtle pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-heading text-3xl text-white">Mi cuenta</h1>
            <p className="text-sm text-foreground-muted">{usuarioActual.email}</p>
          </div>
          <form action={cerrarSesionPublico}>
            <button className="min-h-11 rounded-full border border-white/20 px-4 font-heading text-xs tracking-wide text-white hover:border-white">
              Cerrar sesión
            </button>
          </form>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl text-white">Notificaciones push</h2>
          <PushOptIn />
        </section>

        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl text-white">Torneos que seguís</h2>
          {torneosSeguidos.length === 0 ? (
            <p className="text-sm text-foreground-muted">Todavía no seguís ningún torneo.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {torneosSeguidos.map((t) => (
                <Card key={t.torneo_id} className="flex items-center justify-between p-4">
                  <Link href={`/torneos/${t.torneo_id}`} className="font-heading text-white hover:text-accent">
                    {t.nombre}
                  </Link>
                  <FollowTournamentButton
                    torneoId={t.torneo_id}
                    usuarioId={usuarioActual.id}
                    siguiendoInicial
                  />
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl text-white">Jugadores que seguís</h2>
          {jugadoresSeguidos.length === 0 ? (
            <p className="text-sm text-foreground-muted">Todavía no seguís ningún jugador.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {jugadoresSeguidos.map((j) => (
                <Card key={j.jugador_id} className="flex items-center justify-between p-4">
                  <Link href={`/jugadores/${j.jugador_id}`} className="font-heading text-white hover:text-accent">
                    {j.nombre} {j.apellido}
                  </Link>
                  <FollowPlayerButton
                    jugadorId={j.jugador_id}
                    usuarioId={usuarioActual.id}
                    siguiendoInicial
                  />
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
