import { HeroSection } from "@/components/public/HeroSection";
import { Carousel } from "@/components/ui/Carousel";
import { TournamentCard } from "@/components/public/TournamentCard";
import { getTorneos } from "@/lib/queries/tournaments";

export default async function HomePage() {
  const torneos = await getTorneos();
  const destacados = [...torneos].sort((a, b) =>
    a.fecha_inicio.localeCompare(b.fecha_inicio)
  );

  return (
    <>
      <HeroSection />
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl text-white sm:text-3xl">
            Próximos torneos
          </h2>
        </div>
        <div className="mt-6">
          {destacados.length > 0 ? (
            <Carousel>
              {destacados.map((torneo) => (
                <TournamentCard key={torneo.id} torneo={torneo} />
              ))}
            </Carousel>
          ) : (
            <p className="px-4 text-foreground-muted sm:px-6">
              Todavía no hay torneos cargados.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
