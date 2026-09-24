// Respaldo temporal — retirado de src/pages/Tutorias.jsx (acuerdo con
// Lobosimuladores: sin desactivar Tutorías por completo, se oculta solo el
// acceso al portal de Alumnos y la guía rápida de "/tutorias", puntos 1.2
// del acuerdo). El portal de Maestros sigue visible y funcional.
//
// ---------------------------------------------------------------------
// 1) Imports que dejaron de usarse en Tutorias.jsx al quitar este código
//    (había que borrarlos del archivo para no dejar imports muertos):
//
//    import { PiChalkboardTeacher, PiStudent } from "react-icons/pi";
//      -> se restaura como: import { PiChalkboardTeacher, PiStudent } from "react-icons/pi";
//    import { HiChevronLeft } from "react-icons/hi2";
//
// ---------------------------------------------------------------------
// 2) Constantes y componente de la guía rápida (iban antes de `OPCIONES`):

const CLAVE_TUTORIAL_VISTO = "prepaapp_tutorial_tutorias_visto";

const PASOS_TUTORIAL = [
  {
    titulo: "¿Cómo funcionan las Tutorías?",
    texto: "En el portal de Alumnos ves las clases individuales que tus maestros publican: materia, horario, duración y precio. Tú eliges cuál te conviene.",
  },
  {
    titulo: "Antes de reservar",
    texto: "Completa el Examen Simulador y el Formulario de Área desde tu portal de alumno. Con eso, tu maestro conoce tus resultados desde antes y sabe exactamente en qué enfocar tu clase.",
  },
  {
    titulo: "Reserva tu asiento",
    texto: "Al reservar, tu lugar queda apartado 15 minutos mientras completas el pago, así nadie más puede quitártelo mientras decides. Si no pagas a tiempo, se libera solo.",
  },
  {
    titulo: "Después de pagar",
    texto: "El sistema te agrega a un grupo de WhatsApp, donde podrás encontrar a tu maestro y otros compañeros para mandarte la liga de la clase y coordinar cualquier detalle extra directamente contigo.",
  },
];

// Guía corta y descartable (se marca como vista en localStorage) para que un
// alumno nuevo entienda el flujo completo antes de entrar a su portal: por
// qué el examen/formulario son un requisito, qué significa "reservar" (TTL)
// y que el grupo de WhatsApp llega DESPUÉS de pagar, no antes.
function TutorialAlumno({ onCerrar }) {
  const [paso, setPaso] = useState(0);
  const ultimo = paso === PASOS_TUTORIAL.length - 1;
  const actual = PASOS_TUTORIAL[paso];

  return (
    <div className="sp-card" style={{ background: "var(--surface2)", position: "relative" }}>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar guía"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          minWidth: 32,
          minHeight: 32,
          borderRadius: 8,
          border: "none",
          background: "transparent",
          color: "var(--text-muted)",
          fontSize: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <AiOutlineClose />
      </button>

      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: "#7c5cbf", margin: "0 0 6px", textTransform: "uppercase" }}>
        Guía rápida · {paso + 1}/{PASOS_TUTORIAL.length}
      </p>
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "0 24px 6px 0" }}>{actual.titulo}</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 14px" }}>{actual.texto}</p>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, rowGap: 10 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {PASOS_TUTORIAL.map((_, i) => (
            <span
              key={i}
              className={i === paso ? undefined : 'fondo-sutil'}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: i === paso ? "#7c5cbf" : undefined,
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {paso > 0 && (
            <button
              type="button"
              onClick={() => setPaso((p) => p - 1)}
              style={{
                minHeight: 36,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "var(--text-muted)",
                fontWeight: 600,
                fontSize: 12.5,
                display: "flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
              }}
            >
              <HiChevronLeft /> Atrás
            </button>
          )}
          <button
            type="button"
            onClick={() => (ultimo ? onCerrar() : setPaso((p) => p + 1))}
            style={{
              minHeight: 36,
              padding: "0 16px",
              borderRadius: 8,
              border: "none",
              background: "#7c5cbf",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            {ultimo ? "Entendido" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// 3) OPCIONES original (con Alumnos incluido) — en el archivo actual solo
//    quedó la entrada de Maestros:
//
// const OPCIONES = [
//   {
//     to: "/tutorias/alumno",
//     icono: <PiStudent />,
//     color: "#7c5cbf",
//     titulo: "Alumnos",
//     subtitulo: "Reserva una clase con un maestro.",
//   },
//   {
//     to: "/tutorias/maestro",
//     icono: <PiChalkboardTeacher />,
//     color: "#06b6d4",
//     titulo: "Maestros",
//     subtitulo: "Publica tus clases y cobra directo en la app.",
//   },
// ];

// ---------------------------------------------------------------------
// 4) Dentro de `export default function Tutorias()`, el estado y los
//    lugares donde se renderizaba la guía:

  // La guía nunca se oculta del todo: "Entendido" (o la X) solo la manda
  // debajo de las tarjetas de Alumnos/Maestros y sube esas tarjetas al
  // primer lugar. Para quien ya la vio antes, arranca directo abajo (no
  // tiene sentido volver a taparle las tarjetas cada vez que entra).
  // const [tutorialAbajo, setTutorialAbajo] = useState(() => {
  //   try {
  //     return localStorage.getItem(CLAVE_TUTORIAL_VISTO) === "1";
  //   } catch {
  //     return false;
  //   }
  // });
  //
  // function moverTutorialAbajo() {
  //   setTutorialAbajo(true);
  //   try {
  //     localStorage.setItem(CLAVE_TUTORIAL_VISTO, "1");
  //   } catch {
  //     // localStorage puede fallar en modo privado; no es crítico para la guía.
  //   }
  // }

// ... y en el JSX, antes del "¿Qué te gustaría hacer?":
//   {!tutorialAbajo && <TutorialAlumno onCerrar={moverTutorialAbajo} />}
//
// ... y después del grid de tarjetas:
//   {tutorialAbajo && <TutorialAlumno onCerrar={moverTutorialAbajo} />}
//
// NOTA (2026-09-23): el orden de las secciones dentro de <main> cambió
// después de este respaldo — ahora es "¿Cómo vas esta semana?" +
// RankingSemanal PRIMERO, y "¿Qué te gustaría hacer?" + grid de tarjetas
// DESPUÉS (se pidió así porque con una sola tarjeta de Maestros se veía
// mejor el ranking arriba). Al restaurar, la primera <TutorialAlumno />
// sigue yendo justo antes del párrafo "¿Qué te gustaría hacer?" (que ahora
// es el segundo bloque de <main>, no el primero) y la segunda justo
// después del grid, igual que aquí arriba.

// ---------------------------------------------------------------------
// Para restaurar todo: reponer los imports, las constantes/componente de
// arriba, la entrada de Alumnos en OPCIONES, el estado `tutorialAbajo` +
// `moverTutorialAbajo`, las dos líneas de render de <TutorialAlumno />, y
// volver el grid de tarjetas a `gridTemplateColumns: "1fr 1fr"`.
