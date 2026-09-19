// pushNotifications.ts
// Envía notificaciones push (Notification API del navegador, vía Service
// Worker en public/sw.js) — hoy dos casos, ambos sobre la misma tabla
// `push_subscriptions` genérica (una fila por navegador suscrito, sin
// distinguir "para qué" se suscribió: quien activa notificaciones recibe
// TODO lo que esta app mande por push):
//   1. notificarNuevoAlumno: al maestro, cuando un alumno paga un cupo en su
//      oferta (ver stripe-webhook / verificar-pago-oferta-maestro).
//   2. enviarRecordatoriosEstudio: recordatorio genérico de estudio cada ~3
//      días a cualquier suscrito (ver edge function recordatorio-estudio,
//      disparada por un cron de Postgres — migración 20260918140000).
//
// VAPID_PRIVATE_KEY/VAPID_PUBLIC_KEY/VAPID_SUBJECT son las variables de
// entorno del edge function (nunca del frontend); VITE_VAPID_PUBLIC_KEY en
// el frontend debe tener el MISMO valor que VAPID_PUBLIC_KEY aquí — es la
// mitad pública del par, segura de exponer (así funciona VAPID).

import webpush from "web-push";

// Mismo patrón que MATERIAS_LABEL en whapi.ts: se duplica porque
// src/data/materiasTutoria.js no es importable desde este runtime Deno.
const MATERIAS_LABEL: Record<string, string> = {
  espanol: "Español",
  matematicas: "Matemáticas",
  ingles: "Inglés",
  historia: "Historia",
};

function nombreMateria(materiaId: string, materiaOtro: string | null): string {
  if (materiaId === "otros") return materiaOtro || "tu clase";
  return MATERIAS_LABEL[materiaId] ?? materiaId;
}

let vapidConfigurado = false;
function asegurarVapid(): boolean {
  if (vapidConfigurado) return true;
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const subject = Deno.env.get("VAPID_SUBJECT");
  if (!publicKey || !privateKey || !subject) {
    console.error("[push] Faltan variables VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_SUBJECT, no se manda push.");
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigurado = true;
  return true;
}

type Suscripcion = { id: string; endpoint: string; p256dh: string; auth_key: string };

// Manda el mismo payload a una lista de suscripciones ya cargada, en
// paralelo, limpiando las que el navegador ya no reconoce (404/410 = el
// usuario desinstaló, limpió datos del sitio, etc. — no tiene caso seguir
// intentando para siempre). Cualquier otro error solo se loguea, nunca
// interrumpe el resto del lote. Devuelve cuántos envíos NO fallaron.
async function enviarATodas(supabaseAdmin: any, suscripciones: Suscripcion[], payload: string): Promise<number> {
  const resultados = await Promise.all(
    suscripciones.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          payload
        );
        return true;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error(`[push] Fallo enviando a la suscripción ${sub.id}:`, err?.message ?? err);
        }
        return false;
      }
    })
  );
  return resultados.filter(Boolean).length;
}

// supabaseAdmin: cliente creado con SUPABASE_SERVICE_ROLE_KEY (bypassa RLS a
// propósito, igual que agregarAlumnoAGrupoClase — corre server-side después
// de confirmar el pago, no en respuesta a una petición de un usuario
// particular).
export async function notificarNuevoAlumno(supabaseAdmin: any, transaccionId: string): Promise<void> {
  try {
    if (!asegurarVapid()) return;

    const { data: transaccion } = await supabaseAdmin
      .from("transacciones")
      .select("id, oferta_maestro_id, user_id")
      .eq("id", transaccionId)
      .single();

    if (!transaccion?.oferta_maestro_id) return; // compra de producto de tienda, no aplica

    const { data: oferta } = await supabaseAdmin
      .from("ofertas_maestro")
      .select("materia_id, materia_otro, creado_por")
      .eq("id", transaccion.oferta_maestro_id)
      .single();

    if (!oferta) return;

    const { data: suscripciones } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth_key")
      .eq("user_id", oferta.creado_por);

    if (!suscripciones?.length) return;

    let nombreAlumno = "Un alumno";
    const { data: perfil } = await supabaseAdmin
      .from("perfiles")
      .select("nombre")
      .eq("id", transaccion.user_id)
      .maybeSingle();
    if (perfil?.nombre) nombreAlumno = perfil.nombre;

    const payload = JSON.stringify({
      title: "Nuevo alumno inscrito",
      body: `${nombreAlumno} pagó un cupo en tu clase de ${nombreMateria(oferta.materia_id, oferta.materia_otro)}.`,
      url: "/tutorias/maestro/alumnos",
    });

    await enviarATodas(supabaseAdmin, suscripciones, payload);
  } catch (err) {
    console.error(`[push] Fallo notificando nuevo alumno (transacción ${transaccionId}):`, err);
  }
}

// Mensajes genéricos de recordatorio de estudio: sin nombre ni materia
// específica (a diferencia de notificarNuevoAlumno, esto no sabe nada del
// destinatario más allá de que tiene la app instalada), sin emojis — piden
// texto plano. Varios para que no se sienta el mismo mensaje repetido cada
// 3 días; se elige uno al azar por envío, no rotan en orden fijo.
const MENSAJES_RECORDATORIO_ESTUDIO = [
  "Han pasado unos días desde tu ultima sesion de estudio. Retomalo cuando puedas.",
  "Un recordatorio rapido: sigue avanzando en tus lecciones de PrepaApp.",
  "Tu progreso te espera. Dedica unos minutos hoy a repasar una leccion.",
  "La constancia rinde mas que la intensidad. Unos minutos de estudio hoy ya suman.",
  "No has entrado a estudiar en unos dias. Un repaso corto ahora te ayuda despues.",
];

function elegirMensajeRecordatorio(): string {
  return MENSAJES_RECORDATORIO_ESTUDIO[Math.floor(Math.random() * MENSAJES_RECORDATORIO_ESTUDIO.length)];
}

// Recordatorio de estudio cada ~3 días: llamado desde la edge function
// recordatorio-estudio (disparada por un cron de Postgres, ver migración
// 20260918140000_recordatorios_estudio.sql), nunca desde una petición de un
// usuario particular — por eso no recibe transaccionId ni filtra por
// usuario, manda a TODA suscripción vencida que le pasen. Actualiza
// `ultimo_recordatorio_en` de cada una que sigue viva (no se borró por
// 404/410) para que la próxima corrida del cron no la vuelva a tomar antes
// de que pasen otros 3 días.
export async function enviarRecordatoriosEstudio(supabaseAdmin: any, suscripciones: Suscripcion[]): Promise<number> {
  if (!asegurarVapid() || suscripciones.length === 0) return 0;

  const payload = JSON.stringify({
    title: "Recordatorio de estudio",
    body: elegirMensajeRecordatorio(),
    url: "/",
  });

  const enviados = await enviarATodas(supabaseAdmin, suscripciones, payload);

  await supabaseAdmin
    .from("push_subscriptions")
    .update({ ultimo_recordatorio_en: new Date().toISOString() })
    .in("id", suscripciones.map((s) => s.id));

  return enviados;
}
