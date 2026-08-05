// Informe.jsx
// Reporte generado a partir del formulario de FormularioArea.jsx. Usa el mismo
// lenguaje visual oscuro del resto de PrepaApp (Resultados.jsx / Examen.jsx),
// pero se re-tematiza a claro automáticamente al imprimir (ver global.css:
// @media print → .informe-print redefine las variables de color).
// Props esperados desde FormularioArea.jsx via navigate (location.state):
//   {
//     datosPersonales: { nombre, edad, email, telefono },
//     grado, areaInteres, carreraInteres,
//     autoevaluacion: { [categoriaId]: 1..5 },
//     horasEstudio,
//     preferencias: { horarioPreferido, modalidadPreferida, decisionCarrera },
//     generadoEn: timestamp,
//   }

import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AiOutlineClose } from "react-icons/ai";
import { HiOutlinePrinter, HiOutlineAcademicCap, HiOutlineFlag, HiOutlineClock } from "react-icons/hi2";

const CATEGORIAS = [
  { id: "matematicas", label: "Matemáticas", color: "#4f8ef7" },
  { id: "espanol", label: "Español y comprensión lectora", color: "#22c55e" },
  { id: "ingles", label: "Inglés", color: "#f59e0b" },
  { id: "habitos", label: "Hábitos y organización de estudio", color: "#a855f7" },
  { id: "estres", label: "Manejo del estrés en exámenes", color: "#ef4444" },
];

// ── Piezas reutilizables (mismo lenguaje visual que Resultados.jsx) ───────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{
        margin: "0 0 12px",
        fontSize: 12,
        fontWeight: 700,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function MetricCard({ icono, label, valor, color = "#7c5cbf" }) {
  return (
    <div style={{
      background: "var(--surface)",
      borderLeft: `3px solid ${color}`,
      borderRadius: 10,
      padding: "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 3,
      minHeight: 44,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 13, color }}>{icono}</span>
        <span style={{ fontSize: 10.5, color: "var(--text-muted)", letterSpacing: 0.3 }}>{label}</span>
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", lineHeight: 1.25 }}>{valor || "—"}</span>
    </div>
  );
}

function BarraCategoria({ label, valor, color }) {
  const pct = valor ? (valor / 5) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--text)" }}>{label}</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{valor ? `${valor}/5` : "—"}</span>
      </div>
      <div style={{ height: 8, background: "var(--surface2)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function FilaDato({ label, valor }) {
  if (!valor) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "0.5px solid var(--surface2)" }}>
      <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: 12.5, color: "var(--text)", fontWeight: 600, textAlign: "right" }}>{valor}</span>
    </div>
  );
}

