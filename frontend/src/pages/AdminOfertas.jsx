// AdminOfertas.jsx
// Panel de administración sobre TODAS las ofertas de `ofertas_maestro`
// (cualquier profesor, no solo las propias) — a diferencia de la sección
// "Tus ofertas" de TutoriasMaestro.jsx, que solo ve/edita lo que publicó el
// propio usuario. Se apoya en dos políticas RLS nuevas (admin_update_todas /
// admin_delete_todas, ver Supabase) que permiten a un admin editar o borrar
// la oferta de cualquier profesor — incluyendo uno que un admin haya
// desactivado desde AdminMaestros.jsx (`activo = false`): ese profesor
// pierde el acceso a su propio portal de maestro, así que sin esto sus
// ofertas quedarían sin nadie que pudiera corregirlas o retirarlas.
//
// Filtro y búsqueda son puramente client-side sobre la lista ya cargada
// (mismo patrón que AdminReportes.jsx/AdminMaestros.jsx) — el dataset
// esperado es chico.

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { FilaChips } from "../components/FilaChips";
import { Seccion } from "../components/Seccion";
import { MATERIAS_TUTORIA, MATERIA_OTROS, nombreMateriaOferta } from "../data/materiasTutoria";
import { DURACIONES, PRECIO_MIN_MXN, PRECIO_MAX_MXN, inputStyle } from "../utils/tutorias";

import { AiOutlineClose } from "react-icons/ai";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineInboxStack,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";

function fmtFecha(fechaIso) {
  return new Date(fechaIso).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}
