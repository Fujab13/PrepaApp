// AdminReportes.jsx
// Cola de reportes contra profesores (RPCs `admin_listar_reportes` /
// `admin_actualizar_estado_reporte`, migración
// 20260826150000_reportes_profesor.sql). Cualquiera puede dejar un reporte
// sin cuenta desde PerfilProfesor.jsx; aquí el admin los revisa ordenados
// por gravedad y cambia su estado conforme los atiende.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listarReportesAdmin, actualizarEstadoReporte } from "../services/reportes";
import { MOTIVOS_REPORTE, ETIQUETA_GRAVEDAD } from "../data/motivosReporte";

import { AiOutlineClose } from "react-icons/ai";
import { HiOutlineFlag, HiOutlineClipboardDocument, HiCheckCircle } from "react-icons/hi2";

const ESTADOS = [
  { id: "pendiente", etiqueta: "Pendiente" },
  { id: "en_revision", etiqueta: "En revisión" },
  { id: "resuelto", etiqueta: "Resuelto" },
  { id: "descartado", etiqueta: "Descartado" },
];

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
    setProcesandoId(reporte.id);
    try {
      await actualizarEstadoReporte(reporte.id, estado);
      await cargar();
    } catch {
      setError("No se pudo actualizar ese reporte.");
    }
    setProcesandoId(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem", flex: 1 }}>Reportes</h2>
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
            {cargando && <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Cargando…</p>}
            {!cargando && (reportes?.length ?? 0) === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No hay reportes.</p>
            )}

            {reportes?.map((r) => {
              const motivo = MOTIVOS_REPORTE.find((m) => m.id === r.categoria);
              const gravedad = ETIQUETA_GRAVEDAD[r.gravedad] ?? ETIQUETA_GRAVEDAD.leve;
              return (
                <div key={r.id} className="sp-card" style={{ margin: 0, border: `1px solid ${gravedad.color}55` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <div className="sp-card-icon" style={{ background: `${gravedad.color}22`, color: gravedad.color, flexShrink: 0 }}>
                        <HiOutlineFlag />
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", margin: 0 }}>
                        {motivo?.etiqueta ?? r.categoria}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: gravedad.color, whiteSpace: "nowrap" }}>
                      {gravedad.texto.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 19, fontWeight: 800, color: "var(--text)", margin: 0, wordBreak: "break-word", flex: "1 1 200px", minWidth: 0 }}>
                      {r.profesor_email || "—"}
                    </p>
                    {r.profesor_email && (
                      <button
                        type="button"
                        onClick={() => copiarCorreo(r)}
                        style={{ minHeight: 36, padding: "0 10px", borderRadius: 8, border: "1px solid var(--surface2)", background: "transparent", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, flexShrink: 0 }}
                      >
                        {copiadoId === r.id ? <HiCheckCircle /> : <HiOutlineClipboardDocument />} {copiadoId === r.id ? "Copiado" : "Copiar"}
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                    {r.profesor_nombre} · {fmtFecha(r.creado_en)}
                  </p>

                  <p style={{ fontSize: 13, color: "var(--text)", margin: "10px 0 0", lineHeight: 1.5, wordBreak: "break-word" }}>{r.descripcion}</p>

                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "8px 0 0", wordBreak: "break-word" }}>
                    Reportante: {r.reportante_email || r.reportante_contacto || "Anónimo"}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {ESTADOS.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        disabled={procesandoId === r.id}
                        onClick={() => cambiarEstado(r, e.id)}
                        style={{
                          minHeight: 34, padding: "0 12px", borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                          border: r.estado === e.id ? "1px solid #7c5cbf" : "1px solid var(--surface2)",
                          background: r.estado === e.id ? "rgba(124,92,191,0.15)" : "transparent",
                          color: r.estado === e.id ? "#7c5cbf" : "var(--text-muted)",
                          cursor: procesandoId === r.id ? "default" : "pointer",
                          opacity: procesandoId === r.id ? 0.6 : 1,
                        }}
                      >
                        {e.etiqueta}
                      </button>
                    ))}
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
