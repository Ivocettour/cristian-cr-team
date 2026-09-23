import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { getTorneos } from "@/lib/queries/tournaments";
import { getUsuarioActual } from "@/lib/queries/social";
import { getNotificaciones } from "@/lib/queries/notifications";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [torneos, usuarioActual] = await Promise.all([getTorneos(), getUsuarioActual()]);
  const proximoTorneo =
    torneos.find((t) => t.estado === "en_curso") ??
    torneos
      .filter((t) => t.estado === "proximo")
      .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio))[0] ??
    null;

  const notificacionesIniciales = usuarioActual ? await getNotificaciones(usuarioActual.id) : [];

  return (
    <>
      <Header
        proximoTorneo={
          proximoTorneo
            ? { nombre: proximoTorneo.nombre, fecha_inicio: proximoTorneo.fecha_inicio }
            : null
        }
        usuarioActual={usuarioActual}
        notificacionesIniciales={notificacionesIniciales}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
