// AdminReportes.jsx
// Cola de reportes contra profesores (RPCs `admin_listar_reportes` /
// `admin_actualizar_estado_reporte`, migración
// 20260826150000_reportes_profesor.sql). Cualquiera puede dejar un reporte
// sin cuenta desde PerfilProfesor.jsx; aquí el admin los revisa ordenados
// por gravedad y cambia su estado conforme los atiende. El filtro por
// estado y la búsqueda son puramente client-side sobre la lista ya
// cargada (mismo patrón que AdminMaestros.jsx) — el dataset esperado es
// chico, no vale la pena una RPC nueva solo para filtrar.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listarReportesAdmin, actualizarEstadoReporte } from "../services/reportes";
import { MOTIVOS_REPORTE, ETIQUETA_GRAVEDAD } from "../data/motivosReporte";

import { AiOutlineClose } from "react-icons/ai";
import {
  HiOutlineFlag,
  HiOutlineClipboardDocument,
  HiCheckCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineInboxStack,
} from "react-icons/hi2";

const ESTADOS = [
  { id: "pendiente", etiqueta: "Pendiente", color: "#eab308", icono: HiOutlineClock },
  { id: "en_revision", etiqueta: "En revisión", color: "#4f8ef7", icono: HiOutlineEye },
  { id: "resuelto", etiqueta: "Resuelto", color: "#4ade80", icono: HiOutlineCheckCircle },
  { id: "descartado", etiqueta: "Descartado", color: "#846c89", icono: HiOutlineXCircle },
];

const FILTROS = [{ id: "", etiqueta: "Todos", color: "#7c5cbf", icono: null }, ...ESTADOS];

