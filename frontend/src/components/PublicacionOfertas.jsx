// PublicacionOfertas.jsx
// Portal de ALUMNOS (solo lectura + reservar) sobre la tabla `ofertas_maestro`
// (ver supabase/migrations/20260809120000_ofertas_maestro.sql) — sistema
// simple, separado del marketplace bidireccional de ofertas_tutoria: aquí
// solo el maestro publica (desde TutoriasMaestro.jsx, con su propio gate de
// maestro verificado; este componente nunca publica ni borra ofertas).
//
// Ya tiene flujo de pago dentro de la app (ver
// supabase/migrations/20260810130000_reservas_ofertas_maestro.sql y
// 20260810140000_marcar_reserva_fallida_maestro.sql): reservar un asiento es
// un mutex con TTL de 15 min sobre `transacciones`, no un INSERT directo. El
// ciclo completo que sigue este componente es:
//   1. "ping" -> asientos_disponibles_oferta_maestro (al cargar y tras cada
//      acción, para no mostrar cupo desactualizado)
//   2. "reservar" -> iniciar_reserva_oferta_maestro (mutex + hold pendiente,
//      regresa expira_en para la cuenta regresiva)
//   3a. "pagar" -> POST a la edge function crear-sesion-pago-oferta-maestro
//       con { transaccion_id } y redirect a Stripe Checkout
//   3b. "cancelar"/TTL vencido -> cancelar_reserva_oferta_maestro o el
//       barrido oportunista del propio backend libera el asiento solo
// Solo se mantiene UNA reserva activa a la vez en este componente (cancela
// la anterior si el alumno reserva otra oferta) para no complicar la UI con
// varios checkouts en curso; el backend sí soportaría varias en paralelo.
//
// Antes tenía un modo `permitirPublicar` (formulario de publicación + borrar
// oferta propia, para un portal de maestros sin gate de rol) usado por las
// rutas /ofertas y /ofertas/publicar. Esas rutas quedaron huérfanas cuando
// se construyó el registro de maestro verificado (TutoriasMaestro.jsx) y
// ahora son puros redirects (ver Ofertas.jsx/PublicarOferta.jsx), así que
// ese modo se quitó de aquí — nadie lo invocaba ya.

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { FilaChips } from "./FilaChips";
import { Estrellas } from "./Estrellas";
import { MATERIAS_TUTORIA, MATERIA_OTROS, nombreMateriaOferta } from "../data/materiasTutoria";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineClock,
  HiOutlineCreditCard,
  HiOutlinePhone,
  HiOutlineXCircle,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi2";

const TTL_RESERVA_MINUTOS = 15;

const MENSAJES_RESERVA = {
  no_autenticado: "Inicia sesión para reservar un asiento.",
  no_puedes_reservar_tu_propia_oferta: "No puedes reservar tu propia oferta.",
  oferta_archivada: "Tu maestro retiró esta oferta, ya no se puede reservar.",
  oferta_vencida: "Esta clase ya pasó, ya no se puede reservar.",
  oferta_no_encontrada: "Esta oferta ya no existe.",
  sin_cupo_disponible: "Ya no queda cupo disponible para esta clase.",
  reserva_no_encontrada: "Esa reserva ya no está activa.",
};

function mensajeErrorReserva(err) {
  const clave = Object.keys(MENSAJES_RESERVA).find((k) => err?.message?.includes(k));
  return clave ? MENSAJES_RESERVA[clave] : "No se pudo procesar tu reserva. Intenta de nuevo.";
}

function formatearRestante(ms) {
  const totalSeg = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
}

const inputStyle = {
  width: "100%",
  minHeight: 44,
  background: "var(--surface)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  padding: "12px 14px",
  color: "var(--text)",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
};

