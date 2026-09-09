// Tutorias.jsx
// Punto de entrada de "/tutorias": deja elegir entre el flujo de Alumnos
// (reservar una clase) y el de Maestros (aún en desarrollo). No requiere
// sesión para verse; cada sub-página valida el acceso por su cuenta.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerRankingSemanal, obtenerMiPosicionSemanal } from "../services/ranking";
import { construirTableroConBots, calcularPosicionGlobal } from "../utils/bots";
import { useAuth } from "../context/AuthContext";

import { FaUserGraduate } from "react-icons/fa";
import { PiChalkboardTeacher, PiStudent } from "react-icons/pi";
import { AiOutlineClose } from "react-icons/ai";
import { HiChevronLeft } from "react-icons/hi2";

// Oro/plata/bronce para los primeros 3 lugares; el resto usa los colores de
// texto normales de la app. gradiente/sombra son para el avatar del podio,
// texto es lo que se usa para colorear el nombre en la lista 4-25.
const MEDALLAS = {
  1: { texto: "#e9c86a", gradiente: "linear-gradient(155deg, #f4dd96, #c9a53f)", sombra: "rgba(229,193,88,0.55)" },
  2: { texto: "#c7ccd6", gradiente: "linear-gradient(155deg, #eef0f4, #a3a9b5)", sombra: "rgba(199,204,214,0.4)" },
  3: { texto: "#d99a5f", gradiente: "linear-gradient(155deg, #e8ac74, #a9622f)", sombra: "rgba(217,154,95,0.4)" },
};

