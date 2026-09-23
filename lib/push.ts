import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";
  if (!publicKey || !privateKey) return;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export interface PushPayload {
  titulo: string;
  cuerpo: string;
  url?: string;
}

interface SuscripcionPush {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function enviarPushASuscripciones(
  suscripciones: SuscripcionPush[],
  payload: PushPayload
) {
  ensureConfigured();
  if (!configured || suscripciones.length === 0) return;

  const admin = createAdminClient();
  const body = JSON.stringify(payload);

  await Promise.all(
    suscripciones.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await admin.from("suscripcion_push").delete().eq("id", sub.id);
        }
      }
    })
  );
}