function pad(n) {
  return String(n).padStart(2, "0");
}
function fechaInput(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function horaInput(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AdminOfertas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, cargando: cargandoAuth, esAdmin } = useAuth();

  const [ofertas, setOfertas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState(searchParams.get("buscar") || "");
  const [filtroMateria, setFiltroMateria] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [borrandoId, setBorrandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState("");

  const [materiaId, setMateriaId] = useState("");
  const [materiaOtro, setMateriaOtro] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [precioMxn, setPrecioMxn] = useState("");
  const [duracionMin, setDuracionMin] = useState(60);
  const [cupo, setCupo] = useState("");
  const [profesor, setProfesor] = useState("");
  const [notas, setNotas] = useState("");
  const [cuentaClave, setCuentaClave] = useState("");

  async function cargar() {
    setCargando(true);
    setError("");
    const { data, error: fetchError } = await supabase
      .from("ofertas_maestro")
      .select("*")
      .order("fecha_hora", { ascending: true });
    if (fetchError) {
      console.error("No se pudieron cargar las ofertas (admin):", fetchError.message);
      setError("No se pudieron cargar las ofertas. Intenta de nuevo.");
    } else {
      setOfertas(data ?? []);
    }
    setCargando(false);
  }

  useEffect(() => {
    if (!user || !esAdmin) return;
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, esAdmin]);

  function iniciarEdicion(oferta) {
    setErrorEdicion("");
    setEditandoId(oferta.id);
    setMateriaId(oferta.materia_id);
    setMateriaOtro(oferta.materia_otro || "");
    const f = new Date(oferta.fecha_hora);
    setFecha(fechaInput(f));
    setHora(horaInput(f));
    setPrecioMxn(String(oferta.precio_mxn));
    setDuracionMin(oferta.duracion_minutos);
    setCupo(oferta.cupo_maximo);
    setProfesor(oferta.profesor);
    setNotas(oferta.notas || "");
    setCuentaClave(oferta.cuenta_clave);
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setErrorEdicion("");
  }

  async function guardarEdicion() {
    setErrorEdicion("");
    if (!materiaId) return setErrorEdicion("Selecciona una materia.");
    if (materiaId === MATERIA_OTROS.id && !materiaOtro.trim()) {
      return setErrorEdicion("Escribe el nombre de la materia.");
    }
    if (!fecha || !hora) return setErrorEdicion("Elige la fecha y la hora de la clase.");

    const fechaHora = new Date(`${fecha}T${hora}:00`);
    if (Number.isNaN(fechaHora.getTime())) return setErrorEdicion("Fecha u hora inválidas.");
    // A diferencia del formulario de TutoriasMaestro.jsx, aquí no se exige
    // que la fecha sea futura: un admin puede necesitar corregir el nombre
    // del profesor o la CLABE de una clase que ya pasó, sin que eso implique
    // "reprogramarla".

    const precio = Number(precioMxn);
    if (!precio || precio < PRECIO_MIN_MXN || precio > PRECIO_MAX_MXN) {
      return setErrorEdicion(`El precio debe estar entre $${PRECIO_MIN_MXN} y $${PRECIO_MAX_MXN} MXN.`);
    }
    const cupoNum = Number(cupo);
    if (!cupoNum || cupoNum < 1 || cupoNum > 50) return setErrorEdicion("El cupo debe ser entre 1 y 50 alumnos.");
    if (!profesor.trim()) return setErrorEdicion("Escribe el nombre del profesor.");
    if (notas.length > 500) return setErrorEdicion("Las notas son muy largas (máximo 500 caracteres).");
    if (!/^\d{18}$/.test(cuentaClave.trim())) return setErrorEdicion("La CLABE debe tener exactamente 18 dígitos.");

    setGuardando(true);
    const { error: guardarError } = await supabase
      .from("ofertas_maestro")
      .update({
        materia_id: materiaId,
        materia_otro: materiaId === MATERIA_OTROS.id ? materiaOtro.trim() : null,
        fecha_hora: fechaHora.toISOString(),
        precio_mxn: precio,
        duracion_minutos: duracionMin,
        cupo_maximo: cupoNum,
        profesor: profesor.trim(),
        notas: notas.trim() || null,
        cuenta_clave: cuentaClave.trim(),
      })
      .eq("id", editandoId);
    setGuardando(false);

    if (guardarError) {
      console.error("No se pudo guardar la oferta (admin):", guardarError.message);
      return setErrorEdicion(
        guardarError.code === "23514"
          ? "Revisa los datos: alguno no cumple el formato esperado."
          : "No se pudo guardar la oferta. Intenta de nuevo."
      );
    }

    setEditandoId(null);
    cargar();
  }

  async function borrarOferta(oferta) {
    setBorrandoId(oferta.id);
    const { error: deleteError } = await supabase.from("ofertas_maestro").delete().eq("id", oferta.id);
    setBorrandoId(null);
    if (deleteError) {
      console.error("No se pudo borrar la oferta (admin):", deleteError.message);
      setError("No se pudo borrar esa oferta. Intenta de nuevo.");
      return;
    }
    if (editandoId === oferta.id) setEditandoId(null);
    cargar();
  }

  const materiaElegida =
    materiaId === MATERIA_OTROS.id
      ? MATERIA_OTROS
      : MATERIAS_TUTORIA.find((m) => m.id === materiaId);

  function coincideBusqueda(o) {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    const nombreMateria = nombreMateriaOferta(o.materia_id, o.materia_otro).toLowerCase();
    return (
      o.profesor?.toLowerCase().includes(q) ||
      nombreMateria.includes(q) ||
      o.cuenta_clave?.includes(q) ||
      o.notas?.toLowerCase().includes(q)
    );
  }

  const ofertasFiltradas = useMemo(() => {
    return (ofertas ?? []).filter(
      (o) => (!filtroMateria || o.materia_id === filtroMateria) && coincideBusqueda(o)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ofertas, filtroMateria, busqueda]);

  const opcionesFiltroMateria = [
    { id: "", nombre: "Todas" },
    ...MATERIAS_TUTORIA,
    MATERIA_OTROS,
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Ofertas</h2>
          {!cargandoAuth && user && esAdmin && !cargando && (
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "2px 0 0" }}>
              {ofertas?.length ?? 0} en total · de todos los profesores
            </p>
          )}
        </div>
      </header>

      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 14 }}>
        {cargandoAuth && <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>Cargando…</p>}

        {!cargandoAuth && !user && (
          <div className="sp-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 12 }}>Necesitas iniciar sesión para ver esta página.</p>
            <button
              onClick={() => navigate("/login?modo=login")}
              style={{ minHeight: 44, padding: "0 20px", borderRadius: 10, border: "none", background: "#06b6d4", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {!cargandoAuth && user && !esAdmin && (
          <div className="sp-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", margin: 0 }}>No tienes permiso para ver esta página.</p>
          </div>
        )}

        {!cargandoAuth && user && esAdmin && (
          <>
            {error && <p style={{ color: "var(--wrong)", fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>}

            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <HiOutlineMagnifyingGlass style={{ position: "absolute", left: 14, color: "var(--text-muted)", fontSize: 16, pointerEvents: "none" }} />
              <input
                style={{
                  width: "100%", minHeight: 44, boxSizing: "border-box", paddingLeft: 40, paddingRight: 14,
                  background: "var(--surface)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12,
                  color: "var(--text)", fontSize: "0.9rem", outline: "none",
                }}
                placeholder="Buscar por profesor, materia, CLABE o notas…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, marginBottom: -2 }}>
              {opcionesFiltroMateria.map((m) => {
                const activo = filtroMateria === m.id;
                const color = m.color ?? "#7c5cbf";
                return (
                  <button
                    key={m.id || "todas"}
                    type="button"
                    onClick={() => setFiltroMateria(m.id)}
                    style={{
                      flexShrink: 0, minHeight: 40, padding: "0 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 700,
                      whiteSpace: "nowrap",
                      border: activo ? `1.5px solid ${color}` : "1px solid var(--surface2)",
                      background: activo ? `${color}1f` : "var(--surface)",
                      color: activo ? color : "var(--text-muted)",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {m.nombre}
                  </button>
                );
              })}
            </div>

            {cargando && <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: "8px 0" }}>Cargando…</p>}

            {!cargando && (ofertas?.length ?? 0) === 0 && (
              <div className="sp-card" style={{ margin: 0, alignItems: "center", textAlign: "center", padding: "32px 20px" }}>
                <HiOutlineInboxStack style={{ fontSize: 32, color: "var(--text-muted)" }} />
                <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "10px 0 0" }}>Todavía no hay ofertas publicadas.</p>
              </div>
            )}

            {!cargando && (ofertas?.length ?? 0) > 0 && ofertasFiltradas.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: "8px 0" }}>
                Ninguna oferta coincide con tu búsqueda o filtro.
              </p>
            )}

            {ofertasFiltradas.map((oferta) => {
              const materia = MATERIAS_TUTORIA.find((m) => m.id === oferta.materia_id);
              const color = materia?.color ?? MATERIA_OTROS.color;
              const nombreMateria = nombreMateriaOferta(oferta.materia_id, oferta.materia_otro);
              const enEdicion = editandoId === oferta.id;

              if (enEdicion) {
                return (
                  <Seccion
                    key={oferta.id}
                    icono={<HiOutlinePencilSquare />}
                    color={color}
                    title="Editando oferta"
                    subtitle={`Publicada por ${oferta.profesor}`}
                    style={{ margin: 0, border: `1.5px solid ${color}`, boxShadow: `0 0 0 4px ${color}2e` }}
                  >
                    <div>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Materia</p>
                      <FilaChips
                        opciones={[...MATERIAS_TUTORIA.map((m) => m.nombre), MATERIA_OTROS.nombre]}
                        valor={materiaElegida?.nombre}
                        onChange={(nombre) => {
                          if (nombre === MATERIA_OTROS.nombre) return setMateriaId(MATERIA_OTROS.id);
                          setMateriaId(MATERIAS_TUTORIA.find((m) => m.nombre === nombre)?.id ?? "");
                          setMateriaOtro("");
                        }}
                        color={color}
                      />
                      {materiaId === MATERIA_OTROS.id && (
                        <input
                          style={{ ...inputStyle, marginTop: 10 }}
                          placeholder="¿Qué materia?"
                          value={materiaOtro}
                          onChange={(e) => setMateriaOtro(e.target.value.slice(0, 60))}
                          maxLength={60}
                        />
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <input style={{ ...inputStyle, flex: 1, minWidth: 0 }} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                      <input style={{ ...inputStyle, flex: 1, minWidth: 0 }} type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
                    </div>

                    <div>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Duración</p>
                      <FilaChips
                        opciones={DURACIONES.map((d) => d.label)}
                        valor={DURACIONES.find((d) => d.minutos === duracionMin)?.label}
                        onChange={(label) => setDuracionMin(DURACIONES.find((d) => d.label === label)?.minutos ?? 60)}
                        color={color}
                      />
                    </div>

                    <input
                      style={inputStyle}
                      type="number"
                      min={1}
                      max={50}
                      placeholder="Cupo máximo de alumnos"
                      value={cupo}
                      onChange={(e) => setCupo(e.target.value)}
                    />

                    <input
                      style={inputStyle}
                      placeholder="Nombre del profesor"
                      value={profesor}
                      onChange={(e) => setProfesor(e.target.value)}
                      maxLength={80}
                    />

                    <input
                      style={inputStyle}
                      inputMode="numeric"
                      placeholder="CLABE (18 dígitos)"
                      value={cuentaClave}
                      onChange={(e) => setCuentaClave(e.target.value.replace(/\D/g, "").slice(0, 18))}
                      maxLength={18}
                    />

                    <input
                      style={inputStyle}
                      type="number"
                      min={PRECIO_MIN_MXN}
                      max={PRECIO_MAX_MXN}
                      step={10}
                      placeholder={`Precio ($${PRECIO_MIN_MXN}-$${PRECIO_MAX_MXN} MXN)`}
                      value={precioMxn}
                      onChange={(e) => setPrecioMxn(e.target.value)}
                    />

                    <textarea
                      style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                      maxLength={500}
                      placeholder="Notas (opcional)…"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                    />

                    {errorEdicion && <p style={{ color: "var(--wrong)", fontSize: 13, margin: 0 }}>{errorEdicion}</p>}

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={cancelarEdicion}
                        style={{ minHeight: 44, borderRadius: 10, border: "1px solid var(--surface2)", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={guardarEdicion}
                        disabled={guardando}
                        className="gm-cta"
                        style={{
                          flex: 1, minHeight: 44, borderRadius: 12, border: "none", background: color, color: "#fff",
                          fontWeight: 700, fontSize: 14, cursor: guardando ? "default" : "pointer",
                          opacity: guardando ? 0.7 : 1, boxShadow: `0 4px 14px ${color}4d`,
                        }}
                      >
                        {guardando ? "Guardando…" : "Guardar cambios"}
                      </button>
                    </div>
                  </Seccion>
                );
              }

              return (
                <div key={oferta.id} className="sp-card" style={{ margin: 0 }}>
                  <div className="sp-card-header">
                    <div className="sp-card-icon" style={{ background: `${color}22`, color }}>
                      {nombreMateria[0] ?? "?"}
                    </div>
                    <div className="sp-card-body">
                      <p className="sp-card-title">
                        {nombreMateria} · {oferta.duracion_minutos} min
                      </p>
                      <p className="sp-card-description">{fmtFecha(oferta.fecha_hora)}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
                        {oferta.profesor} · Cupo: {oferta.cupo_maximo} · CLABE: {oferta.cuenta_clave}
                      </p>
                    </div>
                    <p style={{ fontSize: 17, fontWeight: 800, color, margin: 0, whiteSpace: "nowrap" }}>
                      ${Number(oferta.precio_mxn).toFixed(0)}
                    </p>
                  </div>

                  {oferta.notas && (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "10px 0 0", lineHeight: 1.5 }}>
                      {oferta.notas}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => iniciarEdicion(oferta)}
                      style={{
                        flex: 1, minHeight: 40, borderRadius: 10, border: `1px solid ${color}`,
                        background: "transparent", color, fontWeight: 700, fontSize: 13,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer",
                      }}
                    >
                      <HiOutlinePencilSquare /> Editar
                    </button>
                    <button
                      type="button"
                      disabled={borrandoId === oferta.id}
                      onClick={() => borrarOferta(oferta)}
                      style={{
                        flex: 1, minHeight: 40, borderRadius: 10, border: "1px solid var(--wrong)",
                        background: "transparent", color: "var(--wrong)", fontWeight: 700, fontSize: 13,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        cursor: borrandoId === oferta.id ? "default" : "pointer",
                        opacity: borrandoId === oferta.id ? 0.6 : 1,
                      }}
                    >
                      <HiOutlineTrash /> {borrandoId === oferta.id ? "Borrando…" : "Borrar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}
