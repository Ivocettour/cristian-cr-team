import { createAdminClient } from "@/lib/supabase/admin";
import { enviarPushASuscripciones, type PushPayload } from "@/lib/push";

async function notificarUsuarios(usuarioIds: string[], payload: PushPayload) {
  if (usuarioIds.length === 0) return;
  const admin = createAdminClient();

  await admin.from("notificacion").insert(
    usuarioIds.map((usuario_id) => ({
      usuario_id,
      titulo: payload.titulo,
      cuerpo: payload.cuerpo,
      url: payload.url ?? null,
    }))
  );

  const { data: suscripciones } = await admin
    .from("suscripcion_push")
    .select("id, endpoint, p256dh, auth")
    .in("usuario_id", usuarioIds);

  await enviarPushASuscripciones(suscripciones ?? [], payload);
}

export async function notificarTorneo(torneoId: string, payload: PushPayload) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("seguimiento_torneo")
    .select("usuario_id")
    .eq("torneo_id", torneoId);

  await notificarUsuarios((data ?? []).map((r) => r.usuario_id), payload);
}

export async function notificarSeguidoresDeJugadores(
  jugadorIds: string[],
  payload: PushPayload
) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("seguimiento_jugador")
    .select("usuario_id")
    .in("jugador_id", jugadorIds);

  const usuarioIds = Array.from(new Set((data ?? []).map((r) => r.usuario_id)));
  await notificarUsuarios(usuarioIds, payload);
}
