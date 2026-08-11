// FormularioArea.jsx
// Formulario general de orientación universitaria: identifica el área a la
// que el aspirante desea aplicar, su grado de preparatoria, una autoevaluación
// (NO es un examen de admisión) y preferencias de estudio.
// Navega a: /informe (con state completo) → ver Informe.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { FilaChips } from "../components/FilaChips";

import { AiOutlineClose } from "react-icons/ai";
import { FaUserGraduate } from "react-icons/fa";
import {
  HiOutlineUser,
  HiOutlineFlag,
  HiOutlineChartBarSquare,
  HiOutlineAdjustmentsHorizontal,
} from "react-icons/hi2";

// ── Datos de opciones ─────────────────────────────────────────────────────
const AREAS_INTERES = [
  "Ciencias Exactas e Ingeniería",
  "Ciencias de la Salud",
  "Ciencias Sociales",
  "Económico-Administrativas",
  "Artes y Humanidades",
  "Aún no lo decido",
];

const GRADOS = ["1° de prepa", "2° de prepa", "3° de prepa", "Egresado/a"];

const CATEGORIAS_AUTOEVALUACION = [
  { id: "matematicas", label: "Matemáticas" },
  { id: "espanol", label: "Español y comprensión lectora" },
  { id: "ingles", label: "Inglés" },
  { id: "habitos", label: "Hábitos y organización de estudio" },
  { id: "estres", label: "Manejo del estrés en exámenes" },
];

const NIVEL_LABELS = { 1: "Muy bajo", 2: "Bajo", 3: "Regular", 4: "Bueno", 5: "Muy bueno" };

// En móvil, el teclado tapa la mitad inferior de la pantalla: sin esto, un
// campo cerca del final del formulario queda oculto al enfocarlo y, al ser
// la última sección, no hay nada más abajo hacia dónde desplazarse para
// compensar. El setTimeout espera a que el teclado termine de abrirse antes
// de medir dónde centrar el campo.
function manejarFocoCampo(e) {
  const tag = e.target.tagName;
  if (tag !== "INPUT" && tag !== "TEXTAREA") return;
  const el = e.target;
  setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 300);
}

const HORAS_ESTUDIO = ["Menos de 2h", "2 a 5h", "5 a 10h", "Más de 10h"];
const HORARIOS = ["Mañana", "Tarde", "Noche"];
const MODALIDADES = ["Presencial", "En línea", "Mixta"];
const DECISION_CARRERA = ["Sí, ya la sé", "Tengo dudas", "No, aún no"];

// ── Estilos compartidos ───────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  minHeight: 44,
  background: "var(--surface)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  padding: "12px 14px",
  color: "var(--text)",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
};