function AvatarPodio({ fila, tamano }) {
  const medalla = MEDALLAS[fila.posicion];
  return (
    <div
      className={fila.posicion === 1 ? "rk-anillo-oro" : undefined}
      style={{
        width: tamano,
        height: tamano,
        borderRadius: "50%",
        background: medalla.gradiente,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: tamano * 0.4,
        fontWeight: 800,
        color: "#241c05",
        boxShadow: fila.posicion === 1 ? undefined : `0 4px 14px -2px ${medalla.sombra}`,
        border: "2px solid rgba(255,255,255,0.35)",
        flexShrink: 0,
      }}
    >
      {fila.nombre?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function ColumnaPodio({ fila }) {
  const medalla = MEDALLAS[fila.posicion];
  const esPrimero = fila.posicion === 1;
  const alturaPedestal = esPrimero ? 54 : fila.posicion === 2 ? 40 : 30;

  return (
    <div style={{ flex: 1, minWidth: 0, maxWidth: 118, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", marginBottom: 8 }}>
        <AvatarPodio fila={fila} tamano={esPrimero ? 58 : 48} />
      </div>
      <p
        title={fila.nombre}
        style={{
          margin: 0, fontSize: esPrimero ? 13.5 : 12.5, fontWeight: 800, color: medalla.texto,
          maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center",
        }}
      >
        {fila.nombre}
      </p>
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginTop: 2, marginBottom: 8 }}>
        {fila.puntos} pts
      </span>
      <div
        style={{
          width: "100%", height: alturaPedestal, borderRadius: "10px 10px 4px 4px",
          background: `linear-gradient(180deg, ${medalla.texto}33, ${medalla.texto}11)`,
          border: `1px solid ${medalla.texto}55`, borderBottom: "none",
          display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 6,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 800, color: medalla.texto }}>{fila.posicion}</span>
      </div>
    </div>
  );
}

// Bots mezclados con el ranking real (ver utils/bots.js): solo dan
// sensación de movimiento/tráfico, nunca sacan a un alumno real del
// tablero (construirTableroConBots lo garantiza).
function RankingSemanal() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState(null);
  const [miPosicion, setMiPosicion] = useState(null); // { puntos, posicionEntreReales, posicionGlobal } | null
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    obtenerRankingSemanal()
      .then((data) => {
        if (cancelado) return;
        setRanking(construirTableroConBots(data));
      })
      .catch(() => { if (!cancelado) setError("No se pudo cargar el ranking. Intenta de nuevo más tarde."); });
    return () => { cancelado = true; };
  }, []);

  useEffect(() => {
    if (!user) { setMiPosicion(null); return; }
    let cancelado = false;
    obtenerMiPosicionSemanal()
      .then((mia) => {
        if (cancelado || !mia) return;
        setMiPosicion({
          puntos: mia.puntos,
          posicionEntreReales: mia.posicion,
          posicionGlobal: calcularPosicionGlobal({ puntos: mia.puntos, posicionEntreReales: mia.posicion }),
        });
      })
      .catch(() => { /* no bloquea el resto del ranking si esto falla */ });
    return () => { cancelado = true; };
  }, [user]);

  const podio = ranking?.slice(0, 3) ?? [];
  const podioOrdenVisual = [podio[1], podio[0], podio[2]].filter(Boolean);
  const resto = ranking?.slice(3) ?? [];

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 22,
        padding: "22px 16px 18px",
        marginTop: 6,
        background: "radial-gradient(120% 100% at 50% -10%, rgba(71,166,255,0.16), transparent 60%), var(--surface)",
        border: "1px solid rgba(71,166,255,0.5)",
        boxShadow: "0 0 24px rgba(71,166,255,0.2)",
      }}
    >
      {/* Resplandores decorativos: dos círculos difuminados, puramente
          ambientales (pointerEvents none), para que la sección se sienta
          distinta a una tarjeta plana como el resto de "/tutorias". */}
      <div style={{ position: "absolute", top: -40, right: -30, width: 130, height: 130, borderRadius: "50%", background: "#47a6ff", opacity: 0.14, filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -50, left: -30, width: 140, height: 140, borderRadius: "50%", background: "#7c5cbf", opacity: 0.1, filter: "blur(46px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 18 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: 0.3 }}>
          Ranking Semanal
        </p>
      </div>

      {/* "Tu posición": el ranking visible solo llega a 100 lugares, pero
          el ranking real es global — esto deja ver el lugar de uno aunque
          quede muy por debajo del tablero (p. ej. #2,143), sin tener que
          buscarse en una lista larguísima. Solo aparece con sesión y
          actividad esta semana. */}
      {miPosicion && (
        <div
          style={{
            position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
            padding: "12px 16px", marginBottom: 16, borderRadius: 14,
            background: "linear-gradient(135deg, rgba(124,92,191,0.22), rgba(229,193,88,0.14))",
            border: "1px solid rgba(229,193,88,0.35)",
          }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>Tu posición esta semana</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#e9c86a" }}>
            #{miPosicion.posicionGlobal.toLocaleString("es-MX")} · {miPosicion.puntos} pts
          </span>
        </div>
      )}

      {error && <p style={{ fontSize: 13, color: "var(--wrong)", textAlign: "center", margin: 0 }}>{error}</p>}

      {!error && ranking === null && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: 0 }}>Cargando…</p>
      )}

      {!error && ranking?.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
          Todavía no hay actividad esta semana. ¡Sé el primero en el ranking!
        </p>
      )}

      {!error && podioOrdenVisual.length > 0 && (
        <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, marginBottom: resto.length > 0 ? 18 : 2 }}>
          {podioOrdenVisual.map((fila) => (
            <ColumnaPodio key={fila.user_id} fila={fila} />
          ))}
        </div>
      )}

      {!error && resto.length > 0 && (
        <div style={{ position: "relative", background: "rgba(15,15,26,0.35)", border: "1px solid var(--surface2)", borderRadius: 14, overflow: "hidden" }}>
          {resto.map((fila, i) => (
            <div
              key={fila.user_id}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "9px 14px",
                borderBottom: i < resto.length - 1 ? "1px solid var(--surface2)" : "none",
              }}
            >
              <span style={{ flexShrink: 0, width: 20, textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
                {fila.posicion}
              </span>
              <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {fila.nombre}
              </p>
              <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
                {fila.puntos} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: i === paso ? "#7c5cbf" : "rgba(255,255,255,0.18)",
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

const OPCIONES = [
  {
    to: "/tutorias/alumno",
    icono: <PiStudent />,
    color: "#7c5cbf",
    titulo: "Alumnos",
    subtitulo: "Reserva una clase con un maestro.",
  },
  {
    to: "/tutorias/maestro",
    icono: <PiChalkboardTeacher />,
    color: "#06b6d4",
    titulo: "Maestros",
    subtitulo: "Consulta y gestiona tus tutorías asignadas.",
  },
];

export default function Tutorias() {
  const navigate = useNavigate();

  // La guía nunca se oculta del todo: "Entendido" (o la X) solo la manda
  // debajo de las tarjetas de Alumnos/Maestros y sube esas tarjetas al
  // primer lugar. Para quien ya la vio antes, arranca directo abajo (no
  // tiene sentido volver a taparle las tarjetas cada vez que entra).
  const [tutorialAbajo, setTutorialAbajo] = useState(() => {
    try {
      return localStorage.getItem(CLAVE_TUTORIAL_VISTO) === "1";
    } catch {
      return false;
    }
  });

  function moverTutorialAbajo() {
    setTutorialAbajo(true);
    try {
      localStorage.setItem(CLAVE_TUTORIAL_VISTO, "1");
    } catch {
      // localStorage puede fallar en modo privado; no es crítico para la guía.
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="page-topbar-compact" style={{ paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <span className="page-topbar-btn" style={{ fontSize: "1.35rem" }}>
          <FaUserGraduate />
        </span>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Tutorías</h2>
      </header>

      <main
        className="page-content-compact"
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 14 }}
      >
        {!tutorialAbajo && <TutorialAlumno onCerrar={moverTutorialAbajo} />}

        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--text-muted)", textAlign: "center", margin: "4px 0 2px",
        }}>
          ¿Qué te gustaría hacer?
        </p>

        {/* grid en vez de flex: en iOS Safari un <button> como flex item no
            siempre respeta align-items:stretch (bug conocido de WebKit con
            controles de formulario), así que las dos tarjetas terminaban de
            distinto alto. Grid sí las estira parejo en ambos ejes, y
            aspectRatio (en vez de un minHeight fijo en px) hace que el
            tamaño escale bien tanto en un iPhone SE angosto como en el
            máximo de 480px que usa toda la app (#root en global.css).
            sp-card-interactive (global.css) da el hover/active/focus con
            pseudo-clases; queda disponible para reusar en otras páginas. */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {OPCIONES.map((op) => (
            <button
              key={op.to}
              type="button"
              onClick={() => navigate(op.to)}
              className="sp-card sp-card-interactive"
              style={{
                width: "100%",
                height: "100%",
                aspectRatio: "0.72",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                cursor: "pointer",
                margin: 0,
                padding: 16,
                font: "inherit",
                color: "inherit",
                WebkitTapHighlightColor: "transparent",
                boxSizing: "border-box",
              }}
            >
              <div
                className="sp-card-icon"
                style={{
                  width: 68,
                  height: 68,
                  fontSize: "2.3rem",
                  background: `radial-gradient(circle at 32% 28%, ${op.color}3d, ${op.color}17)`,
                  color: op.color,
                  boxShadow: `0 0 0 1px ${op.color}2a inset`,
                }}
              >
                {op.icono}
              </div>
              <p className="sp-card-title" style={{ fontSize: "0.95rem", marginTop: 4 }}>{op.titulo}</p>
              <p className="sp-card-description" style={{ textAlign: "center" }}>{op.subtitulo}</p>
            </button>
          ))}
        </div>

        {tutorialAbajo && <TutorialAlumno onCerrar={moverTutorialAbajo} />}

        <RankingSemanal />
      </main>
    </div>
  );
}
