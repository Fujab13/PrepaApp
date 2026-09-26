// Tutorias.jsx
// Punto de entrada de "/tutorias": deja elegir entre el flujo de Alumnos
// (reservar y pagar una clase) y el de Maestros (publicar disponibilidad,
// una vez verificado — ver TutoriasMaestro.jsx). No requiere sesión para
// verse; cada sub-página valida el acceso por su cuenta.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerRankingSemanal, obtenerMiPosicionSemanal } from "../services/ranking";
import { construirTableroConBots } from "../utils/bots";
import { useAuth } from "../context/AuthContext";

import { PiChalkboardTeacher } from "react-icons/pi";
import { AiOutlineClose } from "react-icons/ai";
import { GiJewelCrown, GiQueenCrown } from "react-icons/gi";
import { CgCrown } from "react-icons/cg";

// Oro/plata/bronce para los primeros 3 lugares; el resto usa los colores de
// texto normales de la app. texto colorea tanto la corona del podio como el
// nombre en la lista 4-25; sombra le da un poco de profundidad a la corona.
const MEDALLAS = {
  1: { texto: "#e9c86a", sombra: "rgba(229,193,88,0.55)" },
  2: { texto: "#c7ccd6", sombra: "rgba(199,204,214,0.4)" },
  3: { texto: "#d99a5f", sombra: "rgba(217,154,95,0.4)" },
};

// Corona en vez de esfera con inicial: 1er lugar joya, 2do reina, 3ro simple.
const ICONOS_MEDALLA = {
  1: GiJewelCrown,
  2: GiQueenCrown,
  3: CgCrown,
};

function AvatarPodio({ fila, tamano }) {
  const medalla = MEDALLAS[fila.posicion];
  const Icono = ICONOS_MEDALLA[fila.posicion];
  return (
    <div style={{ width: tamano, height: tamano, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icono style={{ fontSize: tamano * 0.85, color: medalla.texto, filter: `drop-shadow(0 3px 6px ${medalla.sombra})` }} />
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
  const [miPosicion, setMiPosicion] = useState(null); // { puntos } | null
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
        setMiPosicion({ puntos: mia.puntos });
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
        borderRadius: "var(--radius)",
        padding: "22px 16px 18px",
        marginTop: 6,
        background: "linear-gradient(135deg, var(--surface2), var(--surface))",
        border: "0.5px solid var(--border)",
        boxShadow: "0 4px 16px -10px rgba(0,0,0,0.6)",
      }}
    >
      {/* Resplandor decorativo: un solo círculo difuminado y tenue, puramente
          ambiental (pointerEvents none) — apenas insinúa que la sección es
          distinta a una tarjeta plana, sin el efecto "neón" que tenía antes. */}
      <div style={{ position: "absolute", top: -40, right: -30, width: 130, height: 130, borderRadius: "50%", background: "#7c5cbf", opacity: 0.06, filter: "blur(40px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 18 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: 0.3 }}>
          Ranking Semanal
        </p>
      </div>

      {/* "Tu puntaje": el ranking visible solo llega a 100 lugares, así que
          esto deja ver el nombre y los puntos propios aunque el lugar real
          quede muy por debajo del tablero, sin tener que buscarse en una
          lista larguísima. Solo aparece con sesión y actividad esta
          semana. */}
      {miPosicion && (
        <div
          style={{
            position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
            padding: "12px 16px", marginBottom: 16, borderRadius: 14,
            background: "linear-gradient(135deg, rgba(124,92,191,0.22), rgba(229,193,88,0.14))",
            border: "1px solid rgba(229,193,88,0.35)",
          }}
        >
          <span style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>Tu puntaje esta semana</span>
          <span style={{
            fontSize: 14, fontWeight: 800, color: "#e9c86a",
            maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {/* Mismo criterio que obtener_ranking_semanal para el nombre
                (split_part del email antes de la @) — obtener_mi_posicion_semanal
                no lo trae, y el propio email ya está disponible en el
                usuario logueado, así que no hace falta tocar el RPC. */}
            {user.email?.split("@")[0] ?? "Tú"} · {miPosicion.puntos} pts
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
        <div style={{ position: "relative", background: "var(--surface)", border: "1px solid var(--surface2)", borderRadius: 14, overflow: "hidden" }}>
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

// Guía rápida y acceso al portal de Alumnos ocultos temporalmente (ver
// referencia/temporal_desactivar_pagos/Tutorias.guia-y-boton-alumnos.backup.jsx).
const OPCIONES = [
  {
    to: "/tutorias/maestro",
    icono: <PiChalkboardTeacher />,
    color: "#06b6d4",
    titulo: "Maestros",
    subtitulo: "Herramientas de profesor",
  },
];

export default function Tutorias() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="page-topbar-compact" style={{ paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Ranking</h2>
      </header>

      <main
        className="page-content-compact"
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 14 }}
      >
        <RankingSemanal />

        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--text-muted)", textAlign: "center", margin: "10px 0 -6px",
        }}>
          ¿Qué te gustaría hacer?
        </p>

        {/* Grid a una sola columna mientras el acceso de Alumnos esté oculto
            (ver referencia/temporal_desactivar_pagos) — la tarjeta de
            Maestros se centra y no se estira a todo el ancho. */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, justifyItems: "center" }}>
          {OPCIONES.map((op) => (
            <button
              key={op.to}
              type="button"
              onClick={() => navigate(op.to)}
              className="sp-card sp-card-interactive"
              style={{
                width: "100%",
                maxWidth: 220,
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
      </main>
    </div>
  );
}
