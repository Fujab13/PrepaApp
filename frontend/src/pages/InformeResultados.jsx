// InformeResultados.jsx
// Fusión de las antiguas Informe.jsx (formulario de área) y Resultados.jsx
// (examen simulador) en una sola página con tres modos de entrada:
//
//   1. location.state = { tipo: "formulario", formulario: {...} }
//      Recién llenado el formulario de área (FormularioArea.jsx) — se
//      pinta directo desde el state, sin ir a Supabase.
//   2. location.state = { tipo: "examen", examen: {...} }
//      Recién terminado el examen (Examen.jsx) — igual, directo del state.
//   3. Sin location.state — modo maestro: el usuario pega uno o varios
//      correos y la página trae (RPCs `obtener_formularios_area_por_email`
//      / `obtener_resultados_examen_por_email`, ver
//      supabase/migrations/20260811120000_informes_por_email.sql) el
//      informe y los resultados de cada correo, en tarjetas expandibles
//      pensadas para revisar varios alumnos desde el celular.
//
// Ambos "adaptadores" de abajo normalizan el state de navegación y las
// filas crudas de Supabase (snake_case) a una misma forma interna, para que
// las piezas de render (VistaFormulario/VistaExamen) no necesiten saber de
// dónde vino el dato.

import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { obtenerFormulariosPorEmail, obtenerResultadosPorEmail } from "../services/informes";
import { calcularStatsPorSeccion } from "../utils/examenStats";
import { PREGUNTAS } from "../data/examen";
import { FilaChips } from "../components/FilaChips";
import { inputStyle } from "../utils/tutorias";

import { AiOutlineClose } from "react-icons/ai";
import {
  HiOutlinePrinter, HiOutlineAcademicCap, HiOutlineFlag, HiOutlineClock,
  HiOutlineMagnifyingGlass, HiChevronDown, HiChevronUp, HiOutlineUserGroup,
} from "react-icons/hi2";
import { GiJewelCrown, GiQueenCrown } from "react-icons/gi";
import { CgCrown } from "react-icons/cg";
import { ImTrophy } from "react-icons/im";
import { SiBookstack } from "react-icons/si";
import { PiSmileySadLight } from "react-icons/pi";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { LuTurtle } from "react-icons/lu";
import { PiEmpty } from "react-icons/pi";

const CATEGORIAS = [
  { id: "matematicas", label: "Matemáticas", color: "#4f8ef7" },
  { id: "espanol", label: "Español y comprensión lectora", color: "#22c55e" },
  { id: "ingles", label: "Inglés", color: "#f59e0b" },
  { id: "habitos", label: "Hábitos y organización de estudio", color: "#a855f7" },
  { id: "estres", label: "Manejo del estrés en exámenes", color: "#ef4444" },
];

// ── Helpers de formato ──────────────────────────────────────────────────────
const fmtTiempo = (seg) => {
  const m = Math.floor(Math.abs(seg ?? 0) / 60);
  const s = Math.abs(seg ?? 0) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};
const fmtMinSeg = (seg) => {
  if (seg == null) return "—";
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return m === 0 ? `${s}s` : `${m}m ${s}s`;
};
const fmtFecha = (ts) =>
  ts ? new Date(ts).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : "—";

function nivelExamen(precision) {
  if (precision >= 97) return { texto: "A+", color: "#22c55e", emoji: <GiJewelCrown /> };
  if (precision >= 90) return { texto: "A", color: "#4ade80", emoji: <GiQueenCrown /> };
  if (precision >= 80) return { texto: "B", color: "#a3e635", emoji: <CgCrown /> };
  if (precision >= 70) return { texto: "C", color: "#f59e0b", emoji: <ImTrophy /> };
  if (precision >= 60) return { texto: "D", color: "#f97316", emoji: <SiBookstack /> };
  return { texto: "F", color: "#ef4444", emoji: <PiSmileySadLight /> };
}

