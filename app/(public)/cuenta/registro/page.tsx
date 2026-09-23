import { RegistroForm } from "./RegistroForm";

export const metadata = { title: "Crear cuenta — CR&LB team" };

export default function CuentaRegistroPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <h1 className="mb-2 font-heading text-3xl text-white">
        CREAR CUENTA <span className="text-accent">·</span> CR&amp;LB TEAM
      </h1>
      <p className="mb-8 max-w-sm text-center text-sm text-foreground-muted">
        Seguí torneos y jugadores, y enterate apenas arranca o termina su partido.
      </p>
      <RegistroForm />
    </div>
  );
}
