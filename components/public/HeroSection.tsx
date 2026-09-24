import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle px-4 py-20 sm:px-6 sm:py-28">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-full w-2/3 rotate-6 bg-gradient-to-b from-magenta/40 via-magenta/10 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center mix-blend-screen opacity-[0.22] grayscale-[35%]"
        aria-hidden
      >
        <Image
          src="/logo.png"
          alt=""
          width={1206}
          height={570}
          priority
          className="w-[115%] max-w-none sm:w-[65%]"
        />
      </div>
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="mb-3 font-heading text-sm tracking-widest text-accent-light">
          CR&amp;LB team
        </p>
        <h1 className="font-heading text-[clamp(2.5rem,9vw,5.5rem)] leading-[0.95] text-white">
          TORNEOS, ZONAS Y RESULTADOS EN VIVO
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-foreground-muted sm:text-lg">
          Seguí el cuadro, las zonas y el marcador de cada cancha en tiempo real,
          sin necesidad de crear una cuenta.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/torneos" variant="primary">
            Ver torneos
          </Button>
        </div>
      </div>
    </section>
  );
}