function nivelPreparacion(autoevaluacion) {
  const valores = CATEGORIAS.map((c) => autoevaluacion?.[c.id]).filter((v) => typeof v === "number");
  if (valores.length === 0) return { pct: null, texto: "Sin datos suficientes", color: "var(--text-muted)" };
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  const pct = Math.round((promedio / 5) * 100);
  const nivel = pct >= 85 ? { texto: "Muy preparado", color: "#22c55e" }
    : pct >= 65 ? { texto: "Buen avance", color: "#a3e635" }
    : pct >= 45 ? { texto: "En desarrollo", color: "#f59e0b" }
    : { texto: "Etapa inicial", color: "#ef4444" };
  return { pct, ...nivel };
}

// ── Adaptadores: state de navegación / fila de Supabase → forma común ──────
function adaptarFormulario(f, desdeState) {
  if (desdeState) {
    return {
      nombre: f.datosPersonales?.nombre,
      edad: f.datosPersonales?.edad,
      email: f.datosPersonales?.email,
      telefono: f.datosPersonales?.telefono,
      grado: f.grado,
      areaInteres: f.areaInteres,
      carreraInteres: f.carreraInteres,
      autoevaluacion: f.autoevaluacion,
      horasEstudio: f.horasEstudio,
      preferencias: f.preferencias,
      generadoEn: f.generadoEn,
    };
  }
  return {
    nombre: f.nombre,
    edad: f.edad,
    email: f.email_contacto,
    telefono: f.telefono,
    grado: f.grado,
    areaInteres: f.area_interes,
    carreraInteres: f.carrera_interes,
    autoevaluacion: f.autoevaluacion,
    horasEstudio: f.horas_estudio,
    preferencias: f.preferencias,
    generadoEn: f.creado_en,
  };
}

function adaptarExamen(e, desdeState) {
  if (desdeState) {
    const statsPorSeccion = calcularStatsPorSeccion({
      preguntas: e.preguntas, secciones: e.secciones, respuestas: e.respuestas,
    });
    const correctas = e.preguntas.filter((p) => e.respuestas[p.id] === p.inciso_correcto).length;
    const precisionGlobal = e.preguntas.length ? Math.round((correctas / e.preguntas.length) * 100) : 0;
    return {
      precisionGlobal,
      statsPorSeccion: statsPorSeccion.map((s) => ({ nombre: s.nombre, correctas: s.correctas, total: s.total, color: s.color })),
      tiempoTotalSegundos: e.tiempoTotalSegundos,
      respuestas: e.respuestas,
      tiemposPregunta: e.tiemposPregunta,
      marcadas: e.marcadas ?? [],
      preguntas: e.preguntas,
      generadoEn: Date.now(),
      tieneDetalle: true,
    };
  }
  return {
    precisionGlobal: e.precision_global,
    statsPorSeccion: e.stats_por_seccion,
    tiempoTotalSegundos: e.tiempo_total_segundos,
    respuestas: e.respuestas ?? {},
    tiemposPregunta: e.tiempos_pregunta ?? {},
    marcadas: e.marcadas ?? [],
    // Las preguntas no se duplican en la tabla: se rehidratan del banco
    // actual por id. Si el banco cambió desde que se presentó el examen,
    // el detalle por pregunta podría no coincidir exactamente — limitación
    // conocida y aceptable para un historial de consulta.
    preguntas: PREGUNTAS,
    generadoEn: e.creado_en,
    tieneDetalle: Boolean(e.respuestas),
  };
}

// ── Piezas de UI compartidas (densidad pensada para lectura de maestro) ────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Tarjeta({ children }) {
  return (
    <div style={{ background: "var(--surface2)", border: "0.5px solid var(--surface)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
      {children}
    </div>
  );
}

function MetricCard({ icono, label, valor, sub, color = "#7c5cbf" }) {
  return (
    <div style={{ background: "var(--surface2)", borderLeft: `3px solid ${color}`, borderRadius: 10, padding: "9px 11px", display: "flex", flexDirection: "column", gap: 2, minHeight: 44 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12, color }}>{icono}</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 0.3 }}>{label}</span>
      </div>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", lineHeight: 1.25 }}>{valor ?? "—"}</span>
      {sub && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{sub}</span>}
    </div>
  );
}

function Barra({ label, valorTexto, pct, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12.5, color: "var(--text)" }}>{label}</span>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{valorTexto}</span>
      </div>
      <div style={{ height: 7, background: "var(--surface)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function FilaDato({ label, valor }) {
  if (!valor) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "0.5px solid var(--surface)" }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 600, textAlign: "right" }}>{valor}</span>
    </div>
  );
}

