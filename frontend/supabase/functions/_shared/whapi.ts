// whapi.ts
// Integra Whapi.Cloud (WhatsApp API) para el flujo "clase reservada y pagada
// -> el alumno entra solo al grupo de WhatsApp de esa clase". Ver
// instrucciones de configuración (cuenta, canal, WHAPI_TOKEN) en
// referencia/requerimientos/notas.txt.
//
// Se llama SIEMPRE después de que procesar_pago_completado ya confirmó el
// pago (ver stripe-webhook / verificar-pago-oferta-maestro): un fallo aquí
// NUNCA debe tumbar la confirmación del pago, por eso agregarAlumnoAGrupoClase
// atrapa todos sus propios errores y solo los loguea — el peor caso es que
// alguien no entre solo al grupo y haya que agregarlo a mano, no que se le
// cobre sin confirmar su reserva.

const WHAPI_BASE = "https://gate.whapi.cloud";

// Logo del grupo: usa el mismo /logo.png que ya sirve el frontend (ver
// public/logo.png), en el dominio de producción listado en
// _shared/frontendUrl.ts. Si ese dominio cambia (dominio propio, etc.), hay
// que actualizar esta constante también.
const LOGO_URL = "https://prepa-app-iota.vercel.app/logo.png";

// Mismos labels que src/data/materiasTutoria.js (MATERIAS_TUTORIA) — se
// duplica aquí porque ese archivo vive del lado del frontend (Vite), no es
// importable directo desde un edge function de Deno. Si esa lista cambia,
// hay que reflejarlo aquí también.
const MATERIAS_LABEL: Record<string, string> = {
  espanol: "Español",
  matematicas: "Matemáticas",
  ingles: "Inglés",
  historia: "Historia",
};

type OfertaWhapi = {
  id: string;
  titulo: string | null;
  materia_id: string;
  materia_otro: string | null;
  fecha_hora: string;
  creado_por: string;
  grupo_whatsapp_id: string | null;
};