function fmtFecha(ts) {
  return ts ? new Date(ts).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export default function AdminReportes() {
  const navigate = useNavigate();
  const { user, cargando: cargandoAuth, esAdmin } = useAuth();

  const [reportes, setReportes] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      setReportes(await listarReportesAdmin());
    } catch {
      setError("No se pudieron cargar los reportes.");
    }
    setCargando(false);
  }

  useEffect(() => {
    if (!user || !esAdmin) return;
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, esAdmin]);

  async function copiarCorreo(reporte) {
    try {
      await navigator.clipboard.writeText(reporte.profesor_email);
      setCopiadoId(reporte.id);
      setTimeout(() => setCopiadoId(null), 2000);
    } catch {
      // Clipboard puede fallar sin HTTPS/permiso; el correo sigue visible en pantalla.
    }
  }

  async function cambiarEstado(reporte, estado) {
    if (reporte.estado === estado) return;
    setProcesandoId(reporte.id);
    try {
      await actualizarEstadoReporte(reporte.id, estado);
      await cargar();
    } catch {
      setError("No se pudo actualizar ese reporte.");
    }
    setProcesandoId(null);
  }

  const conteos = useMemo(() => {
    const c = { "": reportes?.length ?? 0 };
    for (const e of ESTADOS) c[e.id] = reportes?.filter((r) => r.estado === e.id).length ?? 0;
    return c;
  }, [reportes]);

  function coincideBusqueda(r) {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      r.profesor_nombre?.toLowerCase().includes(q) ||
      r.profesor_email?.toLowerCase().includes(q)
    );
  }

  const reportesFiltrados = useMemo(() => {
    return (reportes ?? []).filter((r) => (!filtroEstado || r.estado === filtroEstado) && coincideBusqueda(r));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportes, filtroEstado, busqueda]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Reportes</h2>
          {!cargandoAuth && user && esAdmin && !cargando && (
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "2px 0 0" }}>
              Cola de moderación · {conteos.pendiente} pendiente{conteos.pendiente === 1 ? "" : "s"}
            </p>
          )}
        </div>
      </header>

      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 14 }}>
        {cargandoAuth && <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>Cargando…</p>}

        {!cargandoAuth && !user && (
          <div className="sp-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 12 }}>Necesitas iniciar sesión para ver esta página.</p>
            <button
              onClick={() => navigate("/login?modo=login")}
              style={{ minHeight: 44, padding: "0 20px", borderRadius: 10, border: "none", background: "#06b6d4", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {!cargandoAuth && user && !esAdmin && (
          <div className="sp-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", margin: 0 }}>No tienes permiso para ver esta página.</p>
          </div>
        )}

        {!cargandoAuth && user && esAdmin && (
          <>
            {error && <p style={{ color: "var(--wrong)", fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>}

            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <HiOutlineMagnifyingGlass style={{ position: "absolute", left: 14, color: "var(--text-muted)", fontSize: 16, pointerEvents: "none" }} />
              <input
                style={{
                  width: "100%", minHeight: 44, boxSizing: "border-box", paddingLeft: 40, paddingRight: 14,
                  background: "var(--surface)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12,
                  color: "var(--text)", fontSize: "0.9rem", outline: "none",
                }}
                placeholder="Buscar por profesor o correo…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, marginBottom: -2 }}>
              {FILTROS.map((f) => {
                const activo = filtroEstado === f.id;
                return (
                  <button
                    key={f.id || "todos"}
                    type="button"
                    onClick={() => setFiltroEstado(f.id)}
                    style={{
                      flexShrink: 0, minHeight: 40, padding: "0 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                      border: activo ? `1.5px solid ${f.color}` : "1px solid var(--surface2)",
                      background: activo ? `${f.color}1f` : "var(--surface)",
                      color: activo ? f.color : "var(--text-muted)",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {f.icono && <f.icono style={{ fontSize: 14 }} />}
                    {f.etiqueta}
                    <span
                      style={{
                        minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, fontSize: 10.5, fontWeight: 800,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        background: activo ? f.color : "var(--surface2)", color: activo ? "#0f0f1a" : "var(--text-muted)",
                      }}
                    >
                      {conteos[f.id] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {cargando && <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: "8px 0" }}>Cargando…</p>}

            {!cargando && (reportes?.length ?? 0) === 0 && (
              <div className="sp-card" style={{ margin: 0, alignItems: "center", textAlign: "center", padding: "32px 20px" }}>
                <HiOutlineInboxStack style={{ fontSize: 32, color: "var(--text-muted)" }} />
                <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "10px 0 0" }}>No hay reportes todavía.</p>
              </div>
            )}

            {!cargando && (reportes?.length ?? 0) > 0 && reportesFiltrados.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: "8px 0" }}>
                Ningún reporte coincide con tu búsqueda o filtro.
              </p>
            )}

            {reportesFiltrados.map((r) => {
              const motivo = MOTIVOS_REPORTE.find((m) => m.id === r.categoria);
              const gravedad = ETIQUETA_GRAVEDAD[r.gravedad] ?? ETIQUETA_GRAVEDAD.leve;
              return (
                <div
                  key={r.id}
                  className="sp-card"
                  style={{ margin: 0, borderLeft: `4px solid ${gravedad.color}`, gap: 12 }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 10.5, fontWeight: 800, color: gravedad.color, background: `${gravedad.color}1f`,
                          borderRadius: 999, padding: "3px 10px", textTransform: "uppercase", letterSpacing: 0.5,
                        }}
                      >
                        {gravedad.texto}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>
                        {motivo?.etiqueta ?? r.categoria}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {fmtFecha(r.creado_en)}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: "rgba(124,92,191,0.15)", color: "#7c5cbf",
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15,
                      }}
                    >
                      {r.profesor_nombre?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      {r.profesor_user_id ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/perfil-profesor/${r.profesor_user_id}`)}
                          style={{
                            display: "block", background: "transparent", border: "none", padding: 0, margin: 0,
                            fontSize: 14, fontWeight: 700, color: "var(--text)", cursor: "pointer", textAlign: "left",
                            textDecoration: "underline", textUnderlineOffset: 2, wordBreak: "break-word",
                          }}
                        >
                          {r.profesor_nombre || "—"}
                        </button>
                      ) : (
                        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0, wordBreak: "break-word" }}>
                          {r.profesor_nombre || "—"}
                        </p>
                      )}
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "1px 0 0", wordBreak: "break-word" }}>
                        {r.profesor_email || "—"}
                      </p>
                    </div>
                    {r.profesor_email && (
                      <button
                        type="button"
                        title="Copiar correo"
                        onClick={() => copiarCorreo(r)}
                        style={{
                          width: 44, height: 44, flexShrink: 0, borderRadius: 10, border: "1px solid var(--surface2)",
                          background: "transparent", color: copiadoId === r.id ? "#4ade80" : "var(--text)",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                        }}
                      >
                        {copiadoId === r.id ? <HiCheckCircle /> : <HiOutlineClipboardDocument />}
                      </button>
                    )}
                  </div>

                  <div style={{ background: "var(--surface)", borderRadius: 10, padding: "10px 12px" }}>
                    <p style={{ fontSize: 13, color: "var(--text)", margin: 0, lineHeight: 1.5, wordBreak: "break-word" }}>
                      {r.descripcion}
                    </p>
                  </div>

                  <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0, wordBreak: "break-word" }}>
                    Reportante: {r.reportante_email || r.reportante_contacto || "Anónimo"}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ESTADOS.map((e) => {
                      const activo = r.estado === e.id;
                      return (
                        <button
                          key={e.id}
                          type="button"
                          disabled={procesandoId === r.id}
                          onClick={() => cambiarEstado(r, e.id)}
                          style={{
                            minHeight: 44, padding: "0 12px", borderRadius: 10, fontSize: 11.5, fontWeight: 700,
                            display: "flex", alignItems: "center", gap: 6,
                            border: activo ? `1.5px solid ${e.color}` : "1px solid var(--surface2)",
                            background: activo ? `${e.color}1f` : "transparent",
                            color: activo ? e.color : "var(--text-muted)",
                            cursor: procesandoId === r.id ? "default" : "pointer",
                            opacity: procesandoId === r.id ? 0.6 : 1,
                            transition: "all 0.15s",
                          }}
                        >
                          <e.icono style={{ fontSize: 14 }} />
                          {e.etiqueta}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}
