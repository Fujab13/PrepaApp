// Examen.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Dependencias: react, react-router-dom
// Importa: examenesDisponibles.js (bancos propios) / examenesPremium.js (comprados)
// Navega a: /resultados  (con state completo)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerExamenPropio } from "../data/examenesDisponibles.js";
import SidenavMatrix from "../components/SidenavMatrix";
import ConfirmDialog from "../components/ConfirmDialog";
import Latex from "../components/Latex";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { supabase } from "../services/supabaseClient";
import { calcularStatsPorSeccion } from "../utils/examenStats";
import { obtenerExamenDeSesion } from "../services/examenesPremium";
import { useConfirmarSalida } from "../hooks/useConfirmarSalida";
import { useImpulsoActivo } from "../hooks/useImpulsoActivo";
import MascotaCompanera from "../components/MascotaCompanera";
import { convertirTextoParaVoz } from "../utils/latexAHabla";

import { AiOutlineClose } from "react-icons/ai";
import ExamenSkeleton from "../components/skeletons/ExamenSkeleton";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { IoBookmarkOutline } from "react-icons/io5";
// ════════════════════════════════════════════════════════════════════════════
// ─── CONFIGURACIÓN ──────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  TIEMPO_RECOMENDADO_SEG: 90, // Tiempo recomendado PROMEDIO por pregunta (en segundos) — ver calcularTiempoPreguntaSeg más abajo, que reparte este mismo ritmo según el largo real de cada pregunta en vez de dar siempre el mismo número fijo.
};
// ════════════════════════════════════════════════════════════════════════════
// ─── HELPERS ────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

// ── Duración global dinámica ────────────────────────────────────────────────
// El examen ya no dura un fijo de horas/minutos sin importar cuántas
// preguntas tenga: se calcula a partir del mismo ritmo de
// CONFIG.TIEMPO_RECOMENDADO_SEG (90s/pregunta EN PROMEDIO — el cronómetro por
// pregunta reparte ese mismo ritmo según el largo real de cada una, ver
// calcularTiempoPreguntaSeg), y se redondea hacia ARRIBA a la duración "redonda" más cercana
// de esta lista fija — nunca un número raro tipo "1h47min", siempre una de
// estas 5 sesiones estándar. Redondear hacia arriba (nunca al bucket más
// cercano) garantiza que nadie termine con MENOS que el ritmo recomendado
// por pregunta.
//
// Con 90s/pregunta, los cortes exactos en número de preguntas son:
//   ≤20 preguntas  → 30 min   (20 × 90s = 30min exactos)
//   21–40          → 1:00 h   (40 × 90s = 60min exactos)
//   41–60          → 1:30 h   (60 × 90s = 90min exactos — el examen por
//                    defecto de 60 preguntas cae aquí, justo en el límite)
//   61–80          → 2:00 h   (80 × 90s = 120min exactos)
//   81 en adelante → 2:30 h   (tope: un examen de 120 preguntas, por ejemplo,
//                    también cae aquí — más preguntas ya no alargan el
//                    examen, solo lo hacen más exigente por pregunta)
const DURACIONES_GLOBAL_DISPONIBLES_MIN = [30, 60, 90, 120, 150];

function calcularTiempoGlobalSegundos(numPreguntas) {
  const crudoSeg = numPreguntas * CONFIG.TIEMPO_RECOMENDADO_SEG;
  const bucketMin = DURACIONES_GLOBAL_DISPONIBLES_MIN.find((min) => min * 60 >= crudoSeg);
  const elegidoMin = bucketMin ?? DURACIONES_GLOBAL_DISPONIBLES_MIN[DURACIONES_GLOBAL_DISPONIBLES_MIN.length - 1];
  return elegidoMin * 60;
}

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

