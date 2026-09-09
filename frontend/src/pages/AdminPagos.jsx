// AdminPagos.jsx
// Ledger de comisión (18%) y pago a profesores (82%) de `ofertas_maestro`
// (ver migración 20260812130000 y services/adminPagos.js). Solo lectura +
// dos acciones (marcar/deshacer pagado) — la transferencia real a la CLABE
// del profesor se sigue haciendo por fuera de la app; esto solo lleva la
// contabilidad de cuánto se le debe a cada quien y si ya se le pagó.
//
// La RPC de detalle (`admin_detalle_transacciones_profesores`) regresa
// filas planas (una por transacción); el resumen por profesor y el global
// se calculan aquí agrupando en el cliente, mismo patrón que
// AlumnosOfertas.jsx usa para agrupar por oferta en vez de ofertas.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  obtenerDetalleTransaccionesProfesores,
  contarUsuariosRegistrados,
  marcarPagoProfesor,
  desmarcarPagoProfesor,
} from "../services/adminPagos";
import { nombreMateriaOferta } from "../data/materiasTutoria";

import { AiOutlineClose, AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  HiOutlineBanknotes,
  HiOutlineEnvelope,
  HiCheckCircle,
  HiChevronDown,
  HiChevronUp,
  HiOutlineUserGroup,
  HiOutlineLockClosed,
  HiOutlineShieldExclamation,
  HiOutlineInboxStack,
  HiOutlineChartBar,
} from "react-icons/hi2";

function fmtMoneda(n) {
  return `$${Number(n ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtFecha(ts) {
  return ts ? new Date(ts).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

function TarjetaResumen({ icono, label, valor, color }) {
  return (
    <div style={{ background: "var(--surface2)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
      <div
        style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${color}22`, color, fontSize: 16,
        }}
      >
        {icono}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{label}</p>
        <p style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: "1px 0 0" }}>{valor}</p>
      </div>
    </div>
  );
}