// ── Vista: formulario de área ───────────────────────────────────────────────
function VistaFormulario({ datos }) {
  const nivel = useMemo(() => nivelPreparacion(datos.autoevaluacion), [datos.autoevaluacion]);
  return (
    <div>
      <Section title="Índice de preparación">
        <div style={{ border: `1px solid ${nivel.color}40`, borderLeft: `4px solid ${nivel.color}`, background: "var(--surface2)", borderRadius: "var(--radius)", padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: nivel.color, minWidth: 54 }}>
            {nivel.pct !== null ? `${nivel.pct}%` : "—"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: nivel.color }}>{nivel.texto}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Basado en su autoevaluación por área</div>
          </div>
        </div>
      </Section>

      <Section title="Datos clave">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <MetricCard icono={<HiOutlineAcademicCap />} label="Grado" valor={datos.grado} color="#7c5cbf" />
          <MetricCard icono={<HiOutlineFlag />} label="Área de interés" valor={datos.areaInteres} color="#f59e0b" />
          <MetricCard icono={<HiOutlineClock />} label="Horas de estudio/sem." valor={datos.horasEstudio} color="#4f8ef7" />
          <MetricCard icono={<HiOutlineAcademicCap />} label="Carrera de interés" valor={datos.carreraInteres} color="#22c55e" />
        </div>
      </Section>

      <Section title="Detalle por área">
        <Tarjeta>
          {CATEGORIAS.map((c) => {
            const v = datos.autoevaluacion?.[c.id];
            return <Barra key={c.id} label={c.label} valorTexto={v ? `${v}/5` : "—"} pct={v ? (v / 5) * 100 : 0} color={c.color} />;
          })}
        </Tarjeta>
      </Section>

      <Section title="Preferencias de estudio">
        <Tarjeta>
          <FilaDato label="Horario preferido" valor={datos.preferencias?.horarioPreferido} />
          <FilaDato label="Modalidad preferida" valor={datos.preferencias?.modalidadPreferida} />
          <FilaDato label="¿Ya decidió su carrera?" valor={datos.preferencias?.decisionCarrera} />
        </Tarjeta>
      </Section>

      <Section title="Contacto">
        <Tarjeta>
          <FilaDato label="Edad" valor={datos.edad} />
          <FilaDato label="Correo" valor={datos.email} />
          <FilaDato label="Teléfono" valor={datos.telefono} />
        </Tarjeta>
      </Section>
    </div>
  );
}

