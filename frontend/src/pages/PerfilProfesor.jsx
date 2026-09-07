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
  estadoCalificarProfesor,
  obtenerMiCalificacionProfesor,
  calificarProfesor,
} from "../services/profesores";
import { crearReporteProfesor } from "../services/reportes";

import { AiOutlineClose } from "react-icons/ai";
import { HiOutlineFlag } from "react-icons/hi2";

const DESCRIPCION_REPORTE_MAX = 1000;

const ERRORES_CALIFICAR = {
  compra_no_encontrada: "Solo puedes calificar a un profesor después de tomar una clase pagada con él.",
  estrellas_invalidas: "Elige de 1 a 5 estrellas.",
  comentario_muy_largo: "Tu comentario no puede pasar de 150 caracteres.",
  no_puedes_calificarte: "No puedes calificarte a ti mismo.",
};

function mensajeErrorCalificar(err) {
  const clave = Object.keys(ERRORES_CALIFICAR).find((k) => err?.message?.includes(k));
  return clave ? ERRORES_CALIFICAR[clave] : "No se pudo enviar tu calificación. Intenta de nuevo.";
}

// Motivo puntual por el que no se pueden mostrar las estrellas activas
// (ver RPC `estado_calificar_profesor`) — reemplaza el mensaje genérico
// único que había antes, para poder distinguir "nunca compró" de "su pago
// sigue pendiente" (típico cuando el webhook de Stripe tarda o falla). Ya
// no depende de si la clase ya pasó ni de si ya calificó antes — calificar
// ahora es upsert, así que "ya calificaste" no bloquea nada, solo precarga
// el formulario para editar (ver migraciones 20260907140000 y 20260907150000).
const MENSAJES_ESTADO_CALIFICAR = {
  no_autenticado: "Inicia sesión y compra una clase con este profesor para poder calificarlo.",
  uno_mismo: "No puedes calificarte a ti mismo.",
  pago_no_completado: "Tu pago con este profesor todavía no se confirma. Si ya pagaste, espera unos minutos o contáctanos si sigue igual.",
  sin_compra: "Solo puedes calificar a un profesor después de tomar una clase pagada con él.",
};

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
  const [estadoCalificar, setEstadoCalificar] = useState("no_autenticado");
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
      const estado = user ? await estadoCalificarProfesor(profesorId) : "no_autenticado";
      setEstadoCalificar(estado);
      const mia = estado === "ok" ? await obtenerMiCalificacionProfesor(profesorId) : null;
      setEstrellasNuevas(mia?.estrellas ?? 0);
      setComentarioNuevo(mia?.comentario ?? "");
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

  async function enviarCalificacion(estrellas, comentario) {
    if (enviandoCalificacion) return;
    if (estrellas < 1) return setErrorCalificar("Elige de 1 a 5 estrellas.");
    setErrorCalificar("");
    setEstrellasNuevas(estrellas);
    setEnviandoCalificacion(true);
    try {
      await calificarProfesor(profesorId, estrellas, comentario);
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
  // Distribución 5→1 estrellas para la barra tipo Play Store — se calcula de
  // `reviews` (la lista completa que ya se trajo) en vez de pedirle otra
  // cosa al backend.
  const distribucionEstrellas = [5, 4, 3, 2, 1].map((n) => ({
    estrellas: n,
    cantidad: reviews.filter((r) => r.estrellas === n).length,
  }));
  const maxDistribucion = Math.max(...distribucionEstrellas.map((d) => d.cantidad), 1);
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
            <div className="sp-card" style={{ margin: 0, padding: "22px 20px" }}>
              {/* Fila de app: ícono "squircle" + nombre, como la ficha de una app en Play Store. */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 72, height: 72, borderRadius: 20, flexShrink: 0,
                    boxShadow: "0 4px 14px -4px rgba(124,92,191,0.55)", overflow: "hidden",
                    background: "linear-gradient(135deg, #7c5cbf, #4f3a82)",
                    display: "flex", alignItems: "center", justifyContent: "center",
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
                    <span style={{ fontSize: "1.9rem", fontWeight: 800, color: "#fff" }}>
                      {perfil.nombre?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.25 }}>
                    {perfil.nombre}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0" }}>
                    Profesor en PrepaApp
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "1px 0 0" }}>
                    Desde {fmtFecha(perfil.creado_en)}
                  </p>
                </div>
              </div>

              <div style={{ height: 1, background: "var(--surface)", margin: "18px 0" }} />

              {/* Resumen de calificación: número grande + estrellas a la izquierda, distribución por estrella a la derecha — igual que la ficha de una app en Play Store. */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ textAlign: "center", flexShrink: 0, width: 64 }}>
                  <p style={{ fontSize: 34, fontWeight: 800, color: "var(--text)", margin: 0, lineHeight: 1 }}>
                    {(Number(perfil.calificacion_promedio) || 0).toFixed(1)}
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 0" }}>
                    <Estrellas value={Number(perfil.calificacion_promedio) || 0} size={12} />
                  </div>
                  <p style={{ fontSize: 10.5, color: "var(--text-muted)", margin: "3px 0 0" }}>
                    {perfil.numero_calificaciones ?? 0} {perfil.numero_calificaciones === 1 ? "reseña" : "reseñas"}
                  </p>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  {distribucionEstrellas.map(({ estrellas: n, cantidad }) => (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", width: 7, flexShrink: 0 }}>{n}</span>
                      <div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--surface)", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${maxDistribucion > 0 ? (cantidad / maxDistribucion) * 100 : 0}%`,
                            height: "100%", background: "#f5b942", borderRadius: 999,
                            transition: "width 300ms ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {materias.length > 0 && (
                <>
                  <div style={{ height: 1, background: "var(--surface)", margin: "18px 0 14px" }} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {materias.map((nombre) => (
                      <span
                        key={nombre}
                        style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", background: "var(--surface)", borderRadius: 999, padding: "5px 12px" }}
                      >
                        {nombre}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div
              className="sp-card"
              style={{ margin: 0, padding: "22px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
            >
              <Estrellas
                value={estrellasNuevas}
                onChange={estadoCalificar === "ok" ? (n) => enviarCalificacion(n, comentarioNuevo) : undefined}
                disabled={estadoCalificar !== "ok" || enviandoCalificacion}
                size={24}
              />

              {estadoCalificar === "ok" && (
                <>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "-2px 0 4px", textAlign: "center" }}>
                    {estrellasNuevas > 0 ? "Puedes editar tu calificación y comentario cuando quieras" : "Toca una estrella para calificar"}
                  </p>
                  <textarea
                    style={{
                      width: "100%", minHeight: 60, resize: "vertical", boxSizing: "border-box",
                      background: "var(--surface)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12, padding: "12px 14px", color: "var(--text)", fontSize: "0.9rem",
                      outline: "none", transition: "border-color 120ms ease",
                    }}
                    maxLength={150}
                    placeholder="Escribe o edita tu reseña (opcional)…"
                    value={comentarioNuevo}
                    onChange={(e) => setComentarioNuevo(e.target.value.slice(0, 150))}
                    disabled={enviandoCalificacion}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{comentarioNuevo.length}/150</span>
                    <button
                      onClick={() => enviarCalificacion(estrellasNuevas, comentarioNuevo)}
                      disabled={enviandoCalificacion || estrellasNuevas < 1}
                      style={{
                        minHeight: 38, padding: "0 18px", borderRadius: 10, border: "none",
                        background: "#f5b942", color: "#1a1a2e", fontWeight: 700, fontSize: 13,
                        cursor: enviandoCalificacion || estrellasNuevas < 1 ? "default" : "pointer",
                        opacity: enviandoCalificacion || estrellasNuevas < 1 ? 0.6 : 1,
                        transition: "opacity 120ms ease",
                      }}
                    >
                      {enviandoCalificacion ? "Guardando…" : "Guardar comentario"}
                    </button>
                  </div>
                </>
              )}

              {estadoCalificar !== "ok" && (
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: 0, textAlign: "center" }}>
                  {MENSAJES_ESTADO_CALIFICAR[estadoCalificar] ?? MENSAJES_ESTADO_CALIFICAR.sin_compra}
                </p>
              )}
              {errorCalificar && <p style={{ color: "var(--wrong)", fontSize: 13, margin: 0 }}>{errorCalificar}</p>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 0" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0, whiteSpace: "nowrap" }}>
                Calificaciones ({reviews.length})
              </p>
              <div style={{ height: 1, background: "var(--surface2)", flex: 1 }} />
            </div>

            {reviews.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                Este profesor todavía no tiene calificaciones.
              </p>
            )}

            {/* Una sola tarjeta contenedora con filas separadas por línea, como
                la lista plana de reseñas de una app en Play Store — en vez de
                una tarjeta apilada por reseña. */}
            {reviews.length > 0 && (
              <div className="sp-card" style={{ margin: 0, padding: 0, overflow: "hidden" }}>
                {reviews.map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "14px 18px",
                      borderTop: i === 0 ? "none" : "0.5px solid var(--surface)",
                      background: r.es_propia ? "rgba(245,185,66,0.07)" : "transparent",
                      borderLeft: r.es_propia ? "3px solid #f5b942" : "3px solid transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                          background: r.es_propia ? "#f5b942" : "var(--surface2)",
                          color: r.es_propia ? "#1a1a2e" : "var(--text-muted)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12.5, fontWeight: 800,
                        }}
                      >
                        {r.calificador_nombre?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.calificador_nombre}
                          </p>
                          {r.es_propia && (
                            <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.3, color: "#f5b942", background: "rgba(245,185,66,0.16)", borderRadius: 999, padding: "2px 7px", flexShrink: 0 }}>
                              TÚ
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <Estrellas value={r.estrellas} size={12} />
                          <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>· {fmtFecha(r.creado_en)}</span>
                        </div>
                      </div>
                    </div>
                    {r.comentario && (
                      <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "8px 0 0", lineHeight: 1.5 }}>{r.comentario}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

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
          </>
        )}
      </main>
    </div>
  );
}