// ── Cronómetro por pregunta dinámico según su largo ─────────────────────────
// Mismo criterio que Modo difícil en Leccion.jsx (ver calcularTiempoLimiteDecimas
// en utils/modoDificil.js): en vez de un fijo de 90s para cualquier pregunta,
// cada una da segundos/palabra sobre el texto "hablado" (convertirTextoParaVoz,
// así una fórmula LaTeX cuenta las palabras que en realidad se leen, no sus
// símbolos crudos). Calibrado con el banco real de data/examen.js (60
// preguntas, ~17 palabras en promedio) para que una pregunta de largo
// PROMEDIO siga dando los mismos 90s de antes.
//
// A diferencia de Modo difícil, este cronómetro es puramente ESTÉTICO: nunca
// bloquea ni fuerza avanzar de pregunta al llegar a 0 (ver tiempoNegativo más
// abajo, que solo cambia de color y sigue contando en negativo) — por eso el
// piso y el techo son mucho más generosos que en Modo difícil, solo para que
// el número no se vea absurdo en preguntas muy cortas o muy largas.
const PALABRAS_REFERENCIA_EXAMEN = 17;
const SEGUNDOS_POR_PALABRA_EXAMEN = CONFIG.TIEMPO_RECOMENDADO_SEG / PALABRAS_REFERENCIA_EXAMEN;
const SEGUNDOS_MINIMO_EXAMEN = 45;
const SEGUNDOS_MAXIMO_EXAMEN = 180;

function calcularTiempoPreguntaSeg(pregunta) {
  const texto = convertirTextoParaVoz(typeof pregunta?.pregunta === 'string' ? pregunta.pregunta : '');
  const palabras = texto && texto.trim() ? texto.trim().split(/\s+/).length : PALABRAS_REFERENCIA_EXAMEN;

  const segundos = palabras * SEGUNDOS_POR_PALABRA_EXAMEN;
  return Math.round(Math.min(SEGUNDOS_MAXIMO_EXAMEN, Math.max(SEGUNDOS_MINIMO_EXAMEN, segundos)));
}

