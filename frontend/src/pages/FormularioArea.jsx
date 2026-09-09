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
import { Seccion } from "../components/Seccion";
import ConfirmDialog from "../components/ConfirmDialog";
import { useConfirmarSalida } from "../hooks/useConfirmarSalida";

import { AiOutlineClose } from "react-icons/ai";
import { FaUserGraduate } from "react-icons/fa";
import {
  HiOutlineUser,
  HiOutlineFlag,
  HiOutlineChartBarSquare,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineUserGroup,
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

// Acento de color arriba de cada tarjeta de sección — un guiño visual a que
// el formulario tiene varios bloques distintos, sin tocar Seccion.jsx (se
// reusa en Tutorías y no queremos que ese acento aparezca ahí también).
const acento = (color) => ({ borderTop: `2.5px solid ${color}` });

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

// ── Escala 1-5 para autoevaluación ────────────────────────────────────────
function Escala({ label, valor, onChange, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
        <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: valor ? color : "var(--text-muted)" }}>
          {valor ? NIVEL_LABELS[valor] : "Sin responder"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const activo = valor === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              style={{
                flex: 1,
                minHeight: 40,
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 13,
                border: activo ? `1.5px solid ${color}` : "0.5px solid var(--surface)",
                background: activo ? color : "var(--surface)",
                color: activo ? "#fff" : "var(--text-muted)",
                boxShadow: activo ? `0 3px 10px -3px ${color}99` : "none",
                transform: activo ? "translateY(-1px)" : "none",
                transition: "all 0.15s ease",
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          );
        })}
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

  const [tutorNombre, setTutorNombre] = useState("");
  const [tutorTelefono, setTutorTelefono] = useState("");

  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState(null);

  const setNivel = (id, n) => setAutoevaluacion((prev) => ({ ...prev, [id]: n }));

  // Barra de progreso: solo cuenta los campos que de verdad indican avance
  // (no los opcionales como edad/teléfono/carrera) para que no se sienta
  // "atorada" en alguien que solo llena lo obligatorio.
  const CAMPOS_PROGRESO = 3 + CATEGORIAS_AUTOEVALUACION.length + 4;
  const camposListos = [
    nombre.trim(), grado, areaInteres,
    ...CATEGORIAS_AUTOEVALUACION.map((c) => autoevaluacion[c.id]),
    horasEstudio, horarioPreferido, modalidadPreferida, decisionCarrera,
  ].filter(Boolean).length;
  const progreso = Math.round((camposListos / CAMPOS_PROGRESO) * 100);

  // Solo avisa si ya hay algo que perder (no molesta si el alumno abre el
  // formulario y se arrepiente de inmediato, sin haber tocado nada).
  const hayDatosSinGuardar = Boolean(
    nombre.trim() || edad.trim() || telefono.trim() || grado || areaInteres ||
    carreraInteres.trim() || Object.keys(autoevaluacion).length > 0 ||
    horasEstudio || horarioPreferido || modalidadPreferida || decisionCarrera ||
    tutorNombre.trim() || tutorTelefono.trim()
  );

  // Salir a medio llenar (botón "X" o Atrás del navegador) pierde todo:
  // nada se guarda hasta enviar el formulario. `replace: true` sobreescribe
  // la entrada "centinela" que empuja useConfirmarSalida, para no dejar un
  // "atrás" fantasma que regrese aquí de nuevo.
  function confirmarSalir() {
    if (!hayDatosSinGuardar) return navigate('/');
    setConfirmacion({
      titulo: "Salir del formulario",
      mensaje: "Perderás los datos que ya llenaste: no se guarda nada hasta enviarlo. ¿Salir de todas formas?",
      textoConfirmar: "Salir",
      colorConfirmar: "var(--wrong)",
      accion: () => navigate('/', { replace: true }),
    });
  }

  useConfirmarSalida(hayDatosSinGuardar, confirmarSalir);

  function mostrarError(texto) {
    setError(texto);
    setTimeout(() => setError(""), 2600);
  }

  async function generarInforme() {
    if (!nombre.trim()) return mostrarError("Escribe tu nombre para generar el informe.");
    if (!grado) return mostrarError("Selecciona tu grado de preparatoria.");
    if (!areaInteres) return mostrarError("Selecciona el área a la que deseas aplicar.");
    setError("");

    // Se persiste en Supabase (solo si hay sesión) para que /tutorias pueda
    // verificar server-side que este formulario ya se completó, y para
    // poder mandarle este reporte a un maestro más adelante. Si el insert
    // falla no debe bloquear al usuario de ver su informe: solo se loguea.
    // (El insert de supabase-js resuelve { data, error } y no lanza para
    // errores de Postgres/RLS, así que hay que revisar `error` a mano — un
    // try/catch aquí no lo detecta. Si falla, el pill "Formulario Área" en
    // /tutorias se queda clicable para volver a intentarlo.)
    if (user) {
      const { error: errorInsert } = await supabase.from("formularios_area").insert({
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
        tutor_nombre: tutorNombre.trim(),
        tutor_telefono: tutorTelefono.trim(),
      });
      if (errorInsert) console.error("No se pudo guardar el formulario de área:", errorInsert.message);
    }

    navigate("/informe-resultados", {
      replace: true,
      state: {
        tipo: "formulario",
        formulario: {
          datosPersonales: { nombre: nombre.trim(), edad: edad.trim(), email: email.trim(), telefono: telefono.trim() },
          grado,
          areaInteres,
          carreraInteres: carreraInteres.trim(),
          autoevaluacion,
          horasEstudio,
          preferencias: { horarioPreferido, modalidadPreferida, decisionCarrera },
          tutor: { nombre: tutorNombre.trim(), telefono: tutorTelefono.trim() },
          generadoEn: Date.now(),
        },
      },
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ── BARRA SUPERIOR ── */}
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", flexWrap: "wrap", paddingBottom: 10, rowGap: 10 }}>
        <button onClick={confirmarSalir} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <span className="page-topbar-btn" style={{ fontSize: "1.35rem" }}>
          <FaUserGraduate />
        </span>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Formulario Área</h2>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>{progreso}%</span>
        <div style={{ width: "100%", height: 3, borderRadius: 999, background: "var(--surface2)", overflow: "hidden" }}>
          <div
            style={{
              width: `${progreso}%`, height: "100%", borderRadius: 999,
              background: "linear-gradient(90deg, #4f8ef7, #7c5cbf)",
              transition: "width 250ms ease",
            }}
          />
        </div>
      </header>

      {/* ── CUERPO ── */}
      <main
        className="page-content-compact"
        onFocus={manejarFocoCampo}
        style={{ flex: 1, paddingBottom: "45vh", display: "flex", flexDirection: "column", gap: 16 }}
      >

        <Seccion icono={<HiOutlineUser />} color="#4f8ef7" title="Datos personales" style={acento("#4f8ef7")}>
          <input style={inputStyle} placeholder="Nombre completo *" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <div style={{ display: "flex", gap: 10 }}>
            <input style={inputStyle} placeholder="Edad" type="number" min="10" max="99" value={edad} onChange={(e) => setEdad(e.target.value)} />
            <input style={inputStyle} placeholder="Teléfono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>
          <input style={inputStyle} placeholder="Correo de contacto" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Seccion>

        <Seccion icono={<FaUserGraduate />} color="#7c5cbf" title="Grado de preparatoria" style={acento("#7c5cbf")}>
          <FilaChips opciones={GRADOS} valor={grado} onChange={setGrado} color="#7c5cbf" />
        </Seccion>

        <Seccion icono={<HiOutlineFlag />} color="#f59e0b" title="Área a la que deseas aplicar" subtitle="Elige el área que más te llama la atención para tu carrera universitaria." style={acento("#f59e0b")}>
          <FilaChips opciones={AREAS_INTERES} valor={areaInteres} onChange={setAreaInteres} color="#f59e0b" />
          <input
            style={inputStyle}
            placeholder="Carrera o universidad de interés (opcional)"
            value={carreraInteres}
            onChange={(e) => setCarreraInteres(e.target.value)}
          />
        </Seccion>

        <Seccion icono={<HiOutlineChartBarSquare />} color="#22c55e" title="Autoevaluación" subtitle="Del 1 al 5, ¿qué tan preparado te sientes en cada área? Sé honesto, no hay respuestas incorrectas." style={acento("#22c55e")}>
          {CATEGORIAS_AUTOEVALUACION.map((cat) => (
            <Escala key={cat.id} label={cat.label} valor={autoevaluacion[cat.id]} onChange={(n) => setNivel(cat.id, n)} color="#22c55e" />
          ))}
          <div>
            <p style={{ fontSize: 13, color: "var(--text)", marginBottom: 8 }}>¿Cuántas horas a la semana dedicas a estudiar?</p>
            <FilaChips opciones={HORAS_ESTUDIO} valor={horasEstudio} onChange={setHorasEstudio} color="#22c55e" />
          </div>
        </Seccion>

        <Seccion icono={<HiOutlineAdjustmentsHorizontal />} color="#ec4899" title="Preferencias de estudio" style={acento("#ec4899")}>
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

        <Seccion icono={<HiOutlineUserGroup />} color="#06b6d4" title="Tutor o responsable" subtitle="Opcional: nombre y contacto de un padre, madre o tutor." style={acento("#06b6d4")}>
          <input style={inputStyle} placeholder="Nombre del tutor o responsable" value={tutorNombre} onChange={(e) => setTutorNombre(e.target.value)} />
          <input style={inputStyle} placeholder="Teléfono de contacto" type="tel" value={tutorTelefono} onChange={(e) => setTutorTelefono(e.target.value)} />
        </Seccion>

      </main>

      {error && (
        <div className="sp-toast" style={{
          position: "fixed",
          bottom: 88,
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--wrong)",
          color: "#000000",
          fontWeight: 700,
          fontSize: "0.85rem",
          padding: "12px 20px",
          borderRadius: 12,
          maxWidth: "90%",
          textAlign: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          zIndex: 200,
        }}>
          {error}
        </div>
      )}

      {/* ── BARRA INFERIOR ── */}
      <footer className="page-footer-fixed">
        <button
          onClick={generarInforme}
          className="btn-footer-scroll gm-cta"
          style={{
            flex: 1,
            minHeight: 44,
            background: "#7c5cbf",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(124, 92, 191, 0.3)",
          }}
        >
          Generar informe
        </button>
      </footer>

      <ConfirmDialog
        abierto={!!confirmacion}
        titulo={confirmacion?.titulo}
        mensaje={confirmacion?.mensaje}
        textoConfirmar={confirmacion?.textoConfirmar}
        colorConfirmar={confirmacion?.colorConfirmar}
        onCancelar={() => setConfirmacion(null)}
        onConfirmar={() => {
          const accion = confirmacion?.accion;
          setConfirmacion(null);
          if (accion) accion();
        }}
      />
    </div>
  );
}
