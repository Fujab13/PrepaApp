// MisGanancias.jsx
// Portal de ganancias del maestro para ofertas_maestro (reemplaza el viejo
// "Conecta tu cuenta de pagos", que era del sistema 1-a-1 con Stripe Connect
// ya en desuso — ver TutoriasMaestro.jsx). Agrupa las transacciones propias
// (RPC `obtener_mis_transacciones_oferta_maestro`, migración 20260812140000)
// por quincena de calendario (1-15 / 16-fin de mes, el estándar de nómina en
// México) y deja ver/imprimir un recibo formal por quincena.
//
// El recibo se muestra como una vista de página completa (no una tarjeta más
// entre otras) para poder usar `window.print()` directo, mismo patrón que
// PaginaFormulario/PaginaExamen en InformeResultados.jsx: imprimir toda la
// página funciona porque en ese momento la página completa ES el recibo.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { obtenerMisTransaccionesOfertaMaestro } from "../services/maestros";
import { MATERIAS_TUTORIA } from "../data/materiasTutoria";

import { AiOutlineClose } from "react-icons/ai";
import {
  HiOutlineBanknotes,
  HiOutlinePrinter,
  HiCheckCircle,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi2";

function fmtMoneda(n) {
  return `$${Number(n ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtFecha(ts) {
  return ts ? new Date(ts).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

// Quincena de calendario: 1-15 y 16-fin de mes, calculada a partir de la
// fecha en que se confirmó el pago (no la fecha de la clase).
function quincenaDe(fechaIso) {
  const d = new Date(fechaIso);
  const year = d.getFullYear();
  const month = d.getMonth();
  const primeraMitad = d.getDate() <= 15;
  const inicio = new Date(year, month, primeraMitad ? 1 : 16);
  const fin = primeraMitad
    ? new Date(year, month, 15, 23, 59, 59)
    : new Date(year, month + 1, 0, 23, 59, 59);
  const key = `${year}-${String(month + 1).padStart(2, "0")}-${primeraMitad ? "1" : "2"}`;
  const nombreMes = inicio.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  const etiqueta = `${primeraMitad ? "1" : "16"}–${fin.getDate()} de ${nombreMes}`;
  return { key, inicio, fin, etiqueta };
}

function totalizar(transacciones) {
  return transacciones.reduce(
    (acc, t) => ({
      bruto: acc.bruto + Number(t.monto_total ?? 0),
      comision: acc.comision + Number(t.comision_mxn ?? 0),
      ganancia: acc.ganancia + Number(t.monto_profesor_mxn ?? 0),
      pagado: acc.pagado + (t.pagado_profesor ? Number(t.monto_profesor_mxn ?? 0) : 0),
      pendiente: acc.pendiente + (t.pagado_profesor ? 0 : Number(t.monto_profesor_mxn ?? 0)),
    }),
    { bruto: 0, comision: 0, ganancia: 0, pagado: 0, pendiente: 0 }
  );
}

function FilaDato({ label, valor, mono = false }) {
  if (!valor) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: "0.5px solid var(--surface)" }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 600, textAlign: "right", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all" }}>
        {valor}
      </span>
    </div>
  );
}

function ReciboQuincena({ grupo, nombre, onVolver }) {
  const totales = useMemo(() => totalizar(grupo.transacciones), [grupo.transacciones]);
  return (
    <div className="informe-print" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header className="page-topbar-compact no-print" style={{ paddingBottom: 14 }}>
        <button onClick={onVolver} title="Volver" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem", flex: 1 }}>Recibo de quincena</h2>
        <div className="page-topbar-actions">
          <button onClick={() => window.print()} title="Guardar / Imprimir PDF" className="util-btn" style={{ color: "#4f8ef7" }}>
            <HiOutlinePrinter />
          </button>
        </div>
      </header>

      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 40 }}>
        <div className="sp-card" style={{ width: "100%", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "26px 20px 18px", textAlign: "center", borderBottom: "1px dashed var(--surface)" }}>
            <HiCheckCircle style={{ fontSize: "2.3rem", color: "#4f8ef7", marginBottom: 8 }} />
            <p style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: 0 }}>Recibo de ganancias</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0", letterSpacing: 0.3 }}>PrepaApp · Tus ofertas</p>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: "#4f8ef7", margin: "12px 0 0" }}>Quincena {grupo.etiqueta}</p>
          </div>

          <div style={{ padding: "4px 20px 6px" }}>
            <FilaDato label="Maestro" valor={nombre} />
            <FilaDato label="Alumnos que pagaron" valor={grupo.transacciones.length} />
            <FilaDato label="Total bruto cobrado" valor={fmtMoneda(totales.bruto)} />
            <FilaDato label="Comisión de la plataforma (18%)" valor={fmtMoneda(totales.comision)} />
          </div>

          <div style={{ padding: "16px 20px", background: "var(--surface2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Te corresponde (82%)</span>
            <span style={{ fontSize: 21, fontWeight: 800, color: "#4f8ef7" }}>{fmtMoneda(totales.ganancia)}</span>
          </div>

          <div style={{ padding: "10px 20px 6px", borderTop: "1px dashed var(--surface)" }}>
            <FilaDato label="Ya pagado" valor={fmtMoneda(totales.pagado)} />
            <FilaDato label="Pendiente de pago" valor={fmtMoneda(totales.pendiente)} />
          </div>

          <div style={{ padding: "10px 20px 16px", borderTop: "1px dashed var(--surface)" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, margin: "6px 0 8px" }}>
              Detalle de transacciones
            </p>
            {grupo.transacciones.map((t) => {
              const materia = MATERIAS_TUTORIA.find((m) => m.id === t.materia_id);
              return (
                <div key={t.transaccion_id} style={{ padding: "8px 0", borderBottom: "0.5px solid var(--surface)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>
                      {materia?.nombre ?? t.materia_id} · {t.alumno_nombre || t.alumno_email}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 700 }}>{fmtMoneda(t.monto_profesor_mxn)}</span>
                  </div>
                  <p style={{ fontSize: 10.5, color: "var(--text-muted)", margin: "2px 0 0", fontFamily: "monospace" }}>
                    {fmtFecha(t.pagado_en)} · ID {t.transaccion_id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5, margin: 0, padding: "14px 20px" }}>
            El pago de tu 82% se transfiere por fuera de la app a la CLABE que registraste en tus ofertas.
          </p>
        </div>

        <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={onVolver}
            style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "0.5px solid var(--surface)", background: "var(--surface2)", color: "var(--text)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Volver
          </button>
          <button
            onClick={() => window.print()}
            style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "none", background: "#4f8ef7", color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}
          >
            <HiOutlinePrinter /> Guardar / Imprimir PDF
          </button>
        </div>
      </main>
    </div>
  );
}

export default function MisGanancias() {
  const navigate = useNavigate();
  const { user, cargando: cargandoAuth, esMaestro, perfil } = useAuth();

  const [filas, setFilas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [expandidos, setExpandidos] = useState(() => new Set());
  const [quincenaAbierta, setQuincenaAbierta] = useState(null);

  useEffect(() => {
    if (!user || !esMaestro) return;
    (async () => {
      setCargando(true);
      setError("");
      try {
        const data = await obtenerMisTransaccionesOfertaMaestro();
        setFilas(data);
      } catch {
        setError("No se pudieron cargar tus ganancias. Intenta de nuevo.");
      }
      setCargando(false);
    })();
  }, [user, esMaestro]);

  const quincenas = useMemo(() => {
    if (!filas) return [];
    const porQuincena = new Map();
    for (const fila of filas) {
      const { key, inicio, etiqueta } = quincenaDe(fila.pagado_en);
      if (!porQuincena.has(key)) {
        porQuincena.set(key, { key, inicio, etiqueta, transacciones: [] });
      }
      porQuincena.get(key).transacciones.push(fila);
    }
    return Array.from(porQuincena.values()).sort((a, b) => b.inicio - a.inicio);
  }, [filas]);

  const totalHistorico = useMemo(() => totalizar(filas ?? []), [filas]);

  function alternarExpandido(key) {
    setExpandidos((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(key)) siguiente.delete(key);
      else siguiente.add(key);
      return siguiente;
    });
  }

  if (quincenaAbierta) {
    return <ReciboQuincena grupo={quincenaAbierta} nombre={perfil?.nombre || user?.email} onVolver={() => setQuincenaAbierta(null)} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/tutorias/maestro")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem", flex: 1 }}>Mis ganancias</h2>
      </header>

      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 14 }}>
        {(cargandoAuth || (esMaestro && cargando)) && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>Cargando…</p>
        )}

        {!cargandoAuth && user && !esMaestro && (
          <div className="sp-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", margin: 0 }}>Este portal es solo para maestros registrados.</p>
          </div>
        )}

        {!cargandoAuth && user && esMaestro && !cargando && (
          <>
            {error && <p style={{ color: "var(--wrong)", fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>}

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ background: "var(--surface2)", borderLeft: "3px solid #4f8ef7", borderRadius: 10, padding: "10px 12px", flex: 1 }}>
                <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Ganado en total</span>
                <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: "3px 0 0" }}>{fmtMoneda(totalHistorico.ganancia)}</p>
              </div>
              <div style={{ background: "var(--surface2)", borderLeft: "3px solid #f59e0b", borderRadius: 10, padding: "10px 12px", flex: 1 }}>
                <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Pendiente de cobro</span>
                <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: "3px 0 0" }}>{fmtMoneda(totalHistorico.pendiente)}</p>
              </div>
            </div>

            {quincenas.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: "20px 0" }}>
                Todavía no tienes clases pagadas.
              </p>
            )}

            {quincenas.map((q) => {
              const totales = totalizar(q.transacciones);
              const expandido = expandidos.has(q.key);
              return (
                <div key={q.key} className="sp-card" style={{ margin: 0 }}>
                  <button
                    type="button"
                    onClick={() => alternarExpandido(q.key)}
                    style={{ background: "none", border: "none", padding: 0, width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, minHeight: 44 }}
                  >
                    <div className="sp-card-icon" style={{ background: "rgba(79,142,247,0.15)", color: "#4f8ef7" }}>
                      <HiOutlineBanknotes />
                    </div>
                    <div className="sp-card-body">
                      <p className="sp-card-title">Quincena {q.etiqueta}</p>
                      <p className="sp-card-description">{q.transacciones.length} alumno(s) · Ganancia {fmtMoneda(totales.ganancia)}</p>
                    </div>
                    <span style={{ fontSize: 18, color: "var(--text-muted)", display: "flex", flexShrink: 0 }}>{expandido ? <HiChevronUp /> : <HiChevronDown />}</span>
                  </button>

                  {expandido && (
                    <div style={{ borderTop: "0.5px solid var(--surface)", marginTop: 12, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
                        <span>Bruto {fmtMoneda(totales.bruto)}</span>
                        <span>Comisión {fmtMoneda(totales.comision)}</span>
                        <span>Pagado {fmtMoneda(totales.pagado)}</span>
                      </div>
                      {q.transacciones.map((t) => {
                        const materia = MATERIAS_TUTORIA.find((m) => m.id === t.materia_id);
                        return (
                          <div key={t.transaccion_id} style={{ background: "var(--surface2)", border: "0.5px solid var(--surface)", borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                              <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                                {materia?.nombre ?? t.materia_id} · {t.alumno_nombre || t.alumno_email}
                              </p>
                              <p style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", margin: 0, whiteSpace: "nowrap" }}>{fmtMoneda(t.monto_profesor_mxn)}</p>
                            </div>
                            <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
                              {fmtFecha(t.pagado_en)} · {t.pagado_profesor ? "Pagado" : "Pendiente de pago"}
                            </p>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setQuincenaAbierta(q)}
                        style={{ minHeight: 40, borderRadius: 10, border: "1px solid #4f8ef7", background: "transparent", color: "#4f8ef7", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}
                      >
                        <HiOutlinePrinter /> Ver / imprimir recibo
                      </button>
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