// ── Vista: examen simulador ─────────────────────────────────────────────────
function VistaExamen({ datos }) {
  const nivel = nivelExamen(datos.precisionGlobal);
  const tiempos = Object.values(datos.tiemposPregunta ?? {}).filter((t) => typeof t === "number");
  const tiempoMax = tiempos.length ? Math.max(...tiempos) : null;
  const tiempoMin = tiempos.length ? Math.min(...tiempos) : null;
  const tiempoPromedio = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : null;
  const totalPreguntas = datos.statsPorSeccion?.reduce((a, s) => a + s.total, 0) ?? 0;
  const sinContestar = datos.tieneDetalle ? datos.preguntas.filter((p) => !datos.respuestas?.[p.id]).length : null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 26, color: nivel.color }}>{nivel.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: nivel.color }}>{datos.precisionGlobal}%</div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
            {fmtTiempo(datos.tiempoTotalSegundos)} · {totalPreguntas} preguntas
          </div>
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: nivel.color, background: `${nivel.color}15`, padding: "8px 12px", borderRadius: 16, border: `1px solid ${nivel.color}30` }}>
          {nivel.texto}
        </span>
      </div>

      {tiempos.length > 0 && (
        <Section title="Tiempos">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <MetricCard icono={<HiOutlineClock />} label="Promedio/pregunta" valor={fmtMinSeg(tiempoPromedio)} color="#4f8ef7" />
            <MetricCard icono={<AiOutlineThunderbolt />} label="Más rápido" valor={fmtMinSeg(tiempoMin)} color="#22c55e" />
            <MetricCard icono={<LuTurtle />} label="Más lento" valor={fmtMinSeg(tiempoMax)} color="#f59e0b" />
            {sinContestar !== null && (
              <MetricCard icono={<PiEmpty />} label="Sin contestar" valor={sinContestar} color={sinContestar > 0 ? "#ef4444" : "#22c55e"} />
            )}
          </div>
        </Section>
      )}

      <Section title="Por área">
        <Tarjeta>
          {(datos.statsPorSeccion ?? []).map((sec) => {
            const pct = sec.total > 0 ? Math.round((sec.correctas / sec.total) * 100) : 0;
            return <Barra key={sec.nombre} label={sec.nombre} valorTexto={`${sec.correctas}/${sec.total} · ${pct}%`} pct={pct} color={sec.color} />;
          })}
        </Tarjeta>
      </Section>

      {!datos.tieneDetalle && (
        <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontStyle: "italic", margin: "0 0 18px" }}>
          Este resultado se guardó antes de registrar el detalle por pregunta; solo se muestra el resumen por área.
        </p>
      )}

      {datos.tieneDetalle && (datos.marcadas?.length ?? 0) > 0 && (
        <Section title={`Preguntas marcadas (${datos.marcadas.length})`}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {datos.marcadas.map((id) => {
              const p = datos.preguntas.find((q) => q.id === id);
              const esCor = datos.respuestas[id] === p?.inciso_correcto;
              return (
                <div key={id} style={{ background: esCor ? "#14532d" : "#450a0a", border: `1px solid ${esCor ? "#166534" : "#7f1d1d"}`, borderRadius: 8, padding: "5px 10px", fontSize: 11.5, color: esCor ? "#86efac" : "#fca5a5" }}>
                  {id}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {datos.tieneDetalle && (
        <Section title="Detalle de respuestas">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {datos.preguntas.map((p) => {
              const resp = datos.respuestas[p.id];
              const correc = p.inciso_correcto;
              const acierto = resp === correc;
              const tiempo = datos.tiemposPregunta?.[p.id];
              let estado;
              if (!resp) estado = { bg: "var(--surface2)", border: "var(--surface)", dot: "#6b7280" };
              else if (acierto) estado = { bg: "#14532d", border: "#166534", dot: "#22c55e" };
              else estado = { bg: "#450a0a", border: "#7f1d1d", dot: "#ef4444" };
              return (
                <div key={p.id} style={{ background: estado.bg, border: `0.5px solid ${estado.border}`, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: estado.dot, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, fontSize: 11.5 }}>
                    <span style={{ color: "var(--text-muted)" }}>{p.id} </span>
                    <span style={{ color: "var(--text)" }}>{p.pregunta.slice(0, 55)}{p.pregunta.length > 55 ? "…" : ""}</span>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, fontSize: 11 }}>
                    <div style={{ color: "var(--text-muted)" }}>
                      {resp ? `Su: ${resp}` : "Sin resp."}{!acierto && resp && ` · Cor: ${correc}`}
                    </div>
                    {tiempo != null && <div style={{ color: "var(--text-muted)", opacity: 0.7 }}>{fmtMinSeg(tiempo)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Encabezado sticky reutilizable ──────────────────────────────────────────
function Topbar({ titulo, onSalir, onImprimir }) {
  return (
    <header className="page-topbar-compact no-print" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
      <button onClick={onSalir} title="Salir" className="page-topbar-btn">
        <AiOutlineClose />
      </button>
      <h2 className="page-topbar-title" style={{ fontSize: "1rem", flex: 1 }}>{titulo}</h2>
      {onImprimir && (
        <div className="page-topbar-actions">
          <button onClick={onImprimir} title="Imprimir / Guardar PDF" className="util-btn" style={{ color: "#7c5cbf" }}>
            <HiOutlinePrinter />
          </button>
        </div>
      )}
    </header>
  );
}

// ── Modo alumno: recién llenó el formulario ────────────────────────────────
function PaginaFormulario({ formulario, navigate }) {
  const datos = useMemo(() => adaptarFormulario(formulario, true), [formulario]);
  return (
    <div className="informe-print" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Topbar titulo="Informe de preparación" onSalir={() => navigate("/")} onImprimir={() => window.print()} />
      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7c5cbf", fontWeight: 700 }}>PrepaApp</p>
          <h1 style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 800 }}>
            Informe de {datos.nombre || "Preparación Universitaria"}
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-muted)" }}>Generado el {fmtFecha(datos.generadoEn)}</p>
        </div>
        <VistaFormulario datos={datos} />
        <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={() => navigate("/")} style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "0.5px solid var(--surface)", background: "var(--surface2)", color: "var(--text)", fontWeight: 600, fontSize: 14 }}>
            Volver al inicio
          </button>
          <button onClick={() => window.print()} style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "none", background: "#7c5cbf", color: "#fff", fontWeight: 600, fontSize: 14 }}>
            Imprimir informe
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Modo alumno: recién terminó el examen ──────────────────────────────────
function PaginaExamen({ examen, navigate }) {
  const datos = useMemo(() => adaptarExamen(examen, true), [examen]);
  return (
    <div className="informe-print" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Topbar titulo="Resultados del examen" onSalir={() => navigate("/")} onImprimir={() => window.print()} />
      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 40 }}>
        <VistaExamen datos={datos} />
        <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={() => navigate("/")} style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "0.5px solid var(--surface)", background: "var(--surface2)", color: "var(--text)", fontWeight: 600, fontSize: 14 }}>
            Volver al inicio
          </button>
          <button onClick={() => window.print()} style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "none", background: "#4f8ef7", color: "#fff", fontWeight: 600, fontSize: 14 }}>
            Imprimir resultados
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Modo maestro: búsqueda por correo(s) ───────────────────────────────────
function TarjetaAlumno({ alumno }) {
  const [abierto, setAbierto] = useState(false);
  const [idxFormulario, setIdxFormulario] = useState(0);
  const [idxExamen, setIdxExamen] = useState(0);

  const formulario = alumno.formularios[idxFormulario];
  const examen = alumno.examenes[idxExamen];
  const nombre = alumno.formularios[0]?.nombre;
  const precision = alumno.examenes[0]?.precision_global;
  const prep = alumno.formularios[0] ? nivelPreparacion(alumno.formularios[0].autoevaluacion) : null;

  return (
    <div className="sp-card" style={{ margin: 0 }}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        style={{ background: "none", border: "none", padding: 0, width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, minHeight: 44 }}
      >
        <div className="sp-card-icon" style={{ background: "rgba(124,92,191,0.15)", color: "#7c5cbf" }}>
          {(nombre || alumno.email)[0]?.toUpperCase()}
        </div>
        <div className="sp-card-body">
          <p className="sp-card-title">{nombre || "Sin nombre"}</p>
          <p className="sp-card-description">{alumno.email}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {prep?.pct != null && (
            <span style={{ fontSize: 11, fontWeight: 700, color: prep.color, background: `${prep.color}15`, padding: "4px 8px", borderRadius: 10 }}>
              {prep.pct}%
            </span>
          )}
          {precision != null && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4f8ef7", background: "rgba(79,142,247,0.15)", padding: "4px 8px", borderRadius: 10 }}>
              Ex. {precision}%
            </span>
          )}
          <span style={{ fontSize: 18, color: "var(--text-muted)", display: "flex" }}>{abierto ? <HiChevronUp /> : <HiChevronDown />}</span>
        </div>
      </button>

      {abierto && (
        <div style={{ borderTop: "0.5px solid var(--surface)", paddingTop: 14 }}>
          {!formulario && !examen && (
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", textAlign: "center", margin: "8px 0" }}>
              Este correo no tiene formulario de área ni examen registrados todavía.
            </p>
          )}

          {formulario && (
            <>
              {alumno.formularios.length > 1 && (
                <SelectorHistorico items={alumno.formularios} idx={idxFormulario} onChange={setIdxFormulario} campoFecha="creado_en" etiqueta="formulario" />
              )}
              <VistaFormulario datos={adaptarFormulario(formulario, false)} />
            </>
          )}

          {examen && (
            <>
              {alumno.examenes.length > 1 && (
                <SelectorHistorico items={alumno.examenes} idx={idxExamen} onChange={setIdxExamen} campoFecha="creado_en" etiqueta="examen" />
              )}
              <VistaExamen datos={adaptarExamen(examen, false)} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SelectorHistorico({ items, idx, onChange, campoFecha, etiqueta }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
      {items.map((it, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          style={{
            fontSize: 11, padding: "5px 10px", borderRadius: 8, cursor: "pointer",
            border: i === idx ? "1.5px solid #7c5cbf" : "0.5px solid var(--surface)",
            background: i === idx ? "rgba(124,92,191,0.15)" : "transparent",
            color: i === idx ? "#7c5cbf" : "var(--text-muted)",
          }}
        >
          {i === 0 ? "Más reciente" : fmtFecha(it[campoFecha])} · {etiqueta}
        </button>
      ))}
    </div>
  );
}

function PaginaMaestro({ user, navigate }) {
  const [emailsInput, setEmailsInput] = useState("");
  const [alumnos, setAlumnos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  async function buscar() {
    const emails = Array.from(new Set(
      emailsInput.split(/[\n,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean)
    ));
    if (emails.length === 0) return setErrorBusqueda("Escribe al menos un correo.");
    if (!user) return setErrorBusqueda("Inicia sesión para consultar informes.");
    setErrorBusqueda("");
    setCargando(true);
    const resultado = await Promise.all(emails.map(async (email) => {
      const [formularios, examenes] = await Promise.all([
        obtenerFormulariosPorEmail(email),
        obtenerResultadosPorEmail(email),
      ]);
      return { email, formularios, examenes };
    }));
    setCargando(false);
    setAlumnos(resultado);
  }

  const alumnosFiltrados = useMemo(() => {
    if (!alumnos) return [];
    const q = busqueda.trim().toLowerCase();
    return alumnos.filter((a) => {
      if (filtro === "Con formulario" && a.formularios.length === 0) return false;
      if (filtro === "Con examen" && a.examenes.length === 0) return false;
      if (!q) return true;
      const nombre = a.formularios[0]?.nombre?.toLowerCase() ?? "";
      return a.email.includes(q) || nombre.includes(q);
    });
  }, [alumnos, busqueda, filtro]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Topbar titulo="Informes de alumnos" onSalir={() => navigate("/tutorias/maestro")} />
      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 14 }}>

        <div className="sp-card" style={{ margin: 0, position: "sticky", top: 60, zIndex: 20 }}>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.5 }}>
            Pega uno o varios correos (separados por coma o salto de línea) para ver el formulario de área y el examen simulador de cada alumno.
          </p>
          <textarea
            style={{ ...inputStyle, minHeight: 64, resize: "vertical" }}
            placeholder={"alumno1@correo.com\nalumno2@correo.com"}
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
          />
          {errorBusqueda && <p style={{ color: "var(--wrong)", fontSize: 12.5, margin: "8px 0 0" }}>{errorBusqueda}</p>}
          <button
            onClick={buscar}
            disabled={cargando}
            style={{ marginTop: 10, minHeight: 44, borderRadius: 10, border: "none", background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: cargando ? 0.7 : 1 }}
          >
            <HiOutlineMagnifyingGlass /> {cargando ? "Buscando…" : "Buscar"}
          </button>
        </div>

        {alumnos && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                style={inputStyle}
                placeholder="Filtrar por nombre o correo…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <FilaChips opciones={["Todos", "Con formulario", "Con examen"]} valor={filtro} onChange={setFiltro} color="#22c55e" />
            </div>

            <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <HiOutlineUserGroup /> {alumnosFiltrados.length} de {alumnos.length} alumno(s)
            </p>

            {alumnosFiltrados.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: "20px 0" }}>
                Ningún alumno coincide con el filtro.
              </p>
            )}

            {alumnosFiltrados.map((a) => <TarjetaAlumno key={a.email} alumno={a} />)}
          </>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function InformeResultados() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = location.state;

  if (state?.tipo === "formulario") return <PaginaFormulario formulario={state.formulario} navigate={navigate} />;
  if (state?.tipo === "examen") return <PaginaExamen examen={state.examen} navigate={navigate} />;
  return <PaginaMaestro user={user} navigate={navigate} />;
}