// ════════════════════════════════════════════════════════════════════════════
// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
export default function Examen() {
  const navigate   = useNavigate();
  const { examenId } = useParams();
  const { user }   = useAuth();

  // "Pista" de la mascota compañera (ver MascotaCompanera.jsx, la estrella
  // en Mascota.jsx → Tu colección, y utils/mascotasEstado.js: activarImpulso
  // al alimentar): mientras el impulso de 3 min siga activo, se marca la
  // respuesta correcta en el DOM y la mascota se para ahí en vez de pasear.
  const { mascotaSeleccionada, ownsItem } = useStore();
  const impulsoActivo = useImpulsoActivo(mascotaSeleccionada);
  const pistaActiva = impulsoActivo && Boolean(mascotaSeleccionada) && ownsItem(`mascota-${mascotaSeleccionada}`);

  // ── Preguntas/secciones del examen: uno de los propios en
  // data/examenesDisponibles.js ('general', 'historia', 'matematicas' — ver
  // SeleccionExamen.jsx, que es de donde se elige), o uno comprado en la
  // Tienda (ver Inventario.jsx, que ya lo descargó+cacheó antes de navegar
  // aquí — mismo patrón que Leccion.jsx con /leccion/premium-<id>). Un
  // examenId desconocido cae al examen general en vez de dejar la pantalla
  // en blanco (ver obtenerExamenPropio).
  const [preguntas, setPreguntas] = useState(null);
  const [secciones, setSecciones] = useState(null);
  const [cargandoExamen, setCargandoExamen] = useState(true);
  const [errorExamen, setErrorExamen] = useState('');

  useEffect(() => {
    if (!examenId || !examenId.startsWith('premium-')) {
      const propio = obtenerExamenPropio(examenId);
      setPreguntas(propio.preguntas);
      setSecciones(propio.secciones);
      setErrorExamen('');
      setCargandoExamen(false);
      return;
    }

    const productoId = examenId.replace('premium-', '');
    const cacheado = obtenerExamenDeSesion(productoId);
    const preguntasCache = cacheado?.data?.preguntas;
    const seccionesCache = cacheado?.data?.secciones;

    if (!Array.isArray(preguntasCache) || preguntasCache.length === 0 || !Array.isArray(seccionesCache)) {
      setErrorExamen('Este examen no está disponible. Vuelve al inventario e ábrelo de nuevo.');
      setCargandoExamen(false);
      return;
    }

    setPreguntas(preguntasCache);
    setSecciones(seccionesCache);
    setErrorExamen('');
    setCargandoExamen(false);
  }, [examenId]);

  // ── Estado del examen ────────────────────────────────────────────────────
  const [indexActual, setIndexActual] = useState(0);     // índice en preguntas
  const [respuestas,  setRespuestas]  = useState({});    // { id: 'A'|'B'|'C'... }
  const [marcadas,    setMarcadas]    = useState(new Set()); // ids marcados
  const [matrizOpen,  setMatrizOpen]  = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);

  // Salir a medio examen (botón "X" o botón Atrás del navegador) pierde
  // todas las respuestas: nada se guarda hasta terminar. `replace: true`
  // sobreescribe la entrada "centinela" que empuja useConfirmarSalida, para
  // no dejar un "atrás" fantasma que regrese aquí de nuevo.
  const confirmarSalir = useCallback(() => {
    setConfirmacion({
      titulo: "Salir del examen",
      mensaje: "Se perderán todas tus respuestas.",
      textoConfirmar: "Salir",
      colorConfirmar: "var(--wrong)",
      accion: () => navigate('/', { replace: true }),
    });
  }, [navigate]);

  useConfirmarSalida(!cargandoExamen && !errorExamen, confirmarSalir);

  // Tiempos por pregunta (en segundos usados)
  const tiemposRef = useRef({});

  // ── Cronómetro global (cuenta regresiva) ─────────────────────────────────
  // null hasta que se sepa cuántas preguntas tiene ESTE examen (preguntas
  // carga async para un examen premium, ver el efecto de arriba) — recién
  // ahí se puede calcular la duración total real (calcularTiempoGlobalSegundos).
  // tiempoGlobalInicialRef congela ese total una sola vez (nunca cambia
  // después): lo usan siguiente()/el efecto de "se acabó el tiempo" más
  // abajo para reportar cuántos segundos se usaron en total.
  const [tiempoGlobal, setTiempoGlobal] = useState(null);
  const tiempoGlobalRef = useRef(null);
  const tiempoGlobalInicialRef = useRef(null);

  useEffect(() => {
    if (!preguntas || tiempoGlobalInicialRef.current !== null) return;
    const inicial = calcularTiempoGlobalSegundos(preguntas.length);
    tiempoGlobalInicialRef.current = inicial;
    tiempoGlobalRef.current = inicial;
    setTiempoGlobal(inicial);
  }, [preguntas]);

  useEffect(() => {
    const id = setInterval(() => {
      if (tiempoGlobalRef.current === null) return; // todavía no se sabe la duración total
      tiempoGlobalRef.current -= 1;
      setTiempoGlobal(prev => (prev === null ? null : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Cronómetro por pregunta (cuenta hacia 0 desde un tiempo calculado según
  // el largo de CADA pregunta — ver calcularTiempoPreguntaSeg) ──
  const [tiempoPregunta, setTiempoPregunta] = useState(CONFIG.TIEMPO_RECOMENDADO_SEG);
  const tiempoPregRef = useRef(CONFIG.TIEMPO_RECOMENDADO_SEG);
  const startTimeRef  = useRef(Date.now());

  // Cuando cambia la pregunta (o termina de cargar, para examenes premium
  // async): guarda el tiempo usado y reinicia el contador con el tiempo
  // propio de la nueva pregunta.
  useEffect(() => {
    const preguntaSiguiente = preguntas?.[indexActual];
    const seg = preguntaSiguiente ? calcularTiempoPreguntaSeg(preguntaSiguiente) : CONFIG.TIEMPO_RECOMENDADO_SEG;
    tiempoPregRef.current = seg;
    setTiempoPregunta(seg);
    startTimeRef.current = Date.now();
  }, [indexActual, preguntas]);

  useEffect(() => {
    const id = setInterval(() => {
      tiempoPregRef.current -= 1;
      setTiempoPregunta(prev => prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [indexActual]);

  // ── Pregunta actual ───────────────────────────────────────────────────────
  // Optional chaining porque, mientras cargandoExamen/errorExamen siguen
  // activos, `preguntas` todavía puede ser null — el guard de carga/error
  // (más abajo, después de todos los hooks) impide que esto llegue a
  // renderizarse antes de tener datos válidos.
  const getSectionIndex = (id) => (secciones ?? []).findIndex((s) => id >= s.id_inicio && id <= s.id_fin);
  const totalPreguntas = preguntas?.length ?? 0;
  const pregunta       = preguntas?.[indexActual];
  const seccionIdx     = pregunta ? getSectionIndex(pregunta.id) : -1;
  const seccion        = seccionIdx >= 0 ? secciones?.[seccionIdx] : undefined;

  // ── Guardar tiempo al cambiar de pregunta ─────────────────────────────────
  const guardarTiempoPregunta = useCallback((id) => {
    const segundosUsados = Math.round((Date.now() - startTimeRef.current) / 1000);
    tiemposRef.current[id] = (tiemposRef.current[id] ?? 0) + segundosUsados;
  }, []);

  // ── Persistencia del resultado (solo si hay sesión) ───────────────────────
  // Sin esto, /tutorias no tendría forma de verificar server-side que el
  // examen ya se completó, ni de mandarle el reporte a un maestro. No se
  // espera (fire-and-forget): un insert de más no debe retrasar el cierre
  // de un examen contra reloj, y Resultados.jsx igual se pinta desde el
  // state de navegación, no desde esto.
  const guardarResultadoExamen = useCallback(({ respuestasFinal, tiempoTotalSegundos, marcadasFinal }) => {
    if (!user || !preguntas || !secciones) return;
    const statsPorSeccion = calcularStatsPorSeccion({
      preguntas,
      secciones,
      respuestas: respuestasFinal,
    });
    const correctas = preguntas.filter(p => respuestasFinal[p.id] === p.inciso_correcto).length;
    const precisionGlobal = preguntas.length > 0 ? Math.round((correctas / preguntas.length) * 100) : 0;

    // Solo se conserva el resultado más reciente por usuario: se inserta
    // primero (si esto falla, no se pierde el resultado anterior) y, una vez
    // insertado, se borran todas las demás filas propias.
    supabase
      .from("resultados_examen")
      .insert({
        user_id: user.id,
        precision_global: precisionGlobal,
        stats_por_seccion: statsPorSeccion.map(s => ({
          nombre: s.nombre, correctas: s.correctas, total: s.total, color: s.color,
        })),
        tiempo_total_segundos: tiempoTotalSegundos,
        respuestas: respuestasFinal,
        tiempos_pregunta: tiemposRef.current,
        marcadas: marcadasFinal,
      })
      .select("id")
      .single()
      .then(({ data, error }) => {
        if (error) return console.error("No se pudo guardar el resultado del examen:", error);
        supabase
          .from("resultados_examen")
          .delete()
          .eq("user_id", user.id)
          .neq("id", data.id)
          .then(({ error: deleteError }) => {
            if (deleteError) console.error("No se pudieron borrar los resultados anteriores del examen:", deleteError);
          });
      });
  }, [user, preguntas, secciones]);

  // ── Navegación ────────────────────────────────────────────────────────────
  const irA = useCallback((idObjetivo) => {
    guardarTiempoPregunta(pregunta.id);
    const nuevoIdx = preguntas.findIndex(p => p.id === idObjetivo);
    if (nuevoIdx !== -1) setIndexActual(nuevoIdx);
  }, [pregunta?.id, preguntas, guardarTiempoPregunta]);

  const anterior = useCallback(() => {
    if (indexActual === 0) return;

    const retroceder = () => {
      guardarTiempoPregunta(pregunta.id);
      setIndexActual(i => i - 1);
    };

    // Verificar si hay cambio de sección (retroceso)
    const prevSec = getSectionIndex(preguntas[indexActual - 1].id);
    const currSec = seccionIdx;

    // Primera pregunta de sección actual → advertir
    if (prevSec !== currSec && preguntas[indexActual].id === seccion.id_inicio) {
      setConfirmacion({
        titulo: "Cambiar de sección",
        mensaje: `¿Regresar a ${secciones[prevSec]?.nombre}?`,
        textoConfirmar: "Regresar",
        colorConfirmar: secciones[prevSec]?.color ?? seccion?.color,
        accion: retroceder,
      });
      return;
    }

    retroceder();
  }, [indexActual, seccionIdx, seccion, pregunta?.id, preguntas, secciones, guardarTiempoPregunta]);

  const siguiente = useCallback(() => {
    if (indexActual === totalPreguntas - 1) {
      // Última pregunta → ir a resultados
      const enviar = () => {
        guardarTiempoPregunta(pregunta.id);
        guardarResultadoExamen({
          respuestasFinal: respuestas,
          tiempoTotalSegundos: tiempoGlobalInicialRef.current - tiempoGlobal,
          marcadasFinal: [...marcadas],
        });
        navigate("/informe-resultados", {
          replace: true,
          state: {
            tipo: "examen",
            examen: {
              respuestas,
              tiemposPregunta : tiemposRef.current,
              marcadas        : [...marcadas],
              preguntas,
              secciones,
              tiempoTotalSegundos: tiempoGlobalInicialRef.current - tiempoGlobal,
            },
          },
        });
      };

      setConfirmacion({
        titulo: "Terminar examen",
        mensaje: "¿Terminar y enviar el examen? No podrás modificar tus respuestas después.",
        textoConfirmar: "Terminar",
        colorConfirmar: "var(--wrong)",
        accion: enviar,
      });
      return;
    }

    const avanzar = () => {
      guardarTiempoPregunta(pregunta.id);
      setIndexActual(i => i + 1);
    };

    // Cambio de sección (avance) → confirmación de no retorno
    const nextSec = getSectionIndex(preguntas[indexActual + 1].id);
    if (nextSec !== seccionIdx && preguntas[indexActual + 1].id === secciones[nextSec]?.id_inicio) {
      setConfirmacion({
        titulo: "Cambiar de sección",
        mensaje: `¿Continuar a ${secciones[nextSec]?.nombre}? No podrás regresar después.`,
        textoConfirmar: "Continuar",
        colorConfirmar: secciones[nextSec]?.color ?? seccion?.color,
        accion: avanzar,
      });
      return;
    }

    avanzar();
  }, [indexActual, totalPreguntas, seccionIdx, seccion, pregunta?.id, preguntas, secciones, respuestas, marcadas, tiempoGlobal, guardarTiempoPregunta, guardarResultadoExamen, navigate]);

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
  // `pregunta` puede no existir aún si esto dispara mientras el examen sigue
  // cargando. `tiempoGlobal === null` es "todavía no se calculó la duración
  // real" (ver arriba) — sin este chequeo, `null <= 0` da `true` en JS y
  // esto dispararía apenas monta, antes de saber cuántas preguntas hay.
  useEffect(() => {
    if (tiempoGlobal !== null && tiempoGlobal <= 0 && pregunta) {
      guardarTiempoPregunta(pregunta.id);
      guardarResultadoExamen({
        respuestasFinal: respuestas,
        tiempoTotalSegundos: tiempoGlobalInicialRef.current,
        marcadasFinal: [...marcadas],
      });
      navigate("/informe-resultados", {
        replace: true,
        state: {
          tipo: "examen",
          examen: {
            respuestas,
            tiemposPregunta : tiemposRef.current,
            marcadas        : [...marcadas],
            preguntas,
            secciones,
            tiempoTotalSegundos: tiempoGlobalInicialRef.current,
          },
        },
      });
    }
  }, [tiempoGlobal]);

  // ── Carga/error del examen: recién aquí, después de declarar todos los
  // hooks de arriba (deben correr siempre en el mismo orden en cada
  // render), es seguro cortar el render si preguntas/pregunta no existen
  // todavía. Mismo patrón que Leccion.jsx con sus lecciones premium. También
  // espera a `tiempoGlobal` (todavía null justo después de que "preguntas"
  // carga, hasta que el efecto de arriba calcule la duración real) para que
  // el cronómetro nunca se alcance a pintar en 0:00:00 por una fracción de
  // segundo antes del valor real. ──────
  if (cargandoExamen || errorExamen || !pregunta || tiempoGlobal === null) {
    if (!errorExamen) return <ExamenSkeleton />
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        minHeight: '100vh',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{ color: 'var(--wrong)', fontSize: '0.9rem', margin: 0 }}>{errorExamen}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            minHeight: 44, padding: '0 20px', borderRadius: 12, border: 'none',
            background: 'var(--surface2)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', minHeight: '100vh', position: 'relative' }}>
      <MascotaCompanera />

      {/* ── BARRA SUPERIOR ── */}
<header className="page-topbar-compact" style={{
  position: "sticky",
  top: 0,
  zIndex: 30,
  background: "var(--bg)",
  paddingTop: 14,
}}>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }}>
    <button
      onClick={confirmarSalir}
      title="Salir"
      className="page-topbar-btn"
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
    <div className="page-topbar-actions" style={{
      gap: '10px',
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
      <main className="page-content-compact" data-mascota-evitar="true" style={{ flex: 1, overflowY: "auto", paddingTop: 16, paddingBottom: 90 }}>

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
            background: tiempoNegativo ? "#450a0a" : "var(--surface2)",
            border: `1px solid ${tiempoNegativo ? "#7f1d1d" : "var(--surface)"}`,
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
          background: "var(--surface2)",
          border: "0.5px solid var(--surface)",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 14,
        }}>
          <div style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: "var(--text)",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}>
            <Latex texto={pregunta.pregunta} />
          </div>
        </div>

        {/* SVG de la pregunta (si existe) */}
        {pregunta.enlace_svg && (
          <div style={{
            background: "var(--surface2)",
            border: "0.5px solid var(--surface)",
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
              style={{ maxWidth: "100%", maxHeight: 400, width: "100%", objectFit: "contain", margin: 4 }}
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
                data-pista-mascota={pistaActiva && inciso === pregunta.inciso_correcto ? "true" : undefined}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: esSelected ? `${seccion?.color ?? "#4f8ef7"}18` : "var(--surface2)",
                  border: esSelected
                    ? `1.5px solid ${seccion?.color ?? "#4f8ef7"}`
                    : "0.5px solid var(--surface)",
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
                  background: esSelected ? (seccion?.color ?? "#4f8ef7") : "var(--surface)",
                  border: `1px solid ${esSelected ? "transparent" : "var(--surface)"}`,
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
                <div style={{ fontSize: 14, lineHeight: 1.55, flex: 1, wordBreak: "break-word", overflowWrap: "break-word" }}>
                  <Latex texto={opcion.slice(3)} /> {/* quita "X. " del inicio */}
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* ── BARRA INFERIOR ── */}
      <footer className="page-footer-fixed">
        {/* Anterior */}
        <button
          onClick={anterior}
          disabled={indexActual === 0}
          className="btn-footer-scroll"
          style={{
            flex: 1,
            opacity: indexActual === 0 ? 0.35 : 1,
            color: "var(--text-muted)",
            border: "0.5px solid var(--surface)"
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
            background: esMarcada ? "#451a03" : "var(--surface2)",
            border: esMarcada ? "1px solid #92400e" : "0.5px solid var(--surface)",
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
            background: matrizOpen ? "#1e3a5f" : "var(--surface2)",
            border: matrizOpen ? "1px solid #1d4ed8" : "0.5px solid var(--surface)",
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
        <SidenavMatrix
          preguntas={preguntas}
          respuestas={respuestas}
          marcadas={marcadas}
          preguntaActual={pregunta.id}
          secciones={secciones}
          seccionActual={seccionIdx}
          onIrA={irA}
          onCerrar={() => setMatrizOpen(false)}
        />
      )}

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