// ── Tarjeta de sección (mismo lenguaje visual que Store.jsx: sp-card) ─────
function Seccion({ icono, color, title, subtitle, children }) {
  return (
    <div className="sp-card">
      <div className="sp-card-header">
        <div className="sp-card-icon" style={{ background: `${color}22`, color }}>
          {icono}
        </div>
        <div className="sp-card-body">
          <p className="sp-card-title">{title}</p>
          {subtitle && <p className="sp-card-description">{subtitle}</p>}
        </div>
      </div>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

// ── Escala 1-5 para autoevaluación ────────────────────────────────────────
function Escala({ label, valor, onChange, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "var(--text)" }}>{label}</span>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
          {valor ? NIVEL_LABELS[valor] : "Sin responder"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              border: valor === n ? `1.5px solid ${color}` : "0.5px solid var(--surface)",
              background: valor === n ? color : "var(--surface)",
              color: valor === n ? "#fff" : "var(--text-muted)",
              transition: "all 0.15s",
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function FormularioArea() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [telefono, setTelefono] = useState("");

  const [grado, setGrado] = useState("");
  const [areaInteres, setAreaInteres] = useState("");
  const [carreraInteres, setCarreraInteres] = useState("");

  const [autoevaluacion, setAutoevaluacion] = useState({});
  const [horasEstudio, setHorasEstudio] = useState("");

  const [horarioPreferido, setHorarioPreferido] = useState("");
  const [modalidadPreferida, setModalidadPreferida] = useState("");
  const [decisionCarrera, setDecisionCarrera] = useState("");

  const [error, setError] = useState("");

  const setNivel = (id, n) => setAutoevaluacion((prev) => ({ ...prev, [id]: n }));

  async function generarInforme() {
    if (!nombre.trim()) return setError("Escribe tu nombre para generar el informe.");
    if (!grado) return setError("Selecciona tu grado de preparatoria.");
    if (!areaInteres) return setError("Selecciona el área a la que deseas aplicar.");
    setError("");

    // Se persiste en Supabase (solo si hay sesión) para que /tutorias pueda
    // verificar server-side que este formulario ya se completó, y para
    // poder mandarle este reporte a un maestro más adelante. Si el insert
    // falla no debe bloquear al usuario de ver su informe: solo se loguea.
    if (user) {
      try {
        await supabase.from("formularios_area").insert({
          user_id: user.id,
          nombre: nombre.trim(),
          edad: edad.trim(),
          email_contacto: email.trim(),
          telefono: telefono.trim(),
          grado,
          area_interes: areaInteres,
          carrera_interes: carreraInteres.trim(),
          autoevaluacion,
          horas_estudio: horasEstudio,
          preferencias: { horarioPreferido, modalidadPreferida, decisionCarrera },
        });
      } catch (err) {
        console.error("No se pudo guardar el formulario de área:", err);
      }
    }

    navigate("/informe", {
      state: {
        datosPersonales: { nombre: nombre.trim(), edad: edad.trim(), email: email.trim(), telefono: telefono.trim() },
        grado,
        areaInteres,
        carreraInteres: carreraInteres.trim(),
        autoevaluacion,
        horasEstudio,
        preferencias: { horarioPreferido, modalidadPreferida, decisionCarrera },
        generadoEn: Date.now(),
      },
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ── BARRA SUPERIOR ── */}
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <span className="page-topbar-btn" style={{ fontSize: "1.35rem" }}>
          <FaUserGraduate />
        </span>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Formulario Área</h2>
      </header>

      {/* ── CUERPO ── */}
      <main
        className="page-content-compact"
        onFocus={manejarFocoCampo}
        style={{ flex: 1, paddingBottom: "45vh", display: "flex", flexDirection: "column", gap: 16 }}
      >

        <Seccion icono={<HiOutlineUser />} color="#4f8ef7" title="Datos personales">
          <input style={inputStyle} placeholder="Nombre completo *" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <div style={{ display: "flex", gap: 10 }}>
            <input style={inputStyle} placeholder="Edad" type="number" min="10" max="99" value={edad} onChange={(e) => setEdad(e.target.value)} />
            <input style={inputStyle} placeholder="Teléfono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>
          <input style={inputStyle} placeholder="Correo de contacto" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Seccion>

        <Seccion icono={<FaUserGraduate />} color="#7c5cbf" title="Grado de preparatoria">
          <FilaChips opciones={GRADOS} valor={grado} onChange={setGrado} color="#7c5cbf" />
        </Seccion>

        <Seccion icono={<HiOutlineFlag />} color="#f59e0b" title="Área a la que deseas aplicar" subtitle="Elige el área que más te llama la atención para tu carrera universitaria.">
          <FilaChips opciones={AREAS_INTERES} valor={areaInteres} onChange={setAreaInteres} color="#f59e0b" />
          <input
            style={inputStyle}
            placeholder="Carrera o universidad de interés (opcional)"
            value={carreraInteres}
            onChange={(e) => setCarreraInteres(e.target.value)}
          />
        </Seccion>

        <Seccion icono={<HiOutlineChartBarSquare />} color="#22c55e" title="Autoevaluación" subtitle="Del 1 al 5, ¿qué tan preparado te sientes en cada área? Sé honesto, no hay respuestas incorrectas.">
          {CATEGORIAS_AUTOEVALUACION.map((cat) => (
            <Escala key={cat.id} label={cat.label} valor={autoevaluacion[cat.id]} onChange={(n) => setNivel(cat.id, n)} color="#22c55e" />
          ))}
          <div>
            <p style={{ fontSize: 13, color: "var(--text)", marginBottom: 8 }}>¿Cuántas horas a la semana dedicas a estudiar?</p>
            <FilaChips opciones={HORAS_ESTUDIO} valor={horasEstudio} onChange={setHorasEstudio} color="#22c55e" />
          </div>
        </Seccion>

        <Seccion icono={<HiOutlineAdjustmentsHorizontal />} color="#ec4899" title="Preferencias de estudio">
          <div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Horario en el que estudias mejor</p>
            <FilaChips opciones={HORARIOS} valor={horarioPreferido} onChange={setHorarioPreferido} color="#ec4899" />
          </div>
          <div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Modalidad que prefieres</p>
            <FilaChips opciones={MODALIDADES} valor={modalidadPreferida} onChange={setModalidadPreferida} color="#ec4899" />
          </div>
          <div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>¿Ya sabes qué carrera quieres estudiar?</p>
            <FilaChips opciones={DECISION_CARRERA} valor={decisionCarrera} onChange={setDecisionCarrera} color="#ec4899" />
          </div>
        </Seccion>

        {error && (
          <p style={{ color: "var(--wrong)", fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>
        )}
      </main>

      {/* ── BARRA INFERIOR ── */}
      <footer className="page-footer-fixed">
        <button onClick={generarInforme} className="btn-footer-scroll" style={{ flex: 1, minHeight: 44, background: "#7c5cbf", color: "#fff", border: "none", fontSize: 14 }}>
          Generar informe
        </button>
      </footer>
    </div>
  );
}
