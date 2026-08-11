// PublicacionOfertas.jsx
// Muestra y (opcionalmente) permite publicar ofertas de la tabla
// `ofertas_maestro` (ver supabase/migrations/20260809120000_ofertas_maestro.sql)
// — sistema simple, separado del marketplace bidireccional de
// ofertas_tutoria: aquí solo el maestro publica.
//
// El lado alumno (permitirPublicar=false) YA sí tiene flujo de pago dentro
// de la app (ver supabase/migrations/20260810130000_reservas_ofertas_maestro.sql
// y 20260810140000_marcar_reserva_fallida_maestro.sql): reservar un asiento
// es un mutex con TTL de 15 min sobre `transacciones`, no un INSERT directo.
// El ciclo completo que sigue este componente es:
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
// `permitirPublicar`: sin esto, es de solo lectura + reservar (portal de
// alumnos). Con esto, muestra el formulario de publicación y el botón de
// borrar en las ofertas propias (portal de maestros). No hay gate de rol
// "maestro" todavía — cualquier usuario logueado puede publicar; la policy
// de RLS solo exige que el autor sea quien la borra.

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { FilaChips } from "./FilaChips";
import { Seccion } from "./Seccion";
import { MATERIAS_TUTORIA } from "../data/materiasTutoria";
import {
  HiOutlineCreditCard,
  HiOutlineTrash,
  HiOutlineUserGroup,
  HiOutlineXCircle,
} from "react-icons/hi2";

const TTL_RESERVA_MINUTOS = 15;