function Tarjeta({ children }) {
  return (
    <div style={{ background: "var(--surface)", border: "0.5px solid var(--surface2)", borderRadius: "var(--radius)", padding: "12px 16px" }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function Informe() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const nivelPreparacion = useMemo(() => {
    if (!state) return null;
    const valores = CATEGORIAS.map((c) => state.autoevaluacion?.[c.id]).filter((v) => typeof v === "number");
    if (valores.length === 0) return { pct: null, texto: "Sin datos suficientes", color: "var(--text-muted)" };

    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    const pct = Math.round((promedio / 5) * 100);

    const nivel = pct >= 85 ? { texto: "Muy preparado", color: "#22c55e" }
                : pct >= 65 ? { texto: "Buen avance", color: "#a3e635" }
                : pct >= 45 ? { texto: "En desarrollo", color: "#f59e0b" }
                :             { texto: "Etapa inicial", color: "#ef4444" };

    return { pct, ...nivel };
  }, [state]);

  if (!state) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div>
          <p style={{ fontSize: 16, color: "var(--text)", marginBottom: 16 }}>No hay un informe generado todavía.</p>
          <button onClick={() => navigate("/formulario-area")} style={{ padding: "12px 20px", minHeight: 44, borderRadius: 10, border: "none", background: "#7c5cbf", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Llenar Formulario Área
          </button>
        </div>
      </div>
    );
  }

  const { datosPersonales, grado, areaInteres, carreraInteres, autoevaluacion, horasEstudio, preferencias, generadoEn } = state;

  return (
    <div className="informe-print" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>

      {/* ── BARRA SUPERIOR (no se imprime) ── */}
      <header className="page-topbar-compact no-print" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem", flex: 1 }}>Informe de preparación</h2>
        <div className="page-topbar-actions">
          <button onClick={() => window.print()} title="Imprimir / Guardar PDF" className="util-btn" style={{ color: "#7c5cbf" }}>
            <HiOutlinePrinter />
          </button>
        </div>
      </header>

      {/* ── CUERPO ── */}
      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 40 }}>

        {/* ── Encabezado del reporte ── */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7c5cbf", fontWeight: 700 }}>PrepaApp</p>
          <h1 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: "var(--text)" }}>
            Informe de {datosPersonales?.nombre ? `${datosPersonales.nombre}` : "Preparación Universitaria"}
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "var(--text-muted)" }}>
            Generado el {new Date(generadoEn ?? Date.now()).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* ── Índice de preparación ── */}
        <Section title="Índice de preparación">
          <div style={{
            border: `1px solid ${nivelPreparacion.color}40`,
            borderLeft: `4px solid ${nivelPreparacion.color}`,
            background: "var(--surface)",
            borderRadius: "var(--radius)",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 10,
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: nivelPreparacion.color, minWidth: 62 }}>
              {nivelPreparacion.pct !== null ? `${nivelPreparacion.pct}%` : "—"}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: nivelPreparacion.color }}>{nivelPreparacion.texto}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Basado en tu autoevaluación por área</div>
            </div>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
            Esta autoevaluación es orientativa y refleja cómo te percibes hoy; no sustituye un examen de admisión oficial.
          </p>
        </Section>

        {/* ── Datos clave ── */}
        <Section title="Datos clave">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MetricCard icono={<HiOutlineAcademicCap />} label="Grado" valor={grado} color="#7c5cbf" />
            <MetricCard icono={<HiOutlineFlag />} label="Área de interés" valor={areaInteres} color="#f59e0b" />
            <MetricCard icono={<HiOutlineClock />} label="Horas de estudio/sem." valor={horasEstudio} color="#4f8ef7" />
            <MetricCard icono={<HiOutlineAcademicCap />} label="Carrera de interés" valor={carreraInteres} color="#22c55e" />
          </div>
        </Section>

        {/* ── Detalle por área ── */}
        <Section title="Detalle por área">
          <Tarjeta>
            {CATEGORIAS.map((c) => (
              <BarraCategoria key={c.id} label={c.label} valor={autoevaluacion?.[c.id]} color={c.color} />
            ))}
          </Tarjeta>
        </Section>

        {/* ── Preferencias de estudio ── */}
        <Section title="Preferencias de estudio">
          <Tarjeta>
            <FilaDato label="Horario preferido" valor={preferencias?.horarioPreferido} />
            <FilaDato label="Modalidad preferida" valor={preferencias?.modalidadPreferida} />
            <FilaDato label="¿Ya decidió su carrera?" valor={preferencias?.decisionCarrera} />
          </Tarjeta>
        </Section>

        {/* ── Contacto ── */}
        <Section title="Datos de contacto">
          <Tarjeta>
            <FilaDato label="Edad" valor={datosPersonales?.edad} />
            <FilaDato label="Correo" valor={datosPersonales?.email} />
            <FilaDato label="Teléfono" valor={datosPersonales?.telefono} />
          </Tarjeta>
        </Section>

        <p style={{ fontSize: 10.5, color: "var(--text-muted)", opacity: 0.7, textAlign: "center", marginTop: 26 }}>
          PrepaApp · Este informe es una herramienta de autoevaluación con fines orientativos.
        </p>

        {/* ── Acciones (no se imprimen) ── */}
        <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={() => navigate("/")} style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "0.5px solid var(--surface2)", background: "var(--surface)", color: "var(--text)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Volver al inicio
          </button>
          <button onClick={() => window.print()} style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "none", background: "#7c5cbf", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Imprimir informe
          </button>
        </div>
      </main>
    </div>
  );
}
