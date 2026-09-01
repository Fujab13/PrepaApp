// PerfilProfesor.jsx
// Página pública tipo "perfil de vendedor" (Amazon) para un profesor de
// `ofertas_maestro`: info básica, calificación promedio y el listado de
// reviews (estrellas + comentario corto) que le dejaron los alumnos que ya
// le compraron una clase. Se llega aquí desde el nombre/estrellas de un
// profesor en PublicacionOfertas.jsx (Alumnos → ofertas disponibles).
// Elegibilidad para calificar y el propio insert se revalidan siempre en el
// backend (ver migración 20260826140000_calificaciones_profesor.sql) — el
// frontend solo decide si MOSTRAR el formulario.

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Estrellas } from "../components/Estrellas";
import { Seccion } from "../components/Seccion";
import { MATERIAS_TUTORIA } from "../data/materiasTutoria";
import { MOTIVOS_REPORTE, ETIQUETA_GRAVEDAD } from "../data/motivosReporte";
import {
  obtenerPerfilProfesor,
  obtenerCalificacionesProfesor,
  puedoCalificarProfesor,
  calificarProfesor,
} from "../services/profesores";
import { crearReporteProfesor } from "../services/reportes";

import { AiOutlineClose } from "react-icons/ai";
import { HiOutlineChatBubbleLeftRight, HiOutlineFlag } from "react-icons/hi2";

const COMENTARIO_MAX = 150;
const DESCRIPCION_REPORTE_MAX = 1000;

const ERRORES_CALIFICAR = {
  compra_no_encontrada: "Solo puedes calificar a un profesor después de tomar una clase pagada con él.",
  ya_calificaste: "Ya calificaste a este profesor.",
  estrellas_invalidas: "Elige de 1 a 5 estrellas.",
  comentario_muy_largo: `Tu comentario no puede pasar de ${COMENTARIO_MAX} caracteres.`,
  no_puedes_calificarte: "No puedes calificarte a ti mismo.",
};

function mensajeErrorCalificar(err) {
  const clave = Object.keys(ERRORES_CALIFICAR).find((k) => err?.message?.includes(k));
  return clave ? ERRORES_CALIFICAR[clave] : "No se pudo enviar tu calificación. Intenta de nuevo.";
}

const ERRORES_REPORTE = {
  categoria_requerida: "Elige qué tipo de problema tuviste.",
  descripcion_muy_corta: "Cuéntanos un poco más de lo que pasó (mínimo 10 caracteres).",
  descripcion_muy_larga: `Tu descripción no puede pasar de ${DESCRIPCION_REPORTE_MAX} caracteres.`,
  contacto_muy_largo: "Ese contacto es muy largo.",
  profesor_no_encontrado: "No encontramos a este profesor.",
};

function mensajeErrorReporte(err) {
  const clave = Object.keys(ERRORES_REPORTE).find((k) => err?.message?.includes(k));
  return clave ? ERRORES_REPORTE[clave] : "No se pudo enviar tu reporte. Intenta de nuevo.";
}

function fmtFecha(ts) {
  return ts ? new Date(ts).toLocaleDateString("es-MX", { dateStyle: "medium" }) : "—";
}