const MENSAJES_RESERVA = {
  no_autenticado: "Inicia sesión para reservar un asiento.",
  no_puedes_reservar_tu_propia_oferta: "No puedes reservar tu propia oferta.",
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

const DURACIONES_MIN = [60, 90, 120];
const PRECIO_MIN = 50;
const PRECIO_MAX = 5000;

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

function mensajeError(err) {
  if (err?.code === "23514") {
    return "Revisa los datos: alguno no cumple el formato esperado (p. ej. la CLABE debe tener 18 dígitos).";
  }
  if (err?.code === "23503") {
    return "No puedes borrar esta oferta: ya tiene alumnos con una reserva pendiente o pagada. Espera a que se libere (o a que paguen) e intenta de nuevo.";
  }
  return "No se pudo procesar tu solicitud. Intenta de nuevo.";
}

export function PublicacionOfertas({ permitirPublicar = false }) {
  const { user, perfil } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [borrandoId, setBorrandoId] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState({});
  const [reserva, setReserva] = useState(null); // { transaccionId, ofertaId, expiraEn, montoTotal }
  const [reservandoId, setReservandoId] = useState(null);
  const [pagando, setPagando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [info, setInfo] = useState("");
  const [, forceTick] = useState(0);
  const reservaRef = useRef(null);
  reservaRef.current = reserva;

  const [profesor, setProfesor] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [duracionMin, setDuracionMin] = useState(60);
  const [precio, setPrecio] = useState("");
  const [cupo, setCupo] = useState(1);
  const [notas, setNotas] = useState("");
  const [cuentaClave, setCuentaClave] = useState("");

  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (perfil?.nombre && !profesor) setProfesor(perfil.nombre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil?.nombre]);

  async function cargarOfertas() {
    setCargando(true);
    const { data } = await supabase
      .from("ofertas_maestro")
      .select("*")
      .gte("fecha_hora", new Date().toISOString())
      .order("fecha_hora", { ascending: true });
    setOfertas(data ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargarOfertas();
  }, []);

  // El "ping" del paso 1: se corre para cada oferta visible, siempre que
  // esta vista sea de solo-consulta/reserva (portal de alumnos). El portal
  // de maestros no necesita disponibilidad de cupo para publicar/borrar.
  async function cargarDisponibilidad(lista) {
    if (permitirPublicar || lista.length === 0) return;
    const entradas = await Promise.all(
      lista.map(async (oferta) => {
        const { data } = await supabase.rpc("asientos_disponibles_oferta_maestro", {
          p_oferta_id: oferta.id,
        });
        return [oferta.id, data ?? null];
      })
    );
    setDisponibilidad(Object.fromEntries(entradas));
  }

  useEffect(() => {
    if (!cargando) cargarDisponibilidad(ofertas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando, ofertas]);

  // Si Stripe redirige aquí desde el cancel_url de la Checkout Session
  // (?reserva_cancelada=<transaccion_id>), se libera el asiento de una vez
  // en vez de esperar a que el TTL de 15 min lo haga solo.
  useEffect(() => {
    const transaccionId = searchParams.get("reserva_cancelada");
    if (!transaccionId) return;

    (async () => {
      await supabase.rpc("cancelar_reserva_oferta_maestro", { p_transaccion_id: transaccionId });
      if (reservaRef.current?.transaccionId === transaccionId) setReserva(null);
      setInfo("Tu reserva fue cancelada; el asiento quedó libre de nuevo.");
      cargarOfertas();
    })();

    const siguientes = new URLSearchParams(searchParams);
    siguientes.delete("reserva_cancelada");
    setSearchParams(siguientes, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
    // hasta que el TTL la venza solo.
    if (reserva && reserva.ofertaId !== oferta.id) {
      await supabase.rpc("cancelar_reserva_oferta_maestro", { p_transaccion_id: reserva.transaccionId });
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
    await supabase.rpc("cancelar_reserva_oferta_maestro", { p_transaccion_id: reserva.transaccionId });
    setCancelando(false);
    setReserva(null);
    setInfo("Reserva cancelada.");
    cargarOfertas();
  }

  async function publicar() {
    setError("");
    if (!profesor.trim()) return setError("Escribe tu nombre.");
    if (!materiaId) return setError("Selecciona una materia.");
    if (!fecha || !hora) return setError("Elige la fecha y la hora.");

    const fechaHora = new Date(`${fecha}T${hora}:00`);
    if (Number.isNaN(fechaHora.getTime()) || fechaHora.getTime() < Date.now()) {
      return setError("Elige una fecha y hora futuras.");
    }
    const precioNum = Number(precio);
    if (!precioNum || precioNum < PRECIO_MIN || precioNum > PRECIO_MAX) {
      return setError(`El precio debe estar entre $${PRECIO_MIN} y $${PRECIO_MAX} MXN.`);
    }
    const cupoNum = Number(cupo);
    if (!cupoNum || cupoNum < 1 || cupoNum > 50) return setError("El cupo debe ser entre 1 y 50 alumnos.");
    if (notas.length > 500) return setError("Tus notas son muy largas (máximo 500 caracteres).");
    if (!/^\d{18}$/.test(cuentaClave.trim())) return setError("La CLABE debe tener exactamente 18 dígitos.");

    setPublicando(true);
    const { error: insertError } = await supabase.from("ofertas_maestro").insert({
      profesor: profesor.trim(),
      materia_id: materiaId,
      fecha_hora: fechaHora.toISOString(),
      duracion_minutos: duracionMin,
      precio_mxn: precioNum,
      cupo_maximo: cupoNum,
      notas: notas.trim() || null,
      cuenta_clave: cuentaClave.trim(),
    });
    setPublicando(false);

    if (insertError) return setError(mensajeError(insertError));

    setMateriaId("");
    setFecha("");
    setHora("");
    setDuracionMin(60);
    setPrecio("");
    setCupo(1);
    setNotas("");
    setCuentaClave("");
    cargarOfertas();
  }

  async function borrar(oferta) {
    setBorrandoId(oferta.id);
    const { error: deleteError } = await supabase.from("ofertas_maestro").delete().eq("id", oferta.id);
    setBorrandoId(null);
    if (deleteError) return setError(mensajeError(deleteError));
    cargarOfertas();
  }

  const materiaElegida = MATERIAS_TUTORIA.find((m) => m.id === materiaId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && <p style={{ color: "var(--wrong)", fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>}
      {info && <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", margin: 0 }}>{info}</p>}

      {permitirPublicar && (
        <Seccion
          icono={<HiOutlineUserGroup />}
          color="#06b6d4"
          title="Publica una oferta"
          subtitle="Los alumnos la verán en su portal; coordina el resto por WhatsApp."
        >
          <input
            style={inputStyle}
            placeholder="Tu nombre"
            value={profesor}
            onChange={(e) => setProfesor(e.target.value)}
            maxLength={80}
          />

          <div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Materia</p>
            <FilaChips
              opciones={MATERIAS_TUTORIA.map((m) => m.nombre)}
              valor={materiaElegida?.nombre}
              onChange={(nombre) => setMateriaId(MATERIAS_TUTORIA.find((m) => m.nombre === nombre)?.id ?? "")}
              color="#06b6d4"
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input style={inputStyle} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            <input style={inputStyle} type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </div>

          <div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Duración</p>
            <FilaChips
              opciones={DURACIONES_MIN.map((d) => `${d} min`)}
              valor={`${duracionMin} min`}
              onChange={(label) => setDuracionMin(Number(label.replace(" min", "")))}
              color="#06b6d4"
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              style={inputStyle}
              type="number"
              min={PRECIO_MIN}
              max={PRECIO_MAX}
              step={10}
              placeholder={`Precio ($${PRECIO_MIN}-$${PRECIO_MAX})`}
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
            <input
              style={inputStyle}
              type="number"
              min={1}
              max={50}
              placeholder="Cupo máx."
              value={cupo}
              onChange={(e) => setCupo(e.target.value)}
            />
          </div>

          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            maxLength={500}
            placeholder="Notas para tus alumnos (opcional)…"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />

          <input
            style={inputStyle}
            inputMode="numeric"
            placeholder="CLABE (18 dígitos) para recibir el pago"
            value={cuentaClave}
            onChange={(e) => setCuentaClave(e.target.value.replace(/\D/g, "").slice(0, 18))}
            maxLength={18}
          />

          <button
            onClick={publicar}
            disabled={publicando}
            style={{
              minHeight: 44,
              borderRadius: 10,
              border: "none",
              background: "#06b6d4",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: publicando ? "default" : "pointer",
              opacity: publicando ? 0.7 : 1,
            }}
          >
            {publicando ? "Publicando…" : "Publicar oferta"}
          </button>
        </Seccion>
      )}

      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "4px 0 0" }}>
        {permitirPublicar ? "Ofertas publicadas" : "Ofertas disponibles"}
      </p>

      {cargando && <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Cargando…</p>}
      {!cargando && ofertas.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Por ahora no hay ofertas disponibles.</p>
      )}

      {ofertas.map((oferta) => {
          const materia = MATERIAS_TUTORIA.find((m) => m.id === oferta.materia_id);
          const color = materia?.color ?? "#7c5cbf";
          const fechaObj = new Date(oferta.fecha_hora);
          const esPropia = permitirPublicar && user && oferta.creado_por === user.id;
          return (
            <div key={oferta.id} className="sp-card" style={{ margin: 0 }}>
              <div className="sp-card-header">
                <div className="sp-card-icon" style={{ background: `${color}22`, color }}>
                  {materia?.nombre?.[0] ?? "?"}
                </div>
                <div className="sp-card-body">
                  <p className="sp-card-title">
                    {materia?.nombre ?? oferta.materia_id} · {oferta.duracion_minutos} min
                  </p>
                  <p className="sp-card-description">
                    {fechaObj.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
                    {oferta.profesor} · Cupo: {oferta.cupo_maximo}
                  </p>
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

              {!permitirPublicar && (() => {
                const disp = disponibilidad[oferta.id];
                const activa = reserva?.ofertaId === oferta.id;
                const sinCupo = disp && (!disp.vigente || disp.disponibles <= 0);

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
                    disabled={reservandoId === oferta.id || sinCupo || Boolean(reserva)}
                    style={{
                      marginTop: 10,
                      width: "100%",
                      minHeight: 44,
                      borderRadius: 10,
                      border: "none",
                      background: sinCupo ? "var(--surface)" : color,
                      color: sinCupo ? "var(--text-muted)" : "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: reservandoId === oferta.id || sinCupo || reserva ? "default" : "pointer",
                      opacity: reservandoId === oferta.id ? 0.7 : 1,
                    }}
                  >
                    {sinCupo
                      ? disp && !disp.vigente ? "Clase vencida" : "Sin cupo disponible"
                      : reservandoId === oferta.id
                        ? "Reservando…"
                        : disp
                          ? `Reservar asiento (${disp.disponibles} disponibles)`
                          : "Reservar asiento"}
                  </button>
                );
              })()}

              {esPropia && (
                <button
                  type="button"
                  disabled={borrandoId === oferta.id}
                  onClick={() => borrar(oferta)}
                  style={{
                    marginTop: 10,
                    minHeight: 40,
                    borderRadius: 10,
                    border: "1px solid var(--wrong)",
                    background: "transparent",
                    color: "var(--wrong)",
                    fontWeight: 700,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    cursor: borrandoId === oferta.id ? "default" : "pointer",
                    opacity: borrandoId === oferta.id ? 0.6 : 1,
                  }}
                >
                  <HiOutlineTrash /> {borrandoId === oferta.id ? "Borrando…" : "Borrar oferta"}
                </button>
              )}
            </div>
          );
        })}
    </div>
  );
}
