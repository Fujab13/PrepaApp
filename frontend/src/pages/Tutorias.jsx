// Tutorias.jsx
// Reserva de una clase 1-a-1 paga con un maestro contratado externamente.
// Requiere sesión + haber completado Examen Simulador y Formulario Área
// (ambos se verifican server-side en el RPC de todas formas — esto solo
// evita que el alumno llegue al formulario para nada). El precio y el
// maestro asignado los calcula/elige el RPC `crear_solicitud_tutoria`,
// nunca el cliente. El pago va por Stripe Connect (mismo patrón de
// redirect que Store.jsx).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { FilaChips } from "../components/FilaChips";
import { MATERIAS_TUTORIA } from "../data/materiasTutoria";

import { AiOutlineClose } from "react-icons/ai";
import { PiChalkboardTeacher } from "react-icons/pi";
import { HiOutlineCalendarDays, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

const DURACIONES = [
  { label: "60 min", minutos: 60 },
  { label: "90 min", minutos: 90 },
  { label: "120 min", minutos: 120 },
];

const MENSAJES_ERROR = {
  antelacion_insuficiente: "Elige un horario con al menos 24 horas de anticipación.",
  materia_invalida: "Selecciona una materia válida.",
  duracion_invalida: "Selecciona una duración válida.",
  notas_muy_largas: "Tus notas son muy largas (máximo 500 caracteres).",
  falta_examen: "Primero debes completar el Examen Simulador.",
  falta_formulario: "Primero debes completar el Formulario Área.",
  sin_profesor_disponible: "Aún no tenemos un maestro disponible para esa materia u horario.",
  horario_no_disponible: "Ese horario ya se acaba de ocupar, elige otro.",
  no_autenticado: "Inicia sesión para continuar.",
};

function mensajeError(err) {
  const code = Object.keys(MENSAJES_ERROR).find((c) => err?.message?.includes(c));
  return code ? MENSAJES_ERROR[code] : "No se pudo procesar tu solicitud. Intenta de nuevo.";
}

const inputStyle = {
  width: "100%",
  minHeight: 44,
  background: "var(--surface2)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  padding: "12px 14px",
  color: "var(--text)",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
};

function Seccion({ icono, color, title, subtitle, children }) {
  return (
    <div className="sp-card">
      <div className="sp-card-header">
        <div className="sp-card-icon" style={{ background: `${color}22`, color }}>
          {icono}
        </div>
        <div className="sp-card-body">
          <p className="sp-card-title">{title}</p>
          {subtitle && <p className="sp-card-description">{subtitle}</p>}
        </div>
      </div>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

export default function Tutorias() {
  const navigate = useNavigate();
  const { user, cargando: cargandoAuth } = useAuth();

  const [examenOk, setExamenOk] = useState(null); // null = cargando
  const [formularioOk, setFormularioOk] = useState(null);

  const [materiaId, setMateriaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [duracionMin, setDuracionMin] = useState(60);
  const [notas, setNotas] = useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [solicitud, setSolicitud] = useState(null);

  useEffect(() => {
    if (!user) return;
    let activo = true;

    (async () => {
      const [{ data: examenRows }, { data: formularioRows }] = await Promise.all([
        supabase.from("resultados_examen").select("id").limit(1),
        supabase.from("formularios_area").select("id").limit(1),
      ]);
      if (!activo) return;
      setExamenOk(Boolean(examenRows?.length));
      setFormularioOk(Boolean(formularioRows?.length));
    })();

    return () => { activo = false; };
  }, [user]);

  async function solicitarTutoria() {
    setError("");
    if (!materiaId) return setError("Selecciona una materia.");
    if (!fecha || !hora) return setError("Elige la fecha y la hora de tu clase.");

    const fechaHora = new Date(`${fecha}T${hora}:00`);
    if (Number.isNaN(fechaHora.getTime())) return setError("Fecha u hora inválida.");
    if (fechaHora.getTime() < Date.now() + 24 * 60 * 60 * 1000) {
      return setError("Elige un horario con al menos 24 horas de anticipación.");
    }
    if (notas.length > 500) return setError("Tus notas son muy largas (máximo 500 caracteres).");

    setCargando(true);
    const { data, error: rpcError } = await supabase.rpc("crear_solicitud_tutoria", {
      p_materia_id: materiaId,
      p_fecha_hora: fechaHora.toISOString(),
      p_duracion_minutos: duracionMin,
      p_notas: notas.trim() || null,
    });
    setCargando(false);

    if (rpcError) return setError(mensajeError(rpcError));
    setSolicitud(data);
  }

  async function pagar() {
    setPagando(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crear-sesion-pago-tutoria`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ solicitud_id: solicitud.id }),
        }
      );
      const data = await res.json();

      if (!res.ok || data.error || !data.url) {
        setError(data.error || "No se pudo iniciar el pago.");
        setPagando(false);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError("No se pudo iniciar el pago.");
      setPagando(false);
    }
  }

  const materiaElegida = MATERIAS_TUTORIA.find((m) => m.id === materiaId);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ── BARRA SUPERIOR ── */}
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <span className="page-topbar-btn" style={{ fontSize: "1.35rem" }}>
          <PiChalkboardTeacher />
        </span>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Tutorías 1-a-1</h2>
      </header>

      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 100, display: "flex", flexDirection: "column", gap: 16 }}>

        {(cargandoAuth) && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>Cargando…</p>
        )}

        {!cargandoAuth && !user && (
          <div className="sp-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 12 }}>
              Necesitas iniciar sesión para reservar una tutoría.
            </p>
            <button
              onClick={() => navigate("/login?modo=login")}
              style={{ minHeight: 44, padding: "0 20px", borderRadius: 10, border: "none", background: "#7c5cbf", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {!cargandoAuth && user && (examenOk === null || formularioOk === null) && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>Verificando tus reportes…</p>
        )}

        {!cargandoAuth && user && examenOk !== null && formularioOk !== null && (!examenOk || !formularioOk) && (
          <div className="sp-card">
            <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 12 }}>
              Antes de reservar una tutoría, tu maestro necesita ver tu diagnóstico. Te falta completar:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {!examenOk && (
                <button
                  onClick={() => navigate("/examen")}
                  style={{ minHeight: 44, borderRadius: 10, border: "0.5px solid var(--surface2)", background: "var(--surface2)", color: "var(--text)", fontWeight: 600, cursor: "pointer" }}
                >
                  Completar Examen Simulador
                </button>
              )}
              {!formularioOk && (
                <button
                  onClick={() => navigate("/formulario-area")}
                  style={{ minHeight: 44, borderRadius: 10, border: "0.5px solid var(--surface2)", background: "var(--surface2)", color: "var(--text)", fontWeight: 600, cursor: "pointer" }}
                >
                  Completar Formulario Área
                </button>
              )}
            </div>
          </div>
        )}

        {!cargandoAuth && user && examenOk && formularioOk && !solicitud && (
          <>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
              Elige materia y horario (con al menos 24 horas de anticipación). Te asignaremos un maestro y verás el precio antes de pagar.
            </p>

            <Seccion icono={<PiChalkboardTeacher />} color="#7c5cbf" title="Materia">
              <FilaChips
                opciones={MATERIAS_TUTORIA.map((m) => m.nombre)}
                valor={materiaElegida?.nombre}
                onChange={(nombre) => setMateriaId(MATERIAS_TUTORIA.find((m) => m.nombre === nombre)?.id ?? "")}
                color="#7c5cbf"
              />
            </Seccion>

            <Seccion icono={<HiOutlineCalendarDays />} color="#06b6d4" title="Fecha y hora" subtitle="Mínimo 24 horas de anticipación.">
              <div style={{ display: "flex", gap: 10 }}>
                <input style={inputStyle} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                <input style={inputStyle} type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
              </div>
              <div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Duración</p>
                <FilaChips
                  opciones={DURACIONES.map((d) => d.label)}
                  valor={DURACIONES.find((d) => d.minutos === duracionMin)?.label}
                  onChange={(label) => setDuracionMin(DURACIONES.find((d) => d.label === label)?.minutos ?? 60)}
                  color="#06b6d4"
                />
              </div>
            </Seccion>

            <Seccion icono={<HiOutlineChatBubbleLeftRight />} color="#ec4899" title="Notas para tu maestro (opcional)" subtitle="La clase se enfoca en tus áreas débiles del examen, pero puede variar un poco si nos dices qué necesitas.">
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                maxLength={500}
                placeholder="Ej. me gustaría repasar fracciones antes que nada…"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </Seccion>

            {error && <p style={{ color: "var(--wrong)", fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>}
          </>
        )}

        {solicitud && (
          <div className="sp-card">
            <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 4, fontWeight: 700 }}>Tu solicitud está lista</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
              {MATERIAS_TUTORIA.find((m) => m.id === solicitud.materia_id)?.nombre} · {solicitud.duracion_minutos} min ·{" "}
              {new Date(solicitud.fecha_hora_solicitada).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#7c5cbf", margin: "0 0 12px" }}>
              ${Number(solicitud.precio_total_mxn).toFixed(2)} MXN
            </p>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 16 }}>
              Al pagar, se confirma tu clase y se te pondrá en contacto automáticamente con tu maestro.
            </p>
            {error && <p style={{ color: "var(--wrong)", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{error}</p>}
            <button
              onClick={pagar}
              disabled={pagando}
              style={{ width: "100%", minHeight: 44, borderRadius: 10, border: "none", background: "#7c5cbf", color: "#fff", fontWeight: 700, cursor: pagando ? "default" : "pointer", opacity: pagando ? 0.7 : 1 }}
            >
              {pagando ? "Redirigiendo…" : "Pagar y confirmar"}
            </button>
          </div>
        )}
      </main>

      {!cargandoAuth && user && examenOk && formularioOk && !solicitud && (
        <footer className="page-footer-fixed">
          <button
            onClick={solicitarTutoria}
            disabled={cargando}
            className="btn-footer-scroll"
            style={{ flex: 1, minHeight: 44, background: "#7c5cbf", color: "#fff", border: "none", fontSize: 14, opacity: cargando ? 0.7 : 1 }}
          >
            {cargando ? "Buscando maestro…" : "Solicitar tutoría"}
          </button>
        </footer>
      )}
    </div>
  );
}