export default function PerfilProfesor() {
  const navigate = useNavigate();
  const { profesorId } = useParams();
  const { user, cargando: cargandoAuth } = useAuth();

  const [perfil, setPerfil] = useState(undefined); // undefined = cargando, null = no encontrado
  const [reviews, setReviews] = useState([]);
  const [puedeCalificar, setPuedeCalificar] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [avatarError, setAvatarError] = useState(false);

  const [estrellasNuevas, setEstrellasNuevas] = useState(0);
  const [comentarioNuevo, setComentarioNuevo] = useState("");
  const [enviandoCalificacion, setEnviandoCalificacion] = useState(false);
  const [errorCalificar, setErrorCalificar] = useState("");

  // Reporte anónimo (no requiere sesión iniciada).
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [categoriaReporte, setCategoriaReporte] = useState("");
  const [descripcionReporte, setDescripcionReporte] = useState("");
  const [contactoReporte, setContactoReporte] = useState("");
  const [enviandoReporte, setEnviandoReporte] = useState(false);
  const [errorReporte, setErrorReporte] = useState("");
  const [reporteEnviado, setReporteEnviado] = useState(false);

  async function cargarTodo() {
    setCargando(true);
    setError("");
    setAvatarError(false);
    try {
      const [perfilData, reviewsData] = await Promise.all([
        obtenerPerfilProfesor(profesorId),
        obtenerCalificacionesProfesor(profesorId),
      ]);
      setPerfil(perfilData);
      setReviews(reviewsData);
      setPuedeCalificar(user ? await puedoCalificarProfesor(profesorId) : false);
    } catch {
      setError("No se pudo cargar el perfil del profesor.");
    }
    setCargando(false);
  }

  useEffect(() => {
    if (cargandoAuth || !profesorId) return;
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profesorId, cargandoAuth, user]);

  async function enviarCalificacion() {
    setErrorCalificar("");
    if (estrellasNuevas < 1) return setErrorCalificar("Elige de 1 a 5 estrellas.");

    setEnviandoCalificacion(true);
    try {
      await calificarProfesor(profesorId, estrellasNuevas, comentarioNuevo.trim());
      setEstrellasNuevas(0);
      setComentarioNuevo("");
      await cargarTodo();
    } catch (err) {
      setErrorCalificar(mensajeErrorCalificar(err));
    }
    setEnviandoCalificacion(false);
  }

  async function enviarReporte() {
    setErrorReporte("");
    if (!categoriaReporte) return setErrorReporte("Elige qué tipo de problema tuviste.");
    if (descripcionReporte.trim().length < 10) {
      return setErrorReporte("Cuéntanos un poco más de lo que pasó (mínimo 10 caracteres).");
    }

    const motivo = MOTIVOS_REPORTE.find((m) => m.id === categoriaReporte);
    setEnviandoReporte(true);
    try {
      await crearReporteProfesor({
        profesorUserId: profesorId,
        categoria: categoriaReporte,
        gravedad: motivo?.gravedad ?? "leve",
        descripcion: descripcionReporte.trim(),
        contacto: contactoReporte.trim(),
      });
      setReporteEnviado(true);
      setMostrarReporte(false);
      setCategoriaReporte("");
      setDescripcionReporte("");
      setContactoReporte("");
    } catch (err) {
      setErrorReporte(mensajeErrorReporte(err));
    }
    setEnviandoReporte(false);
  }

  const materias = (perfil?.materias || []).map((id) => MATERIAS_TUTORIA.find((m) => m.id === id)?.nombre ?? id);
  // d=404 (no "mp"/mystery-person") para que Gravatar responda 404 cuando el
  // correo no tiene foto registrada, y así sí dispare el onError de abajo y
  // caiga al círculo con inicial — con "mp" Gravatar siempre regresa 200 con
  // una silueta genérica y el fallback de inicial nunca se llegaba a usar.
  const avatarSrc = perfil?.avatar_url || (perfil?.avatar_hash ? `https://www.gravatar.com/avatar/${perfil.avatar_hash}?d=404&s=176` : null);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate(-1)} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Perfil del profesor</h2>
      </header>

      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 16 }}>
        {(cargandoAuth || cargando) && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>Cargando…</p>
        )}

        {error && <p style={{ color: "var(--wrong)", fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>}

        {!cargando && perfil === null && (
          <div className="sp-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", margin: 0 }}>No encontramos a este profesor.</p>
          </div>
        )}

        {!cargando && perfil && (
          <>
            <div className="sp-card" style={{ margin: 0, padding: "28px 20px", textAlign: "center" }}>
              <div
                style={{
                  width: 88, height: 88, borderRadius: "50%", margin: "0 auto 16px",
                  border: "3px solid var(--surface2)", overflow: "hidden",
                  background: "linear-gradient(135deg, #7c5cbf, #4f3a82)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                {avatarSrc && !avatarError ? (
                  <img
                    src={avatarSrc}
                    alt={perfil.nombre}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>
                    {perfil.nombre?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </div>

              <p style={{ fontSize: 19, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
                {perfil.nombre}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 16px" }}>
                Profesor en PrepaApp desde {fmtFecha(perfil.creado_en)}
              </p>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <Estrellas
                  value={Number(perfil.calificacion_promedio) || 0}
                  count={perfil.numero_calificaciones ?? 0}
                  size={18}
                />
              </div>

              {materias.length > 0 && (
                <>
                  <div style={{ height: 1, background: "var(--surface2)", margin: "18px 0 14px" }} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                    {materias.map((nombre) => (
                      <span
                        key={nombre}
                        style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", background: "var(--surface2)", borderRadius: 999, padding: "4px 10px" }}
                      >
                        {nombre}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {!mostrarReporte && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => { setReporteEnviado(false); setMostrarReporte(true); }}
                  style={{
                    minHeight: 44, padding: "0 22px", borderRadius: 10,
                    border: "1.5px solid #ef4444", background: "rgba(239,68,68,0.12)",
                    color: "#ef4444", fontWeight: 700, fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <HiOutlineFlag style={{ fontSize: 17 }} /> Reportar a este profesor
                </button>
              </div>
            )}

            {reporteEnviado && (
              <p style={{ color: "var(--correct)", fontSize: 13, textAlign: "center", margin: 0 }}>
                Gracias, tu reporte fue enviado. El equipo lo va a revisar.
              </p>
            )}

            {mostrarReporte && (
              <Seccion
                icono={<HiOutlineFlag />}
                color="#ef4444"
                title="Reportar a este profesor"
                subtitle="Tu reporte se puede enviar sin iniciar sesión ni dar tu nombre."
              >
                <div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>¿Qué tipo de problema tuviste?</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {MOTIVOS_REPORTE.map((m) => {
                      const activo = categoriaReporte === m.id;
                      const color = ETIQUETA_GRAVEDAD[m.gravedad].color;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setCategoriaReporte(m.id)}
                          style={{
                            minHeight: 40, display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                            borderRadius: 12, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                            border: activo ? `1.5px solid ${color}` : "0.5px solid var(--surface)",
                            background: activo ? `${color}1f` : "var(--surface)",
                            color: activo ? color : "var(--text)",
                          }}
                        >
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
                          {m.etiqueta}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <textarea
                  style={{
                    width: "100%", minHeight: 90, resize: "vertical", boxSizing: "border-box",
                    background: "var(--surface)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12, padding: "12px 14px", color: "var(--text)", fontSize: "0.9rem", outline: "none",
                  }}
                  maxLength={DESCRIPCION_REPORTE_MAX}
                  placeholder="Cuéntanos exactamente qué pasó (mínimo 10 caracteres)…"
                  value={descripcionReporte}
                  onChange={(e) => setDescripcionReporte(e.target.value.slice(0, DESCRIPCION_REPORTE_MAX))}
                />
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, textAlign: "right" }}>
                  {descripcionReporte.length}/{DESCRIPCION_REPORTE_MAX}
                </p>

                <input
                  style={{
                    width: "100%", minHeight: 44, boxSizing: "border-box",
                    background: "var(--surface)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12, padding: "12px 14px", color: "var(--text)", fontSize: "0.9rem", outline: "none",
                  }}
                  placeholder="Tu Correo de contacto ( opcional )"
                  value={contactoReporte}
                  onChange={(e) => setContactoReporte(e.target.value)}
                  maxLength={200}
                />

                {errorReporte && <p style={{ color: "var(--wrong)", fontSize: 13, margin: 0 }}>{errorReporte}</p>}

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => { setMostrarReporte(false); setErrorReporte(""); }}
                    style={{ minHeight: 44, borderRadius: 10, border: "1px solid var(--surface2)", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={enviarReporte}
                    disabled={enviandoReporte}
                    style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 14, cursor: enviandoReporte ? "default" : "pointer", opacity: enviandoReporte ? 0.7 : 1 }}
                  >
                    {enviandoReporte ? "Enviando…" : "Enviar reporte"}
                  </button>
                </div>
              </Seccion>
            )}

            {user && puedeCalificar && (
              <Seccion
                icono={<HiOutlineChatBubbleLeftRight />}
                color="#f5b942"
                title="Califica a tu profesor"
                subtitle="Ya tomaste una clase con él o ella; cuéntanos qué tal te fue."
              >
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Estrellas value={estrellasNuevas} onChange={setEstrellasNuevas} size={26} />
                </div>
                <textarea
                  style={{
                    width: "100%", minHeight: 70, resize: "vertical", boxSizing: "border-box",
                    background: "var(--surface)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12, padding: "12px 14px", color: "var(--text)", fontSize: "0.9rem", outline: "none",
                  }}
                  maxLength={COMENTARIO_MAX}
                  placeholder="Tu comentario (opcional)…"
                  value={comentarioNuevo}
                  onChange={(e) => setComentarioNuevo(e.target.value.slice(0, COMENTARIO_MAX))}
                />
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, textAlign: "right" }}>
                  {comentarioNuevo.length}/{COMENTARIO_MAX}
                </p>

                {errorCalificar && <p style={{ color: "var(--wrong)", fontSize: 13, margin: 0 }}>{errorCalificar}</p>}

                <button
                  onClick={enviarCalificacion}
                  disabled={enviandoCalificacion}
                  style={{ minHeight: 44, borderRadius: 10, border: "none", background: "#f5b942", color: "#1a1a2e", fontWeight: 700, fontSize: 14, cursor: enviandoCalificacion ? "default" : "pointer", opacity: enviandoCalificacion ? 0.7 : 1 }}
                >
                  {enviandoCalificacion ? "Enviando…" : "Enviar calificación"}
                </button>
              </Seccion>
            )}

            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "4px 0 0" }}>
              Calificaciones ({reviews.length})
            </p>

            {reviews.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                Este profesor todavía no tiene calificaciones.
              </p>
            )}

            {reviews.map((r, i) => (
              <div key={i} className="sp-card" style={{ margin: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <Estrellas value={r.estrellas} size={14} />
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{fmtFecha(r.creado_en)}</span>
                </div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)", margin: "6px 0 0" }}>{r.calificador_nombre}</p>
                {r.comentario && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0", lineHeight: 1.5 }}>{r.comentario}</p>
                )}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
