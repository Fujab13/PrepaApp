// resultados.jsx
// Props esperados desde Examen.jsx via navigate o context:
//   location.state = {
//     respuestas       : { [id]: 'A'|'B'|'C'|'D' },
//     tiemposPregunta  : { [id]: segundos_usados },
//     marcadas         : array de ids,
//     preguntas        : array completo de PREGUNTAS,
//     secciones        : array de SECCIONES,
//     tiempoTotalSegundos : número,
//   }

import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtTiempo = (seg) => {
  const m = Math.floor(Math.abs(seg) / 60);
  const s = Math.abs(seg) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const fmtMinSeg = (seg) => {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

// ─── Tarjeta de métrica ─────────────────────────────────────────────────────
function MetricCard({ icono, label, valor, sub, color = "#4f8ef7" }) {
  return (
    <div style={{
      background: "#1e2535",
      border: "0.5px solid #374151",
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icono}</span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}</span>
      </div>
      <span style={{ fontSize: 24, fontWeight: 700, color }}>{valor}</span>
      {sub && <span style={{ fontSize: 11, color: "#6b7280" }}>{sub}</span>}
    </div>
  );
}

// ─── Barra de progreso de sección ───────────────────────────────────────────
function SeccionBar({ nombre, correctas, total, color }) {
  const pct = total > 0 ? Math.round((correctas / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>{nombre}</span>
        <span style={{ fontSize: 13, color: "#9ca3af" }}>{correctas}/{total} · {pct}%</span>
      </div>
      <div style={{ height: 8, background: "#1f2937", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: "width 1s ease",
        }} />
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function Resultados() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state;

  // Fallback si se accede sin estado
  if (!state?.preguntas) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#9ca3af" }}>
          <p style={{ fontSize: 18, color: "#f9fafb", marginBottom: 12 }}>Sin datos de examen</p>
          <button
            onClick={() => navigate("/")}
            style={btnStyle}
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  const { respuestas, tiemposPregunta, marcadas, preguntas, secciones, tiempoTotalSegundos } = state;

  // ── Cálculos globales ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const tiempos = Object.values(tiemposPregunta ?? {}).filter(t => typeof t === "number");
    const total   = preguntas.length;

    let correctas = 0;
    preguntas.forEach(p => {
      if (respuestas[p.id] === p.inciso_correcto) correctas++;
    });

    const precision     = total > 0 ? Math.round((correctas / total) * 100) : 0;
    const tiempoMax     = tiempos.length ? Math.max(...tiempos) : 0;
    const tiempoMin     = tiempos.length ? Math.min(...tiempos) : 0;
    const tiempoPromedio = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;
    const sinContestar = preguntas.filter(p => !respuestas[p.id]).length;

    // Calcula id de pregunta más rápida y más lenta
    let pregMasLenta  = null, pregMasRapida = null;
    let maxT = -Infinity, minT = Infinity;
    Object.entries(tiemposPregunta ?? {}).forEach(([id, t]) => {
      if (t > maxT) { maxT = t; pregMasLenta  = Number(id); }
      if (t < minT) { minT = t; pregMasRapida = Number(id); }
    });

    return { total, correctas, precision, tiempoMax, tiempoMin, tiempoPromedio, sinContestar, pregMasLenta, pregMasRapida };
  }, [respuestas, tiemposPregunta, preguntas]);

  // ── Estadísticas por sección ────────────────────────────────────────────
  const statsPorSeccion = useMemo(() =>
    secciones.map(sec => {
      const pregsSec = preguntas.filter(p => p.id >= sec.id_inicio && p.id <= sec.id_fin);
      const correctas = pregsSec.filter(p => respuestas[p.id] === p.inciso_correcto).length;
      return { ...sec, total: pregsSec.length, correctas };
    }),
  [secciones, preguntas, respuestas]);

  // ── Nivel de desempeño ──────────────────────────────────────────────────
  const nivel = stats.precision >= 80 ? { texto: "Excelente", color: "#22c55e", emoji: "🏆" }
              : stats.precision >= 60 ? { texto: "Bueno",     color: "#f59e0b", emoji: "👍" }
              : stats.precision >= 40 ? { texto: "Regular",   color: "#f97316", emoji: "📚" }
              :                         { texto: "A mejorar", color: "#ef4444", emoji: "💪" };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      color: "#f9fafb",
      fontFamily: "'Inter', system-ui, sans-serif",
      paddingBottom: 40,
    }}>
      {/* Encabezado */}
      <div style={{
        background: "linear-gradient(180deg, #111827 0%, #0d1117 100%)",
        padding: "32px 20px 24px",
        textAlign: "center",
        borderBottom: "0.5px solid #1f2937",
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{nivel.emoji}</div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f9fafb" }}>
          Resultados del examen
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#9ca3af" }}>
          Tiempo total · {fmtTiempo(tiempoTotalSegundos ?? 0)}
        </p>

        {/* Score grande */}
        <div style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#1e2535",
          border: `2px solid ${nivel.color}`,
          borderRadius: 16,
          padding: "16px 32px",
          marginTop: 20,
        }}>
          <span style={{ fontSize: 52, fontWeight: 800, color: nivel.color, lineHeight: 1 }}>
            {stats.precision}%
          </span>
          <span style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
            {stats.correctas} correctas de {stats.total}
          </span>
          <span style={{
            marginTop: 8,
            fontSize: 12,
            fontWeight: 600,
            color: nivel.color,
            background: `${nivel.color}20`,
            padding: "3px 12px",
            borderRadius: 20,
          }}>
            {nivel.texto}
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── Métricas de tiempo ── */}
        <Section title="Tiempos">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MetricCard icono="⏱" label="Promedio por pregunta"
              valor={fmtMinSeg(stats.tiempoPromedio)} color="#4f8ef7" />
            <MetricCard icono="⚡" label="Más rápido"
              valor={fmtMinSeg(stats.tiempoMin)}
              sub={stats.pregMasRapida ? `Pregunta ${stats.pregMasRapida}` : ""}
              color="#22c55e" />
            <MetricCard icono="🐢" label="Más lento"
              valor={fmtMinSeg(stats.tiempoMax)}
              sub={stats.pregMasLenta ? `Pregunta ${stats.pregMasLenta}` : ""}
              color="#f59e0b" />
            <MetricCard icono="📋" label="Sin contestar"
              valor={stats.sinContestar}
              sub={`${stats.total - stats.sinContestar} respondidas`}
              color={stats.sinContestar > 0 ? "#ef4444" : "#22c55e"} />
          </div>
        </Section>

        {/* ── Por sección ── */}
        <Section title="Por área">
          {statsPorSeccion.map(sec => (
            <SeccionBar
              key={sec.nombre}
              nombre={sec.nombre}
              correctas={sec.correctas}
              total={sec.total}
              color={sec.color}
            />
          ))}
        </Section>

        {/* ── Preguntas marcadas ── */}
        {(marcadas?.length ?? 0) > 0 && (
          <Section title={`Preguntas marcadas (${marcadas.length})`}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {marcadas.map(id => {
                const p = preguntas.find(q => q.id === id);
                const esCor = respuestas[id] === p?.inciso_correcto;
                return (
                  <div key={id} style={{
                    background: esCor ? "#14532d" : "#450a0a",
                    border: `1px solid ${esCor ? "#166534" : "#7f1d1d"}`,
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 12,
                    color: esCor ? "#86efac" : "#fca5a5",
                  }}>
                    #{id} {esCor ? "✓" : respuestas[id] ? "✗" : "—"}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Detalle por pregunta ── */}
        <Section title="Detalle de respuestas">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {preguntas.map(p => {
              const resp    = respuestas[p.id];
              const correc  = p.inciso_correcto;
              const acierto = resp === correc;
              const tiempo  = tiemposPregunta?.[p.id];

              let estado;
              if      (!resp)    estado = { bg: "#1f2937", border: "#374151", dot: "#6b7280", label: "—" };
              else if (acierto)  estado = { bg: "#14532d", border: "#166534", dot: "#22c55e", label: "Correcto" };
              else               estado = { bg: "#450a0a", border: "#7f1d1d", dot: "#ef4444", label: "Incorrecto" };

              return (
                <div key={p.id} style={{
                  background: estado.bg,
                  border: `0.5px solid ${estado.border}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: estado.dot, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>#{p.id} </span>
                    <span style={{
                      fontSize: 12, color: "#e5e7eb",
                      display: "inline", wordBreak: "break-word",
                    }}>
                      {p.pregunta.slice(0, 60)}{p.pregunta.length > 60 ? "…" : ""}
                    </span>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>
                      {resp ? `Tu: ${resp}` : "Sin resp."}
                      {!acierto && resp && ` · Cor: ${correc}`}
                    </div>
                    {tiempo != null && (
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{fmtMinSeg(tiempo)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Botones finales ── */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={() => navigate("/")} style={{
            ...btnStyle,
            background: "#1e2535",
            color: "#e5e7eb",
            border: "0.5px solid #374151",
            flex: 1,
          }}>
            Volver al inicio
          </button>
          <button
            onClick={() => window.print()}
            style={{ ...btnStyle, background: "#4f8ef7", color: "#fff", border: "none", flex: 1 }}
          >
            Imprimir resultados
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sección con título ──────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{
        margin: "0 0 12px",
        fontSize: 13,
        fontWeight: 600,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Estilo base de botón ────────────────────────────────────────────────────
const btnStyle = {
  padding: "12px 20px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "center",
};