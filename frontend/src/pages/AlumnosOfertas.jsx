// AlumnosOfertas.jsx
// Sub-página de tutorias/maestro: lista, agrupados por oferta, los alumnos
// que ya pagaron un cupo en las clases grupales del maestro (correo,
// nombre y teléfono si existen — ver services/ofertasMaestro.js y la RPC
// `obtener_alumnos_ofertas_maestro`, migración 20260812120000). Es de solo
// lectura: el maestro coordina con cada alumno fuera de la app.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { obtenerAlumnosDeOfertas } from "../services/ofertasMaestro";
import { MATERIAS_TUTORIA } from "../data/materiasTutoria";

import { AiOutlineClose } from "react-icons/ai";
import { HiOutlineEnvelope, HiOutlinePhone } from "react-icons/hi2";

function fmtFecha(ts) {
  return ts
    ? new Date(ts).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })
    : "—";
}

export default function AlumnosOfertas() {
  const navigate = useNavigate();
  const { user, cargando: cargandoAuth } = useAuth();

  const [filas, setFilas] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setCargando(true);
      const data = await obtenerAlumnosDeOfertas();
      setCargando(false);
      setFilas(data);
    })();
  }, [user]);

  const ofertas = useMemo(() => {
    if (!filas) return [];
    const porOferta = new Map();
    for (const fila of filas) {
      if (!porOferta.has(fila.oferta_id)) {
        porOferta.set(fila.oferta_id, {
          oferta_id: fila.oferta_id,
          materia_id: fila.materia_id,
          fecha_hora: fila.fecha_hora,
          alumnos: [],
        });
      }
      porOferta.get(fila.oferta_id).alumnos.push(fila);
    }
    return Array.from(porOferta.values()).sort(
      (a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora)
    );
  }, [filas]);

  const totalAlumnos = filas?.length ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/tutorias/maestro")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem", flex: 1 }}>Alumnos inscritos</h2>
      </header>

      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 14 }}>
        {(cargandoAuth || cargando) && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>Cargando…</p>
        )}

        {!cargandoAuth && !user && (
          <div className="sp-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 12 }}>
              Necesitas iniciar sesión para ver tus alumnos inscritos.
            </p>
            <button
              onClick={() => navigate("/login?modo=login")}
              style={{ minHeight: 44, padding: "0 20px", borderRadius: 10, border: "none", background: "#06b6d4", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {!cargandoAuth && user && !cargando && (
          <>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
              Alumnos que ya pagaron un cupo en tus clases grupales publicadas en "Tus ofertas". {totalAlumnos} en total.
            </p>

            {ofertas.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: "20px 0" }}>
                Todavía nadie ha comprado un cupo en tus ofertas.
              </p>
            )}

            {ofertas.map((oferta) => {
              const materia = MATERIAS_TUTORIA.find((m) => m.id === oferta.materia_id);
              const color = materia?.color ?? "#06b6d4";
              return (
                <div key={oferta.oferta_id} className="sp-card" style={{ margin: 0 }}>
                  <div className="sp-card-header">
                    <div className="sp-card-icon" style={{ background: `${color}22`, color }}>
                      {materia?.nombre?.[0] ?? "?"}
                    </div>
                    <div className="sp-card-body">
                      <p className="sp-card-title">{materia?.nombre ?? oferta.materia_id}</p>
                      <p className="sp-card-description">{fmtFecha(oferta.fecha_hora)}</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, padding: "4px 8px", borderRadius: 10, whiteSpace: "nowrap" }}>
                      {oferta.alumnos.length} alumno{oferta.alumnos.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    {oferta.alumnos.map((alumno) => (
                      <div
                        key={alumno.comprador_id}
                        style={{ background: "var(--surface2)", border: "0.5px solid var(--surface)", borderRadius: 10, padding: "10px 12px" }}
                      >
                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                          {alumno.nombre || "Sin nombre"}
                        </p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                          <HiOutlineEnvelope /> {alumno.email}
                        </p>
                        {alumno.telefono && (
                          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                            <HiOutlinePhone /> {alumno.telefono}
                          </p>
                        )}
                      </div>
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