export function PublicacionOfertas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorOfertas, setErrorOfertas] = useState("");
  const [disponibilidad, setDisponibilidad] = useState({});
  const [calificaciones, setCalificaciones] = useState({});
  const [pendientesWhatsapp, setPendientesWhatsapp] = useState([]);
  // null = todavia no se consulto, '' = se consulto y no tiene telefono
  // registrado, cualquier otra cosa = ya tiene uno (ver efecto de abajo).
  const [telefonoRegistrado, setTelefonoRegistrado] = useState(null);

  // Filtros del lado alumno (solo lectura + reservar): puramente client-side
  // sobre la lista ya cargada, no vuelven a pegarle a Supabase.
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroMateria, setFiltroMateria] = useState("");
  const [filtroProfesor, setFiltroProfesor] = useState("");
  const [filtroPrecioMin, setFiltroPrecioMin] = useState("");
  const [filtroPrecioMax, setFiltroPrecioMax] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [reserva, setReserva] = useState(null); // { transaccionId, ofertaId, expiraEn, montoTotal }
  const [reservandoId, setReservandoId] = useState(null);
  const [pagando, setPagando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [info, setInfo] = useState("");
  const [, forceTick] = useState(0);
  const reservaRef = useRef(null);
  reservaRef.current = reserva;

  const [error, setError] = useState("");

  async function cargarOfertas() {
    setCargando(true);
    const { data, error: fetchError } = await supabase
      .from("ofertas_maestro")
      .select("*")
      .gte("fecha_hora", new Date().toISOString())
      .is("archivada_en", null)
      .order("fecha_hora", { ascending: true });
    if (fetchError) {
      // No se pisa `ofertas` con [] aquí: un fallo de red no debe verse
      // igual que "no hay ofertas" — si ya había una lista cargada, se deja
      // tal cual en vez de vaciarla por una falla transitoria.
      console.error("No se pudieron cargar las ofertas:", fetchError.message);
      setErrorOfertas("No se pudieron cargar las ofertas. Revisa tu conexión e intenta de nuevo.");
    } else {
      setErrorOfertas("");
      setOfertas(data ?? []);
    }
    setCargando(false);
  }

  useEffect(() => {
    cargarOfertas();
  }, []);

  // El "ping" del paso 1: se corre para cada oferta visible.
  async function cargarDisponibilidad(lista) {
    if (lista.length === 0) return;
    const entradas = await Promise.all(
      lista.map(async (oferta) => {
        const { data, error } = await supabase.rpc("asientos_disponibles_oferta_maestro", {
          p_oferta_id: oferta.id,
        });
        if (error) {
          // `{ error: true }` en vez de null: null ya significa "la RPC
          // contestó pero sin datos", así que un fallo real necesita su
          // propia marca — si no, el botón de reservar se ve igual de
          // habilitado que cuando de verdad no hay info que mostrar, en vez
          // de avisar que no se pudo verificar el cupo.
          console.error(`No se pudo verificar el cupo de la oferta ${oferta.id}:`, error.message);
          return [oferta.id, { error: true }];
        }
        return [oferta.id, data ?? null];
      })
    );
    setDisponibilidad(Object.fromEntries(entradas));
  }

  useEffect(() => {
    if (!cargando) cargarDisponibilidad(ofertas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando, ofertas]);

  // Calificación pública del profesor (una consulta por autor distinto,
  // no por oferta): se muestra junto a su nombre, como el rating de un
  // vendedor en Amazon, y enlaza a PerfilProfesor.jsx.
  async function cargarCalificaciones(lista) {
    const idsUnicos = [...new Set(lista.map((o) => o.creado_por))];
    if (idsUnicos.length === 0) return;
    const entradas = await Promise.all(
      idsUnicos.map(async (id) => {
        const { data } = await supabase.rpc("obtener_perfil_profesor", { p_profesor_user_id: id });
        return [id, data?.[0] ?? null];
      })
    );
    setCalificaciones(Object.fromEntries(entradas));
  }

  useEffect(() => {
    if (!cargando) cargarCalificaciones(ofertas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando, ofertas]);

  // Si Stripe redirige aquí desde el cancel_url de la Checkout Session
  // (?reserva_cancelada=<transaccion_id>), se libera el asiento de una vez
  // en vez de esperar a que el TTL de 15 min lo haga solo.
  useEffect(() => {
    const transaccionId = searchParams.get("reserva_cancelada");
    if (!transaccionId) return;

    (async () => {
      const { error: cancelError } = await supabase.rpc("cancelar_reserva_oferta_maestro", { p_transaccion_id: transaccionId });
      if (cancelError) {
        // No se toca `reserva`: si de verdad seguía activa en el servidor,
        // debe seguir viéndose así (con su cuenta regresiva) en vez de
        // desaparecer de la UI mientras el asiento sigue ocupado.
        console.error("No se pudo cancelar la reserva al volver de Stripe:", cancelError.message);
        setError(mensajeErrorReserva(cancelError));
      } else {
        if (reservaRef.current?.transaccionId === transaccionId) setReserva(null);
        setInfo("Tu reserva fue cancelada; el asiento quedó libre de nuevo.");
      }
      cargarOfertas();
    })();

    const siguientes = new URLSearchParams(searchParams);
    siguientes.delete("reserva_cancelada");
    setSearchParams(siguientes, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Mensaje de espera (solo lado alumno): clases ya pagadas cuyo maestro
  // todavía no marca "agregado al grupo de WhatsApp" (ver botón en
  // AlumnosOfertas.jsx / RPC marcar_agregado_grupo_whatsapp). Se vuelve a
  // consultar al volver a la pestaña para que el mensaje desaparezca solo en
  // cuanto el maestro lo marque, sin depender de un refresh manual.
  useEffect(() => {
    if (!user) return;

    async function cargarPendientesWhatsapp() {
      const { data, error } = await supabase
        .from("transacciones")
        .select("id, ofertas_maestro(materia_id, materia_otro, titulo, fecha_hora)")
        .eq("user_id", user.id)
        .eq("estado_pago", "completado")
        .eq("agregado_a_grupo_whatsapp", false)
        .not("oferta_maestro_id", "is", null);

      if (error) {
        console.error("No se pudo consultar el estado del grupo de WhatsApp:", error.message);
        return;
      }
      setPendientesWhatsapp(data ?? []);

      // Solo hace falta saber esto mientras haya algo pendiente: si el
      // maestro ya lo tiene (por Formulario de área, ver fa.telefono en
      // obtener_alumnos_ofertas_maestro), no hay nada que ofrecerle al
      // alumno — no se le va a mostrar un botón para llenar algo que ya
      // llenó.
      if ((data ?? []).length === 0) return;

      const { data: formulario, error: errorFormulario } = await supabase
        .from("formularios_area")
        .select("telefono")
        .eq("user_id", user.id)
        .order("creado_en", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (errorFormulario) {
        console.error("No se pudo consultar si ya tienes un teléfono registrado:", errorFormulario.message);
        return;
      }
      setTelefonoRegistrado(formulario?.telefono?.trim() || "");
    }

    cargarPendientesWhatsapp();
    const alVolverAVer = () => {
      if (document.visibilityState === "visible") cargarPendientesWhatsapp();
    };
    document.addEventListener("visibilitychange", alVolverAVer);
    return () => document.removeEventListener("visibilitychange", alVolverAVer);
  }, [user]);

  // Cuenta regresiva de la reserva activa: se apaga sola al llegar a 0 y
  // refresca disponibilidad (el propio backend ya liberó el asiento vía el
  // barrido oportunista la próxima vez que alguien lo consulte).
  useEffect(() => {
    if (!reserva) return;
    const id = setInterval(() => {
      const restante = new Date(reserva.expiraEn).getTime() - Date.now();
      if (restante <= 0) {
        setReserva(null);
        setInfo("Tu reserva expiró. Puedes intentar reservar de nuevo.");
        cargarOfertas();
        return;
      }
      forceTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [reserva]);

  async function reservar(oferta) {
    setError("");
    setInfo("");
    setReservandoId(oferta.id);

    // Solo se sostiene una reserva a la vez en esta UI: si había otra
    // activa (de otra oferta), se cancela primero para no dejarla colgada
    // hasta que el TTL la venza solo. Si esa cancelación falla, hay que
    // abortar aquí — seguir de largo dejaría al alumno con dos reservas
    // ocupando dos asientos a la vez.
    if (reserva && reserva.ofertaId !== oferta.id) {
      const { error: cancelError } = await supabase.rpc("cancelar_reserva_oferta_maestro", { p_transaccion_id: reserva.transaccionId });
      if (cancelError) {
        console.error("No se pudo cancelar tu reserva anterior:", cancelError.message);
        setReservandoId(null);
        setError("No se pudo liberar tu reserva anterior. Cancélala o espera a que expire antes de reservar otra clase.");
        return;
      }
    }

    const { data, error: rpcError } = await supabase.rpc("iniciar_reserva_oferta_maestro", {
      p_oferta_id: oferta.id,
      p_ttl_minutos: TTL_RESERVA_MINUTOS,
    });

    setReservandoId(null);

    if (rpcError || !data) {
      setError(mensajeErrorReserva(rpcError));
      cargarDisponibilidad(ofertas);
      return;
    }

    setReserva({
      transaccionId: data.id,
      ofertaId: oferta.id,
      expiraEn: data.expira_en,
      montoTotal: data.monto_total,
    });
    cargarDisponibilidad(ofertas);
  }

  async function pagar() {
    if (!reserva) return;
    setError("");
    setPagando(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Tu sesión expiró, vuelve a iniciar sesión.");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crear-sesion-pago-oferta-maestro`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ transaccion_id: reserva.transaccionId }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.error || !data.url) {
        setError(data.error || "No se pudo iniciar el pago.");
        if (res.status === 409) {
          // La reserva ya expiró del lado del servidor.
          setReserva(null);
          cargarOfertas();
        }
        return;
      }

      window.location.href = data.url; // redirige a Stripe Checkout
    } catch (err) {
      console.error(err);
      setError("No se pudo procesar el pago.");
    } finally {
      setPagando(false);
    }
  }

  async function cancelarReserva() {
    if (!reserva) return;
    setCancelando(true);
    const { error: cancelError } = await supabase.rpc("cancelar_reserva_oferta_maestro", { p_transaccion_id: reserva.transaccionId });
    setCancelando(false);
    if (cancelError) {
      console.error("No se pudo cancelar la reserva:", cancelError.message);
      setError(mensajeErrorReserva(cancelError));
      return;
    }
    setReserva(null);
    setInfo("Reserva cancelada.");
    cargarOfertas();
  }

  const materiaFiltro =
    filtroMateria === MATERIA_OTROS.id
      ? MATERIA_OTROS
      : MATERIAS_TUTORIA.find((m) => m.id === filtroMateria);

  const hayFiltrosActivos = Boolean(
    filtroMateria || filtroProfesor.trim() || filtroPrecioMin || filtroPrecioMax || filtroFechaDesde || filtroFechaHasta
  );

  const ofertasFiltradas = ofertas.filter((oferta) => {
    if (filtroMateria && oferta.materia_id !== filtroMateria) return false;
    if (filtroProfesor.trim() && !oferta.profesor.toLowerCase().includes(filtroProfesor.trim().toLowerCase())) return false;
    const precio = Number(oferta.precio_mxn);
    if (filtroPrecioMin && precio < Number(filtroPrecioMin)) return false;
    if (filtroPrecioMax && precio > Number(filtroPrecioMax)) return false;
    const fechaOferta = new Date(oferta.fecha_hora);
    if (filtroFechaDesde && fechaOferta < new Date(`${filtroFechaDesde}T00:00:00`)) return false;
    if (filtroFechaHasta && fechaOferta > new Date(`${filtroFechaHasta}T23:59:59`)) return false;
    return true;
  });

  function limpiarFiltros() {
    setFiltroMateria("");
    setFiltroProfesor("");
    setFiltroPrecioMin("");
    setFiltroPrecioMax("");
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
  }

  const listaVisible = ofertasFiltradas;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {pendientesWhatsapp.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pendientesWhatsapp.map((p) => {
            const om = p.ofertas_maestro;
            const nombreClase = om ? (om.titulo || nombreMateriaOferta(om.materia_id, om.materia_otro)) : "tu clase";
            return (
              <div
                key={p.id}
                style={{
                  background: "linear-gradient(135deg, rgba(124,92,191,0.10), rgba(124,92,191,0.03))",
                  border: "1px solid rgba(124,92,191,0.25)",
                  borderRadius: 12,
                  padding: "13px 15px",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div style={{ position: "relative", width: 34, height: 34, flexShrink: 0 }}>
                  <span
                    className="pulso-espera"
                    style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#7c5cbf" }}
                  />
                  <span
                    style={{
                      position: "relative",
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "rgba(124,92,191,0.18)",
                      color: "#7c5cbf",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                    }}
                  >
                    <HiOutlineClock />
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: "#7c5cbf", textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>
                    En espera
                  </p>
                  <p style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.45, margin: "3px 0 0" }}>
                    <strong>{nombreClase}</strong> — tu maestro te añadirá al grupo de WhatsApp de esta clase en
                    el transcurso del día.
                  </p>
                  {/* Solo aparece si de verdad no tenemos su teléfono (ver
                      telefonoRegistrado arriba) — nunca obligatorio, y no se
                      le muestra a quien ya lo tiene registrado. */}
                  {telefonoRegistrado === "" && (
                    <button
                      type="button"
                      onClick={() => navigate("/formulario-area")}
                      style={{
                        marginTop: 8, minHeight: 36, padding: "0 12px", borderRadius: 8,
                        border: "1px solid rgba(124,92,191,0.4)", background: "rgba(124,92,191,0.12)",
                        color: "#7c5cbf", fontWeight: 700, fontSize: 11.5, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      <HiOutlinePhone /> No tenemos tu celular — regístralo aquí
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && <p style={{ color: "var(--wrong)", fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>}
      {info && <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", margin: 0 }}>{info}</p>}

      <div className="sp-card" style={{ margin: 0 }}>
        <button
          type="button"
          onClick={() => setMostrarFiltros((v) => !v)}
          style={{
            width: "100%", minHeight: 24, padding: 0, background: "transparent", border: "none",
            display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
            color: "var(--text)", fontWeight: 700, fontSize: 14,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <HiOutlineAdjustmentsHorizontal style={{ fontSize: 17 }} />
            Filtros
            {hayFiltrosActivos && (
              <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: "#06b6d4", color: "#fff", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {[filtroMateria, filtroProfesor.trim(), filtroPrecioMin, filtroPrecioMax, filtroFechaDesde, filtroFechaHasta].filter(Boolean).length}
              </span>
            )}
          </span>
          {mostrarFiltros ? <HiChevronUp /> : <HiChevronDown />}
        </button>

        {mostrarFiltros && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 8 }}>Materia</p>
              <FilaChips
                opciones={["Todas", ...MATERIAS_TUTORIA.map((m) => m.nombre), MATERIA_OTROS.nombre]}
                valor={materiaFiltro?.nombre ?? "Todas"}
                onChange={(nombre) => {
                  if (nombre === "Todas") return setFiltroMateria("");
                  if (nombre === MATERIA_OTROS.nombre) return setFiltroMateria(MATERIA_OTROS.id);
                  setFiltroMateria(MATERIAS_TUTORIA.find((m) => m.nombre === nombre)?.id ?? "");
                }}
                color="#06b6d4"
              />
            </div>

            <input
              style={inputStyle}
              placeholder="Buscar por profesor"
              value={filtroProfesor}
              onChange={(e) => setFiltroProfesor(e.target.value)}
            />

            <div>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 8 }}>Precio (MXN)</p>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                  type="number"
                  min={0}
                  placeholder="Mínimo"
                  value={filtroPrecioMin}
                  onChange={(e) => setFiltroPrecioMin(e.target.value)}
                />
                <input
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                  type="number"
                  min={0}
                  placeholder="Máximo"
                  value={filtroPrecioMax}
                  onChange={(e) => setFiltroPrecioMax(e.target.value)}
                />
              </div>
            </div>

            <div>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 8 }}>Fecha</p>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                  type="date"
                  value={filtroFechaDesde}
                  onChange={(e) => setFiltroFechaDesde(e.target.value)}
                />
                <input
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                  type="date"
                  value={filtroFechaHasta}
                  onChange={(e) => setFiltroFechaHasta(e.target.value)}
                />
              </div>
            </div>

            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                style={{ minHeight: 40, borderRadius: 10, border: "1px solid var(--surface2)", background: "transparent", color: "var(--text-muted)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "4px 0 0" }}>
        Ofertas disponibles
      </p>

      {cargando && <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Cargando…</p>}
      {!cargando && errorOfertas && (
        <p style={{ fontSize: 13, color: "var(--wrong)", margin: 0 }}>{errorOfertas}</p>
      )}
      {!cargando && !errorOfertas && ofertas.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Por ahora no hay ofertas disponibles.</p>
      )}
      {!cargando && ofertas.length > 0 && listaVisible.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Ninguna oferta coincide con tus filtros.</p>
      )}

      {listaVisible.map((oferta) => {
          const materia = MATERIAS_TUTORIA.find((m) => m.id === oferta.materia_id);
          const color = materia?.color ?? MATERIA_OTROS.color;
          const nombreMateria = nombreMateriaOferta(oferta.materia_id, oferta.materia_otro);
          const fechaObj = new Date(oferta.fecha_hora);
          return (
            <div key={oferta.id} className="sp-card" style={{ margin: 0 }}>
              <div className="sp-card-header">
                <div className="sp-card-icon" style={{ background: `${color}22`, color }}>
                  {nombreMateria[0] ?? "?"}
                </div>
                <div className="sp-card-body">
                  <p className="sp-card-title">
                    {oferta.titulo ? `${oferta.titulo} · ` : ""}{nombreMateria} · {oferta.duracion_minutos} min
                  </p>
                  <p className="sp-card-description">
                    {fechaObj.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/perfil-profesor/${oferta.creado_por}`)}
                      style={{ background: "transparent", border: "none", padding: 0, color: "var(--text)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}
                    >
                      {oferta.profesor}
                    </button>
                    {calificaciones[oferta.creado_por] && (
                      <Estrellas
                        value={Number(calificaciones[oferta.creado_por].calificacion_promedio) || 0}
                        count={calificaciones[oferta.creado_por].numero_calificaciones ?? 0}
                        size={11}
                      />
                    )}
                    <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>· Cupo: {oferta.cupo_maximo}</span>
                  </div>
                </div>
                <p style={{ fontSize: 17, fontWeight: 800, color, margin: 0, whiteSpace: "nowrap" }}>
                  ${Number(oferta.precio_mxn).toFixed(0)}
                </p>
              </div>

              {oferta.notas && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "10px 0 0", lineHeight: 1.5 }}>
                  {oferta.notas}
                </p>
              )}

              {(() => {
                const disp = disponibilidad[oferta.id];
                const errorCupo = disp?.error === true;
                const activa = reserva?.ofertaId === oferta.id;
                const sinCupo = disp && !errorCupo && (!disp.vigente || disp.disponibles <= 0);

                if (activa) {
                  const restanteMs = new Date(reserva.expiraEn).getTime() - Date.now();
                  return (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 10,
                        background: "var(--surface)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>
                        Asiento reservado · se libera en <strong style={{ color }}>{formatearRestante(restanteMs)}</strong>
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={pagar}
                          disabled={pagando}
                          style={{
                            flex: 1,
                            minHeight: 44,
                            borderRadius: 10,
                            border: "none",
                            background: color,
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            cursor: pagando ? "default" : "pointer",
                            opacity: pagando ? 0.7 : 1,
                          }}
                        >
                          <HiOutlineCreditCard /> {pagando ? "Abriendo pago…" : "Pagar ahora"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelarReserva}
                          disabled={cancelando}
                          style={{
                            minHeight: 44,
                            padding: "0 14px",
                            borderRadius: 10,
                            border: "1px solid var(--wrong)",
                            background: "transparent",
                            color: "var(--wrong)",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: cancelando ? "default" : "pointer",
                            opacity: cancelando ? 0.6 : 1,
                          }}
                        >
                          <HiOutlineXCircle />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    type="button"
                    onClick={() => reservar(oferta)}
                    disabled={reservandoId === oferta.id || sinCupo || errorCupo || Boolean(reserva)}
                    style={{
                      marginTop: 10,
                      width: "100%",
                      minHeight: 44,
                      borderRadius: 10,
                      border: "none",
                      background: sinCupo || errorCupo ? "var(--surface)" : color,
                      color: sinCupo || errorCupo ? "var(--text-muted)" : "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: reservandoId === oferta.id || sinCupo || errorCupo || reserva ? "default" : "pointer",
                      opacity: reservandoId === oferta.id ? 0.7 : 1,
                    }}
                  >
                    {errorCupo
                      ? "No se pudo verificar el cupo"
                      : sinCupo
                        ? disp && !disp.vigente ? "Clase vencida" : "Sin cupo disponible"
                        : reservandoId === oferta.id
                          ? "Reservando…"
                          : disp
                            ? `Reservar asiento (${disp.disponibles} disponibles)`
                            : "Reservar asiento"}
                  </button>
                );
              })()}
            </div>
          );
        })}
    </div>
  );
}