function tokenHeader(): Record<string, string> {
  const token = Deno.env.get("WHAPI_TOKEN");
  if (!token) throw new Error("Falta la variable de entorno WHAPI_TOKEN");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function whapiFetch(path: string, init: RequestInit): Promise<any> {
  const res = await fetch(`${WHAPI_BASE}${path}`, {
    ...init,
    headers: { ...tokenHeader(), ...(init.headers ?? {}) },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Whapi ${init.method ?? "GET"} ${path} respondió ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

// Resuelve un teléfono (como lo escribió el alumno/profesor) al wa_id real
// que reconoce WhatsApp, o null si el número no tiene WhatsApp. Evita tener
// que adivinar reglas de formato por país (ej. el "1" extra de México) — se
// le pregunta directo a Whapi.
async function resolverWaId(telefono: string): Promise<string | null> {
  const soloDigitos = telefono.replace(/\D/g, "");
  if (soloDigitos.length < 7) return null;

  const data = await whapiFetch("/contacts", {
    method: "POST",
    body: JSON.stringify({ contacts: [soloDigitos] }),
  });

  const contacto = data?.contacts?.[0];
  return contacto?.status === "valid" ? contacto.wa_id : null;
}

async function crearGrupo(subject: string, participanteWaId: string): Promise<string> {
  const data = await whapiFetch("/groups", {
    method: "POST",
    body: JSON.stringify({ subject, participants: [participanteWaId] }),
  });
  if (data?.unprocessed_participants?.length) {
    console.error(`[whapi] No se pudo agregar al crear el grupo:`, data.unprocessed_participants);
  }
  return data.id;
}

async function promoverAdmin(groupId: string, waId: string): Promise<void> {
  await whapiFetch(`/groups/${groupId}/admins`, {
    method: "PATCH",
    body: JSON.stringify({ participants: [waId] }),
  });
}

async function ponerIcono(groupId: string): Promise<void> {
  await whapiFetch(`/groups/${groupId}/icon`, {
    method: "PUT",
    body: JSON.stringify({ media: LOGO_URL }),
  });
}

async function agregarParticipante(groupId: string, waId: string): Promise<void> {
  const data = await whapiFetch(`/groups/${groupId}/participants`, {
    method: "POST",
    body: JSON.stringify({ participants: [waId] }),
  });
  if (data?.failed?.length) {
    console.error(`[whapi] No se pudo agregar al participante ${waId} al grupo ${groupId}:`, data.failed);
  }
}

function nombreOferta(oferta: OfertaWhapi): string {
  if (oferta.titulo?.trim()) return oferta.titulo.trim();
  if (oferta.materia_id === "otros") return oferta.materia_otro || "Clase";
  return MATERIAS_LABEL[oferta.materia_id] ?? oferta.materia_id;
}

// "Nombre_que_el_profesor_dio_a_su_oferta + fecha clase + -PrepaApp"
function construirSubject(oferta: OfertaWhapi): string {
  const fecha = new Date(oferta.fecha_hora).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  return `${nombreOferta(oferta)} ${fecha} -PrepaApp`.slice(0, 100);
}

// supabaseAdmin: cliente creado con SUPABASE_SERVICE_ROLE_KEY (bypassa RLS a
// propósito — esta función corre server-side después de confirmar el pago,
// no en respuesta a una petición de un usuario particular).
export async function agregarAlumnoAGrupoClase(supabaseAdmin: any, transaccionId: string): Promise<void> {
  try {
    const { data: transaccion } = await supabaseAdmin
      .from("transacciones")
      .select("id, oferta_maestro_id, telefono_whatsapp")
      .eq("id", transaccionId)
      .single();

    if (!transaccion?.oferta_maestro_id) return; // compra de producto de tienda, no aplica

    if (!transaccion.telefono_whatsapp) {
      console.error(`[whapi] Transacción ${transaccionId} sin teléfono de WhatsApp, no se agrega a ningún grupo.`);
      return;
    }

    const alumnoWaId = await resolverWaId(transaccion.telefono_whatsapp);
    if (!alumnoWaId) {
      console.error(`[whapi] Teléfono de alumno inválido o sin WhatsApp (transacción ${transaccionId}).`);
      return;
    }

    const { data: oferta } = await supabaseAdmin
      .from("ofertas_maestro")
      .select("id, titulo, materia_id, materia_otro, fecha_hora, creado_por, grupo_whatsapp_id")
      .eq("id", transaccion.oferta_maestro_id)
      .single();

    if (!oferta) return;

    // Ya existe el grupo de esta clase (otro alumno ya la pagó antes): solo
    // se agrega el nuevo alumno, no se crea nada más.
    if (oferta.grupo_whatsapp_id) {
      await agregarParticipante(oferta.grupo_whatsapp_id, alumnoWaId);
      return;
    }

    const { data: profesor } = await supabaseAdmin
      .from("profesores")
      .select("telefono_contacto")
      .eq("user_id", oferta.creado_por)
      .maybeSingle();

    const profesorWaId = profesor?.telefono_contacto ? await resolverWaId(profesor.telefono_contacto) : null;
    if (!profesorWaId) {
      console.error(`[whapi] Profesor de la oferta ${oferta.id} sin teléfono de WhatsApp válido, no se crea el grupo.`);
      return;
    }

    // El canal de Whapi conectado con el número de PrepaApp crea el grupo,
    // así que ese número queda como dueño (creator) automáticamente.
    const groupId = await crearGrupo(construirSubject(oferta), profesorWaId);
    await promoverAdmin(groupId, profesorWaId);
    await ponerIcono(groupId);
    await agregarParticipante(groupId, alumnoWaId);

    await supabaseAdmin.from("ofertas_maestro").update({ grupo_whatsapp_id: groupId }).eq("id", oferta.id);
  } catch (err) {
    console.error(`[whapi] Fallo agregando a grupo de WhatsApp (transacción ${transaccionId}):`, err);
  }
}