export default function AdminPagos() {
  const navigate = useNavigate();
  const { user, cargando: cargandoAuth, esAdmin } = useAuth();

  const [filas, setFilas] = useState(null);
  const [totalUsuarios, setTotalUsuarios] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);
  const [expandidos, setExpandidos] = useState(() => new Set());
  const [statsAbiertas, setStatsAbiertas] = useState(false);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const [data, usuarios] = await Promise.all([
        obtenerDetalleTransaccionesProfesores(),
        contarUsuariosRegistrados(),
      ]);
      setFilas(data);
      setTotalUsuarios(usuarios);
    } catch {
      setError("No se pudo cargar el detalle de pagos. Intenta de nuevo.");
    }
    setCargando(false);
  }

  useEffect(() => {
    if (!user || !esAdmin) return;
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, esAdmin]);

  function alternarExpandido(profesorId) {
    setExpandidos((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(profesorId)) siguiente.delete(profesorId);
      else siguiente.add(profesorId);
      return siguiente;
    });
  }

  async function marcar(fila) {
    setError("");
    setProcesandoId(fila.transaccion_id);
    try {
      if (fila.pagado_profesor) await desmarcarPagoProfesor(fila.transaccion_id);
      else await marcarPagoProfesor(fila.transaccion_id);
      await cargar();
    } catch {
      setError("No se pudo actualizar el estado de pago. Intenta de nuevo.");
    }
    setProcesandoId(null);
  }

  const profesores = useMemo(() => {
    if (!filas) return [];
    const porProfesor = new Map();
    for (const fila of filas) {
      if (!porProfesor.has(fila.profesor_id)) {
        porProfesor.set(fila.profesor_id, {
          profesor_id: fila.profesor_id,
          nombre: fila.profesor_nombre,
          email: fila.profesor_email,
          numeroCuenta: fila.profesor_numero_cuenta,
          transacciones: [],
          totalBruto: 0,
          totalComision: 0,
          totalProfesor: 0,
          totalPagado: 0,
          totalPendiente: 0,
        });
      }
      const entrada = porProfesor.get(fila.profesor_id);
      entrada.transacciones.push(fila);
      entrada.totalBruto += Number(fila.monto_total ?? 0);
      entrada.totalComision += Number(fila.comision_mxn ?? 0);
      entrada.totalProfesor += Number(fila.monto_profesor_mxn ?? 0);
      if (fila.pagado_profesor) entrada.totalPagado += Number(fila.monto_profesor_mxn ?? 0);
      else entrada.totalPendiente += Number(fila.monto_profesor_mxn ?? 0);
    }
    return Array.from(porProfesor.values()).sort((a, b) => b.totalPendiente - a.totalPendiente);
  }, [filas]);

  const resumenGlobal = useMemo(() => {
    return profesores.reduce(
      (acc, p) => ({
        comision: acc.comision + p.totalComision,
        pendiente: acc.pendiente + p.totalPendiente,
        pagado: acc.pagado + p.totalPagado,
      }),
      { comision: 0, pendiente: 0, pagado: 0 }
    );
  }, [profesores]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem", flex: 1 }}>Pagos a profesores</h2>
      </header>

      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 16 }}>
        {(cargandoAuth || (esAdmin && cargando)) && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}>
            <AiOutlineLoading3Quarters className="spin" style={{ fontSize: "1.6rem", color: "#4f8ef7" }} />
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Cargando…</p>
          </div>
        )}

        {!cargandoAuth && !user && (
          <div className="sp-card" style={{ textAlign: "center", alignItems: "center" }}>
            <div className="sp-card-icon" style={{ width: 52, height: 52, fontSize: "1.5rem", margin: "0 auto", background: "rgba(6,182,212,0.14)", color: "#06b6d4" }}>
              <HiOutlineLockClosed />
            </div>
            <p style={{ fontSize: 14, color: "var(--text)", margin: "10px 0 14px", fontWeight: 700 }}>
              Necesitas iniciar sesión para ver esta página.
            </p>
            <button
              onClick={() => navigate("/login?modo=login")}
              style={{ minHeight: 44, padding: "0 22px", borderRadius: 12, border: "none", background: "#06b6d4", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", boxShadow: "0 4px 14px rgba(6,182,212,0.3)" }}
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {!cargandoAuth && user && !esAdmin && (
          <div className="sp-card" style={{ textAlign: "center", alignItems: "center" }}>
            <div className="sp-card-icon" style={{ width: 52, height: 52, fontSize: "1.5rem", margin: "0 auto", background: "rgba(248,113,113,0.14)", color: "var(--wrong)" }}>
              <HiOutlineShieldExclamation />
            </div>
            <p style={{ fontSize: 14, color: "var(--text)", margin: "10px 0 0", fontWeight: 700 }}>
              No tienes permiso para ver esta página.
            </p>
          </div>
        )}

        {!cargandoAuth && user && esAdmin && !cargando && (
          <>
            {error && (
              <div style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, padding: "10px 14px" }}>
                <p style={{ color: "var(--wrong)", fontSize: 13, margin: 0, textAlign: "center" }}>{error}</p>
              </div>
            )}

            <div className="sp-card" style={{ margin: 0 }}>
              <button
                type="button"
                onClick={() => setStatsAbiertas((v) => !v)}
                style={{ background: "none", border: "none", padding: 0, width: "100%", display: "flex", alignItems: "center", gap: 12, minHeight: 44, cursor: "pointer", color: "var(--text)" }}
              >
                <div className="sp-card-icon" style={{ background: "rgba(79,142,247,0.15)", color: "#4f8ef7" }}>
                  <HiOutlineChartBar />
                </div>
                <div className="sp-card-body" style={{ textAlign: "left" }}>
                  <p className="sp-card-title">Estadísticas de la plataforma</p>
                  <p className="sp-card-description">{statsAbiertas ? "Toca para ocultar" : "Toca para ver el detalle"}</p>
                </div>
                <span style={{ fontSize: 18, color: "var(--text-muted)", display: "flex", flexShrink: 0 }}>{statsAbiertas ? <HiChevronUp /> : <HiChevronDown />}</span>
              </button>

              {statsAbiertas && (
                <div style={{ borderTop: "0.5px solid var(--surface)", marginTop: 12, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <TarjetaResumen icono={<HiOutlineUserGroup />} label="Usuarios registrados" valor={totalUsuarios ?? "…"} color="#06b6d4" />
                  <TarjetaResumen icono={<HiOutlineBanknotes />} label="Comisión de la plataforma" valor={fmtMoneda(resumenGlobal.comision)} color="#22c55e" />
                  <TarjetaResumen icono={<HiOutlineBanknotes />} label="Pendiente de pagar" valor={fmtMoneda(resumenGlobal.pendiente)} color="#f59e0b" />
                  <TarjetaResumen icono={<HiCheckCircle />} label="Ya pagado" valor={fmtMoneda(resumenGlobal.pagado)} color="#4f8ef7" />
                </div>
              )}
            </div>

            {profesores.length > 0 && (
              <p style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 2px" }}>
                {profesores.length} {profesores.length === 1 ? "profesor" : "profesores"}
              </p>
            )}

            {profesores.length === 0 && (
              <div className="sp-card" style={{ textAlign: "center", alignItems: "center" }}>
                <div className="sp-card-icon" style={{ width: 52, height: 52, fontSize: "1.5rem", margin: "0 auto", background: "rgba(132,108,137,0.14)", color: "var(--text-muted)" }}>
                  <HiOutlineInboxStack />
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "10px 0 0" }}>
                  Todavía no hay clases pagadas de ofertas_maestro.
                </p>
              </div>
            )}

            {profesores.map((p) => {
              const expandido = expandidos.has(p.profesor_id);
              return (
                <div key={p.profesor_id} className="sp-card sp-card-interactive" style={{ margin: 0 }}>
                  <button
                    type="button"
                    onClick={() => alternarExpandido(p.profesor_id)}
                    style={{ background: "none", border: "none", padding: 0, width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, minHeight: 44, color: "var(--text)" }}
                  >
                    <div className="sp-card-icon" style={{ background: "rgba(124,92,191,0.15)", color: "#7c5cbf" }}>
                      {(p.nombre || p.email)[0]?.toUpperCase()}
                    </div>
                    <div className="sp-card-body" style={{ overflow: "hidden" }}>
                      <p className="sp-card-title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nombre || "Sin nombre"}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: p.totalPendiente > 0 ? "#f59e0b" : "#4f8ef7", background: p.totalPendiente > 0 ? "rgba(245,158,11,0.15)" : "rgba(79,142,247,0.15)", padding: "4px 8px", borderRadius: 10, whiteSpace: "nowrap" }}>
                        {p.totalPendiente > 0 ? `Debe ${fmtMoneda(p.totalPendiente)}` : "Al día"}
                      </span>
                      <span style={{ fontSize: 18, color: "var(--text-muted)", display: "flex" }}>{expandido ? <HiChevronUp /> : <HiChevronDown />}</span>
                    </div>
                  </button>

                  <p className="sp-card-description" style={{ display: "flex", alignItems: "center", gap: 5, margin: "10px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <HiOutlineEnvelope style={{ flexShrink: 0 }} /> {p.email}
                  </p>

                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0", fontFamily: "monospace", background: "var(--surface)", display: "inline-block", padding: "3px 8px", borderRadius: 6 }}>
                    CLABE: {p.numeroCuenta || "No configurada"}
                  </p>

                  {expandido && (
                    <div style={{ borderTop: "0.5px solid var(--surface)", marginTop: 12, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      {p.transacciones.map((t) => {
                        return (
                          <div key={t.transaccion_id} style={{ background: "var(--surface)", borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                              <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                                {nombreMateriaOferta(t.materia_id, t.materia_otro)} · {fmtFecha(t.fecha_hora)}
                              </p>
                              <p style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", margin: 0, whiteSpace: "nowrap" }}>
                                {fmtMoneda(t.monto_profesor_mxn)}
                              </p>
                            </div>
                            <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
                              Alumno: {t.alumno_nombre || t.alumno_email} · Total {fmtMoneda(t.monto_total)} · Comisión {fmtMoneda(t.comision_mxn)}
                            </p>
                            <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "2px 0 0", fontFamily: "monospace" }}>
                              CLABE: {t.cuenta_clave}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTop: "0.5px solid var(--surface2)", gap: 8 }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: t.pagado_profesor ? "#4f8ef7" : "#f59e0b" }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.pagado_profesor ? "#4f8ef7" : "#f59e0b", flexShrink: 0 }} />
                                {t.pagado_profesor ? `Pagado el ${fmtFecha(t.pagado_profesor_en)}` : "Pendiente de pago"}
                              </span>
                              <button
                                type="button"
                                disabled={procesandoId === t.transaccion_id}
                                onClick={() => marcar(t)}
                                style={{
                                  minHeight: 36, padding: "0 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                  border: t.pagado_profesor ? "1px solid var(--surface)" : "none",
                                  background: t.pagado_profesor ? "transparent" : "#4f8ef7",
                                  color: t.pagado_profesor ? "var(--text-muted)" : "#fff",
                                  cursor: procesandoId === t.transaccion_id ? "default" : "pointer",
                                  opacity: procesandoId === t.transaccion_id ? 0.6 : 1,
                                }}
                              >
                                {procesandoId === t.transaccion_id ? "…" : t.pagado_profesor ? "Deshacer" : "Marcar como pagado"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}
