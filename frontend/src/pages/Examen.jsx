// Examen.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Dependencias: react, react-router-dom
// Importa: examen.js (PREGUNTAS, SECCIONES)
// Navega a: /resultados  (con state completo)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PREGUNTAS, SECCIONES } from "../data/examen.js";
import SiderNavMatrix from "../components/sidernavmatrix.jsx";

import { AiOutlineClose } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { IoBookmarkOutline } from "react-icons/io5";
// ════════════════════════════════════════════════════════════════════════════
// ─── CONFIGURACIÓN ──────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  HORAS_GLOBAL:      2,      // ← Modifica aquí el tiempo global del examen
  MINUTOS_GLOBAL:    0,
  SEGUNDOS_GLOBAL:   0,

  TIEMPO_RECOMENDADO_SEG: 90, // Tiempo recomendado por pregunta (en segundos)
};
// ════════════════════════════════════════════════════════════════════════════
// ─── HELPERS ────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
const TIEMPO_GLOBAL_INICIAL =
  CONFIG.HORAS_GLOBAL * 3600 +
  CONFIG.MINUTOS_GLOBAL * 60 +
  CONFIG.SEGUNDOS_GLOBAL;

const fmtGlobal = (seg) => {
  const h = Math.floor(Math.abs(seg) / 3600);
  const m = Math.floor((Math.abs(seg) % 3600) / 60);
  const s = Math.abs(seg) % 60;
  return `${h} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
};

const fmtPregunta = (seg) => {
  const abs = Math.abs(seg);
  const m   = Math.floor(abs / 60);
  const s   = abs % 60;
  const base = m > 0 ? `${m}m${String(s).padStart(2,"0")}s` : `${s}s`;
  return seg < 0 ? `+${base}` : base;
};

const getSectionIndex = (id) =>
  SECCIONES.findIndex((s) => id >= s.id_inicio && id <= s.id_fin);

// ════════════════════════════════════════════════════════════════════════════
// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
export default function Examen() {
  const navigate   = useNavigate();

  // ── Estado del examen ────────────────────────────────────────────────────
  const [indexActual, setIndexActual] = useState(0);     // índice en PREGUNTAS
  const [respuestas,  setRespuestas]  = useState({});    // { id: 'A'|'B'|'C'... }
  const [marcadas,    setMarcadas]    = useState(new Set()); // ids marcados
  const [matrizOpen,  setMatrizOpen]  = useState(false);

  // Tiempos por pregunta (en segundos usados)
  const tiemposRef = useRef({});

  // ── Cronómetro global (cuenta regresiva) ─────────────────────────────────
  const [tiempoGlobal, setTiempoGlobal] = useState(TIEMPO_GLOBAL_INICIAL);
  const tiempoGlobalRef = useRef(TIEMPO_GLOBAL_INICIAL);

  useEffect(() => {
    const id = setInterval(() => {
      tiempoGlobalRef.current -= 1;
      setTiempoGlobal(prev => prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Cronómetro por pregunta (cuenta desde CONFIG.TIEMPO_RECOMENDADO_SEG hacia 0) ──
  const [tiempoPregunta, setTiempoPregunta] = useState(CONFIG.TIEMPO_RECOMENDADO_SEG);
  const tiempoPregRef = useRef(CONFIG.TIEMPO_RECOMENDADO_SEG);
  const startTimeRef  = useRef(Date.now());

  // Cuando cambia la pregunta: guarda el tiempo usado y reinicia el contador
  useEffect(() => {
    const pregActual = PREGUNTAS[indexActual];
    // Guardar tiempo de la pregunta anterior no lo hacemos aquí (ver cambio de index)
    tiempoPregRef.current = CONFIG.TIEMPO_RECOMENDADO_SEG;
    setTiempoPregunta(CONFIG.TIEMPO_RECOMENDADO_SEG);
    startTimeRef.current = Date.now();
  }, [indexActual]);

  useEffect(() => {
    const id = setInterval(() => {
      tiempoPregRef.current -= 1;
      setTiempoPregunta(prev => prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [indexActual]);

  // ── Pregunta actual ───────────────────────────────────────────────────────
  const pregunta      = PREGUNTAS[indexActual];
  const seccionIdx    = getSectionIndex(pregunta.id);
  const seccion       = SECCIONES[seccionIdx];
  const totalPreguntas = PREGUNTAS.length;

  // ── Guardar tiempo al cambiar de pregunta ─────────────────────────────────
  const guardarTiempoPregunta = useCallback((id) => {
    const segundosUsados = Math.round((Date.now() - startTimeRef.current) / 1000);
    tiemposRef.current[id] = (tiemposRef.current[id] ?? 0) + segundosUsados;
  }, []);

  // ── Navegación ────────────────────────────────────────────────────────────
  const irA = useCallback((idObjetivo) => {
    guardarTiempoPregunta(pregunta.id);
    const nuevoIdx = PREGUNTAS.findIndex(p => p.id === idObjetivo);
    if (nuevoIdx !== -1) setIndexActual(nuevoIdx);
  }, [pregunta.id, guardarTiempoPregunta]);

  const anterior = useCallback(() => {
    if (indexActual === 0) return;

    // Verificar si hay cambio de sección (retroceso)
    const prevSec = getSectionIndex(PREGUNTAS[indexActual - 1].id);
    const currSec = seccionIdx;

    if (prevSec !== currSec) {
      // Primera pregunta de sección actual → advertir
      if (PREGUNTAS[indexActual].id === seccion.id_inicio) {
        const confirmado = window.confirm(
          `Regresar a ${SECCIONES[prevSec]?.nombre}`
        );
        if (!confirmado) return;
      }
    }

    guardarTiempoPregunta(pregunta.id);
    setIndexActual(i => i - 1);
  }, [indexActual, seccionIdx, seccion, pregunta.id, guardarTiempoPregunta]);

  const siguiente = useCallback(() => {
    if (indexActual === totalPreguntas - 1) {
      // Última pregunta → ir a resultados
      const confirmado = window.confirm(
        "¿Terminar y enviar el examen?"
      );
      if (!confirmado) return;
      guardarTiempoPregunta(pregunta.id);
      navigate("/Resultados", {
        state: {
          respuestas,
          tiemposPregunta : tiemposRef.current,
          marcadas        : [...marcadas],
          preguntas       : PREGUNTAS,
          secciones       : SECCIONES,
          tiempoTotalSegundos: TIEMPO_GLOBAL_INICIAL - tiempoGlobal,
        },
      });
      return;
    }

    // Cambio de sección (avance) → confirmación de no retorno
    const nextSec = getSectionIndex(PREGUNTAS[indexActual + 1].id);
    if (nextSec !== seccionIdx && PREGUNTAS[indexActual + 1].id === SECCIONES[nextSec]?.id_inicio) {
      const confirmado = window.confirm(
        `Continuar a ${SECCIONES[nextSec]?.nombre}`
      );
      if (!confirmado) return;
    }

    guardarTiempoPregunta(pregunta.id);
    setIndexActual(i => i + 1);
  }, [indexActual, totalPreguntas, seccionIdx, seccion, pregunta.id, respuestas, marcadas, tiempoGlobal, guardarTiempoPregunta, navigate]);

  // ── Seleccionar respuesta ─────────────────────────────────────────────────
  const seleccionarRespuesta = (inciso) => {
    setRespuestas(prev => ({ ...prev, [pregunta.id]: inciso }));
  };

  // ── Marcar pregunta ───────────────────────────────────────────────────────
  const toggleMarcar = () => {
    setMarcadas(prev => {
      const next = new Set(prev);
      next.has(pregunta.id) ? next.delete(pregunta.id) : next.add(pregunta.id);
      return next;
    });
  };

  // ── Tiempo sin tiempo → ir a resultados automáticamente ──────────────────
  useEffect(() => {
    if (tiempoGlobal <= 0) {
      guardarTiempoPregunta(pregunta.id);
      navigate("/Resultados", {
        state: {
          respuestas,
          tiemposPregunta : tiemposRef.current,
          marcadas        : [...marcadas],
          preguntas       : PREGUNTAS,
          secciones       : SECCIONES,
          tiempoTotalSegundos: TIEMPO_GLOBAL_INICIAL,
        },
      });
    }
  }, [tiempoGlobal]);

  // ── Colores dinámicos ─────────────────────────────────────────────────────
  const esUltimaDeSeccion = pregunta.id === seccion?.id_fin;
  const esMarcada         = marcadas.has(pregunta.id);
  const tiempoNegativo    = tiempoPregunta < 0;

  const colorGlobal = tiempoGlobal <= 300 ? "#ef4444"
                    : tiempoGlobal <= 600 ? "#f59e0b"
                    : "#4f8ef7";

  // Progreso global
  const progresoPct = ((indexActual + 1) / totalPreguntas) * 100;

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── RENDER ─────────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', minHeight: '100vh' }}>
      
      {/* ── BARRA SUPERIOR ── */}
<header style={{
  position: "sticky",
  top: 0,
  zIndex: 30,
  background: "var(--bg)",
  padding: "10px 14px",
}}>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }}>
    <button
      onClick={() => navigate('/')}
      title="Salir"
      style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.4rem', cursor: 'pointer', padding: 5}}
    >
    <AiOutlineClose />
    </button>
    {/* Sección actual (como el icono de materia) */}
    <span style={{
      background: 'transparent',
      color: seccion?.color ?? '#4f8ef7',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      whiteSpace: 'nowrap',
    }}>
      {seccion?.nombre ?? "Examen"}
    </span>

    {/* Barra de progreso en píldora */}
    <div style={{
      flex: 1,
      height: '6px',
      background: 'var(--surface2)',
      borderRadius: '99px',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        borderRadius: '99px',
        background: seccion?.color ?? '#4f8ef7',
        width: `${progresoPct}%`,
        transition: 'width 0.4s ease',
      }} />
    </div>

    {/* Contador de preguntas + cronómetro, estilo "util-btn" */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginLeft: 'auto',
      fontSize: '0.75rem',
      color: 'var(--text-muted)',
    }}>
      <span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {indexActual + 1} / {totalPreguntas}
      </span>

      <span 
      className="reloj-minimal"
      style={{
        color: colorGlobal,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {fmtGlobal(tiempoGlobal)}
      </span>
    </div>
  </div>
</header>

      {/* ── CUERPO PRINCIPAL ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "16px 14px 90px" }}>

        {/* Número + cronómetro de pregunta */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              background: seccion?.color ?? "#4f8ef7",
              color: "#fff",
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 700,
            }}>
              #{indexActual + 1}
            </div>
            {esMarcada && (
              <div style={{
                background: "#451a03",
                border: "1px solid #92400e",
                color: "#fcd34d",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: 11,
                fontWeight: 600,
              }}>
                ★ Marcada
              </div>
            )}
          </div>

          {/* Cronómetro de pregunta */}
          <div 
          className="reloj-minimal"
          style={{
            background: tiempoNegativo ? "#450a0a" : "var(--surface)",
            border: `1px solid ${tiempoNegativo ? "#7f1d1d" : "var(--surface2)"}`,
            borderRadius: 8,
            padding: "4px 10px",
            textAlign: "center",
          }}>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              color: tiempoNegativo ? "var(--wrong)" : "var(--correct)",
              fontVariantNumeric: "tabular-nums",
            }}>
              {tiempoNegativo ? "+" : ""}{fmtPregunta(tiempoPregunta)}
            </div>
          </div>
        </div>

        {/* Texto de la pregunta */}
        <div style={{
          background: "var(--surface)",
          border: "0.5px solid var(--surface2)",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 14,
        }}>
          <p style={{
            margin: 0,
            fontSize: 15,
            lineHeight: 1.65,
            color: "var(--text)",
            whiteSpace: "pre-wrap",
          }}>
            {pregunta.pregunta}
          </p>
        </div>

        {/* SVG de la pregunta (si existe) */}
        {pregunta.enlace_svg && (
          <div style={{
            background: "var(--surface)",
            border: "0.5px solid var(--surface2)",
            borderRadius: 12,
            padding: 12,
            marginBottom: 14,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 120,
          }}>

            {/* , filter: "brightness(0) invert(1)" */}
            <img
              src={`/svgs/${pregunta.enlace_svg}`}
              alt={`Imagen de la pregunta ${pregunta.id}`}
              style={{ maxWidth: "100%", maxHeight: 220, objectFit: "contain"}}
              onError={e => { e.currentTarget.style.display = "none"; }}
            />
          </div>
        )}

        {/* Botones de respuesta */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pregunta.respuestas.map((opcion) => {
            const inciso    = opcion.charAt(0); // 'A', 'B', 'C', 'D'...
            const esSelected = respuestas[pregunta.id] === inciso;

            return (
              <button
                key={inciso}
                onClick={() => seleccionarRespuesta(inciso)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: esSelected ? `${seccion?.color ?? "#4f8ef7"}18` : "var(--surface)",
                  border: esSelected
                    ? `1.5px solid ${seccion?.color ?? "#4f8ef7"}`
                    : "0.5px solid var(--surface2)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  color: "var(--text)",
                  width: "100%",
                }}
              >
                {/* Indicador */}
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  flexShrink: 0,
                  background: esSelected ? (seccion?.color ?? "#4f8ef7") : "var(--surface2)",
                  border: `1px solid ${esSelected ? "transparent" : "var(--surface2)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: esSelected ? "#fff" : "var(--text-muted)",
                  marginTop: 1,
                }}>
                  {inciso}
                </div>

                {/* Texto de la opción */}
                <span style={{ fontSize: 14, lineHeight: 1.55, flex: 1 }}>
                  {opcion.slice(3)} {/* quita "X. " del inicio */}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* ── BARRA INFERIOR ── */}
      <footer style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        background: "var(--bg)",
        borderTop: "0.5px solid var(--surface2)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px 16px",
        zIndex: 30,
      }}>
        {/* Anterior */}
        <button
          onClick={anterior}
          disabled={indexActual === 0}
          className="btn-footer-scroll"
          style={{
            flex: 1,
            opacity: indexActual === 0 ? 0.35 : 1,
            color: "var(--text-muted)",
            border: "0.5px solid var(--surface2)"
          }}
        >
          <IoIosArrowBack /> Anterior
        </button>

        {/* Marcar */}
        <button
          onClick={toggleMarcar}
          title={esMarcada ? "Quitar marca" : "Marcar para revisar"}
          className="btn-footer-scroll"
          style={{
            width: 44,
            padding: "10px 0",
            flexShrink: 0,
            background: esMarcada ? "#451a03" : "var(--surface)",
            border: esMarcada ? "1px solid #92400e" : "0.5px solid var(--surface2)",
            color: esMarcada ? "#fcd34d" : "var(--text-muted)",
            fontSize: 18,
          }}
        >
          <IoBookmarkOutline />
        </button>

        {/* Botón matriz */}
        <button
          onClick={() => setMatrizOpen(v => !v)}
          title="Ver matriz de preguntas"
          className="btn-footer-scroll"
          style={{
            width: 44,
            padding: "10px 0",
            flexShrink: 0,
            background: matrizOpen ? "#1e3a5f" : "var(--surface)",
            border: matrizOpen ? "1px solid #1d4ed8" : "0.5px solid var(--surface2)",
            color: matrizOpen ? "#60a5fa" : "var(--text-muted)",
            fontSize: 18,
          }}
        >
          <HiOutlineSquares2X2  />
        </button>

        {/* Siguiente */}
        <button
        onClick={siguiente}
        className="btn-footer-scroll"
        style={{
          flex: 1,
          background: seccion?.color ?? "#4f8ef7"
        }}
      >
        {indexActual === totalPreguntas - 1 ? (
          "Terminar →"
        ) : (
          <>
            Siguiente <IoIosArrowForward /> {/* Cambiado a Forward para que apunte a la derecha */}
          </>
        )}
      </button>
      </footer>

      {/* ── PANEL LATERAL MATRIZ ── */}
      {matrizOpen && (
        <SiderNavMatrix
          preguntas={PREGUNTAS}
          respuestas={respuestas}
          marcadas={marcadas}
          preguntaActual={pregunta.id}
          secciones={SECCIONES}
          seccionActual={seccionIdx}
          onIrA={irA}
          onCerrar={() => setMatrizOpen(false)}
        />
      )}
    </div>
  );
}
