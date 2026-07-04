// SiderNavMatrix.jsx
import { useEffect } from "react";

// ─── Props ───────────────────────────────────────────────────────────────────
// preguntas      : array completo de preguntas
// respuestas     : { [id]: 'A'|'B'|'C'|'D'|... }
// marcadas       : Set<id>
// preguntaActual : id de la pregunta visible
// secciones      : array de SECCIONES
// onIrA          : fn(id) — navega a esa pregunta
// onCerrar       : fn() — cierra el panel
// seccionActual  : índice de sección (para mostrar el nombre)
// ─────────────────────────────────────────────────────────────────────────────

export default function SiderNavMatrix({
  preguntas,
  respuestas,
  marcadas,
  preguntaActual,
  secciones,
  onIrA,
  onCerrar,
  seccionActual,
}) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCerrar]);

  const estadoBtn = (id) => {
    if (id === preguntaActual) return "actual";
    if (marcadas.has(id))     return "marcada";
    if (respuestas[id])        return "contestada";
    return "pendiente";
  };

  const colorBtn = (estado) => ({
    actual:      { bg: "#4f8ef7", color: "#fff", border: "#4f8ef7" },
    contestada:  { bg: "#22c55e", color: "#fff", border: "#22c55e" },
    marcada:     { bg: "#f59e0b", color: "#fff", border: "#f59e0b" },
    pendiente:   { bg: "#1e2535", color: "#6b7280", border: "#374151" },
  }[estado]);

  const totalContestadas  = preguntas.filter(p => respuestas[p.id]).length;
  const totalMarcadas     = preguntas.filter(p => marcadas.has(p.id)).length;
  const totalPendientes   = preguntas.length - totalContestadas;

  return (
    <>
      {/* Overlay semitransparente superior */}
      <div
        onClick={onCerrar}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 40,
        }}
      />

      {/* Panel inferior — ocupa mitad inferior, deja los botones de navegación */}
      <div
        style={{
          position: "fixed",
          bottom: 64,          // deja espacio a los botones inferiores
          left: 0,
          right: 0,
          height: "52vh",
          background: "#111827",
          borderTop: "1px solid #374151",
          borderRadius: "20px 20px 0 0",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Handle visual */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#374151" }} />
        </div>

        {/* Encabezado */}
        <div style={{
          padding: "10px 16px 6px",
          borderBottom: "0.5px solid #1f2937",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Navegador de preguntas
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 600, color: "#f9fafb" }}>
                {secciones[seccionActual]?.nombre ?? "Examen"}
              </p>
            </div>
            <button
              onClick={onCerrar}
              style={{
                background: "none", border: "none", color: "#9ca3af",
                fontSize: 20, cursor: "pointer", padding: "4px 8px", lineHeight: 1,
              }}
              aria-label="Cerrar matriz"
            >
              ×
            </button>
          </div>

          {/* Leyenda compacta */}
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            {[
              { color: "#22c55e", label: `Contestadas (${totalContestadas})` },
              { color: "#f59e0b", label: `Marcadas (${totalMarcadas})` },
              { color: "#374151", label: `Pendientes (${totalPendientes})` },
              { color: "#4f8ef7", label: "Actual" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cuadrícula scrolleable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 8px" }}>
          {secciones.map((sec, si) => {
            const pregsSec = preguntas.filter(
              (p) => p.id >= sec.id_inicio && p.id <= sec.id_fin
            );
            if (pregsSec.length === 0) return null;

            return (
              <div key={sec.nombre} style={{ marginBottom: 14 }}>
                {/* Nombre de sección */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}>
                  <div style={{ width: 3, height: 14, borderRadius: 2, background: sec.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#d1d5db", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    {sec.nombre}
                  </span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>
                    ({pregsSec.filter(p => respuestas[p.id]).length}/{pregsSec.length})
                  </span>
                </div>

                {/* Botones de la sección */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(8, 1fr)",
                  gap: 5,
                }}>
                  {pregsSec.map((p) => {
                    const estado = estadoBtn(p.id);
                    const s = colorBtn(estado);
                    return (
                      <button
                        key={p.id}
                        onClick={() => { onIrA(p.id); onCerrar(); }}
                        title={`Pregunta ${p.id}`}
                        style={{
                          background: s.bg,
                          color: s.color,
                          border: `1px solid ${s.border}`,
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: estado === "actual" ? 700 : 500,
                          padding: "5px 0",
                          cursor: "pointer",
                          transition: "opacity 0.15s",
                          boxShadow: estado === "actual" ? `0 0 0 2px #4f8ef740` : "none",
                        }}
                        aria-label={`Ir a pregunta ${p.id}`}
                      >
                        {p.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}