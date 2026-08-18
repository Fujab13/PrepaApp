// TutoriasMaestro.jsx
// Sub-página de "/tutorias" (ver Tutorias.jsx) para el lado Maestro: publica
// su disponibilidad (materia, horario, precio, cupo, notas y la CLABE donde
// recibe el pago) en la tabla `ofertas_maestro` para que los alumnos la vean
// en su portal. No hay flujo de aceptar/pagar dentro de la app — el maestro
// coordina grupo de WhatsApp y pago directamente con cada alumno.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { FilaChips } from "../components/FilaChips";
import { Seccion } from "../components/Seccion";
import { MATERIAS_TUTORIA } from "../data/materiasTutoria";
import {
  DURACIONES,
  PRECIO_MIN_MXN,
  PRECIO_MAX_MXN,
  inputStyle,
} from "../utils/tutorias";

import { AiOutlineClose } from "react-icons/ai";
import { PiChalkboardTeacher } from "react-icons/pi";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCurrencyDollar,
  HiOutlineBanknotes,
  HiOutlineClipboardDocumentList,
  HiOutlineUserGroup,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi2";

// En móvil, el teclado se come la mitad inferior de la pantalla. Sin esto,
// un campo cerca del final del formulario (p.ej. "Cupo de alumnos" o toda la
// sección "Tus datos y cobro", que es la última) queda tapado por el
// teclado al enfocarlo, y como es la última sección no hay nada más abajo
// hacia dónde el navegador pueda desplazarse para compensar. El setTimeout
// espera a que el teclado termine de abrirse (y el viewport visual haya
// terminado de encogerse) antes de medir dónde centrar el campo.
function manejarFocoCampo(e) {
  const tag = e.target.tagName;
  if (tag !== "INPUT" && tag !== "TEXTAREA") return;
  const el = e.target;
  setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 300);
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

export default function TutoriasMaestro() {
  const navigate = useNavigate();
  const { user, cargando: cargandoAuth, perfil, esMaestro, refrescarPerfil } = useAuth();

  const [nombreInput, setNombreInput] = useState("");
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  const [misOfertas, setMisOfertas] = useState([]);
  const [cargandoOfertas, setCargandoOfertas] = useState(true);
  const [mostrarOfertas, setMostrarOfertas] = useState(false);

  const [borrandoId, setBorrandoId] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  const [materiaId, setMateriaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [precioMxn, setPrecioMxn] = useState("");
  const [duracionMin, setDuracionMin] = useState(60);
  const [cupo, setCupo] = useState("");
  const [profesor, setProfesor] = useState("");
  const [notas, setNotas] = useState("");
  const [cuentaClave, setCuentaClave] = useState("");

  const [publicando, setPublicando] = useState(false);
  const [errorPublicar, setErrorPublicar] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (perfil?.nombre && !profesor) setProfesor(perfil.nombre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil?.nombre]);

  async function cargarMisOfertas() {
    setCargandoOfertas(true);
    const { data, error: fetchError } = await supabase
      .from("ofertas_maestro")
      .select("*")
      .eq("creado_por", user.id)
      .order("fecha_hora", { ascending: true });
    setCargandoOfertas(false);
    if (fetchError) return setError("No se pudieron cargar tus ofertas. Intenta de nuevo.");
    setMisOfertas(data ?? []);
  }

  useEffect(() => {
    if (!user) return;
    cargarMisOfertas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function guardarNombre() {
    if (!nombreInput.trim() || !user) return;
    setGuardandoNombre(true);
    await supabase.from("perfiles").update({ nombre: nombreInput.trim() }).eq("id", user.id);
    setGuardandoNombre(false);
    await refrescarPerfil();
  }

  async function borrarOferta(oferta) {
    setBorrandoId(oferta.id);
    const { error: deleteError } = await supabase.from("ofertas_maestro").delete().eq("id", oferta.id);
    setBorrandoId(null);
    if (deleteError) return setError("No se pudo borrar tu oferta. Intenta de nuevo.");
    if (editandoId === oferta.id) limpiarFormulario();
    cargarMisOfertas();
  }

  function iniciarEdicion(oferta) {
    setErrorPublicar("");
    setEditandoId(oferta.id);
    setMateriaId(oferta.materia_id);
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

  function limpiarFormulario() {
    setEditandoId(null);
    setErrorPublicar("");
    setMateriaId("");
    setFecha("");
    setHora("");
    setPrecioMxn("");
    setDuracionMin(60);
    setCupo("");
    setProfesor(perfil?.nombre || "");
    setNotas("");
    setCuentaClave("");
  }

  async function guardarOferta() {
    setErrorPublicar("");
    if (!materiaId) return setErrorPublicar("Selecciona una materia.");
    if (!fecha || !hora) return setErrorPublicar("Elige la fecha y la hora de la clase.");

    const fechaHora = new Date(`${fecha}T${hora}:00`);
    if (Number.isNaN(fechaHora.getTime()) || fechaHora.getTime() < Date.now()) {
      return setErrorPublicar("Elige una fecha y hora futuras.");
    }
    const precio = Number(precioMxn);
    if (!precio || precio < PRECIO_MIN_MXN || precio > PRECIO_MAX_MXN) {
      return setErrorPublicar(`El precio debe estar entre $${PRECIO_MIN_MXN} y $${PRECIO_MAX_MXN} MXN.`);
    }
    const cupoNum = Number(cupo);
    if (!cupoNum || cupoNum < 1 || cupoNum > 50) return setErrorPublicar("El cupo debe ser entre 1 y 50 alumnos.");
    if (!profesor.trim()) return setErrorPublicar("Escribe el nombre del profesor.");
    if (notas.length > 500) return setErrorPublicar("Tus notas son muy largas (máximo 500 caracteres).");
    if (!/^\d{18}$/.test(cuentaClave.trim())) return setErrorPublicar("La CLABE debe tener exactamente 18 dígitos.");

    const datos = {
      materia_id: materiaId,
      fecha_hora: fechaHora.toISOString(),
      precio_mxn: precio,
      duracion_minutos: duracionMin,
      cupo_maximo: cupoNum,
      profesor: profesor.trim(),
      notas: notas.trim() || null,
      cuenta_clave: cuentaClave.trim(),
    };

    setPublicando(true);
    const { error: guardarError } = editandoId
      ? await supabase.from("ofertas_maestro").update(datos).eq("id", editandoId)
      : await supabase.from("ofertas_maestro").insert(datos);
    setPublicando(false);

    if (guardarError) {
      return setErrorPublicar(
        guardarError.code === "23514"
          ? "Revisa los datos: alguno no cumple el formato esperado."
          : "No se pudo guardar tu oferta. Intenta de nuevo."
      );
    }

    limpiarFormulario();
    cargarMisOfertas();
  }

  const materiaElegida = MATERIAS_TUTORIA.find((m) => m.id === materiaId);
  const faltaNombre = Boolean(user) && perfil !== null && !perfil?.nombre;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/tutorias")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <span className="page-topbar-btn" style={{ fontSize: "1.35rem" }}>
          <PiChalkboardTeacher />
        </span>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Maestros</h2>
      </header>

      <main
        className="page-content-compact"
        onFocus={manejarFocoCampo}
        style={{ flex: 1, paddingBottom: "45vh", display: "flex", flexDirection: "column", gap: 16 }}
      >

        {cargandoAuth && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>Cargando…</p>
        )}

        {!cargandoAuth && !user && (
          <div className="sp-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 12 }}>
              Necesitas iniciar sesión para usar el marketplace de tutorías.
            </p>
            <button
              onClick={() => navigate("/login?modo=login")}
              style={{ minHeight: 44, padding: "0 20px", borderRadius: 10, border: "none", background: "#06b6d4", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {!cargandoAuth && user && faltaNombre && (
          <Seccion icono={<PiChalkboardTeacher />} color="#06b6d4" title="¿Cómo te llamas?" subtitle="Tu nombre lo verán los alumnos al publicar o aceptar una oferta.">
            <input
              style={inputStyle}
              placeholder="Tu nombre"
              value={nombreInput}
              onChange={(e) => setNombreInput(e.target.value)}
              maxLength={80}
            />
            <button
              onClick={guardarNombre}
              disabled={guardandoNombre || !nombreInput.trim()}
              style={{ minHeight: 44, borderRadius: 10, border: "none", background: "#06b6d4", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: guardandoNombre || !nombreInput.trim() ? 0.6 : 1 }}
            >
              {guardandoNombre ? "Guardando…" : "Guardar"}
            </button>
          </Seccion>
        )}

        {!cargandoAuth && user && !faltaNombre && !esMaestro && (
          <div className="sp-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", margin: 0, lineHeight: 1.5 }}>
              Este portal es solo para maestros registrados. Si ya diste de alta tu clase con nosotros, contáctanos
              para revisar tu acceso.
            </p>
          </div>
        )}

        {!cargandoAuth && user && !faltaNombre && esMaestro && (
          <>
            <Seccion icono={<HiOutlineBanknotes />} color="#4f8ef7" title="Mis ganancias" subtitle="Cuánto te deben, cuánto ya te pagamos y tus recibos por quincena.">
              <button
                type="button"
                onClick={() => navigate("/tutorias/maestro/ganancias")}
                style={{ minHeight: 44, borderRadius: 10, border: "none", background: "#4f8ef7", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                Ver mis ganancias
              </button>
            </Seccion>

            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
              Publica tu disponibilidad para que los alumnos la vean en su portal. El grupo de WhatsApp y el pago se
              coordinan directamente contigo.
            </p>

            <Seccion icono={<HiOutlineClipboardDocumentList />} color="#22c55e" title="Informes de alumnos" subtitle="Consulta el formulario de área y el examen simulador de un alumno por su correo.">
              <button
                type="button"
                onClick={() => navigate("/informe-resultados")}
                style={{ minHeight: 44, borderRadius: 10, border: "none", background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                Buscar por correo
              </button>
            </Seccion>

            <Seccion icono={<HiOutlineUserGroup />} color="#06b6d4" title="Alumnos inscritos" subtitle="Correo, nombre y teléfono de quienes ya compraron un cupo en tus ofertas.">
              <button
                type="button"
                onClick={() => navigate("/tutorias/maestro/alumnos")}
                style={{ minHeight: 44, borderRadius: 10, border: "none", background: "#06b6d4", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                Ver alumnos inscritos
              </button>
            </Seccion>

            {error && <p style={{ color: "var(--wrong)", fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>}

            <Seccion icono={<HiOutlineCurrencyDollar />} color="#7c5cbf" title="Tus ofertas" subtitle="Guardadas en Supabase; edítalas o bórralas cuando quieras.">
                {cargandoOfertas && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Cargando tus ofertas…</p>
                )}
                {!cargandoOfertas && misOfertas.length === 0 && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Todavía no has publicado ninguna oferta.</p>
                )}
                {!cargandoOfertas && misOfertas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMostrarOfertas((v) => !v)}
                    style={{
                      minHeight: 44, borderRadius: 10, border: "1px solid #7c5cbf",
                      background: mostrarOfertas ? "rgba(124,92,191,0.15)" : "transparent",
                      color: "#7c5cbf", fontWeight: 700, fontSize: 14, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {mostrarOfertas ? "Ocultar mis ofertas" : `Ver mis ofertas (${misOfertas.length})`}
                    {mostrarOfertas ? <HiChevronUp /> : <HiChevronDown />}
                  </button>
                )}
                {mostrarOfertas && misOfertas.map((oferta) => {
                  const materia = MATERIAS_TUTORIA.find((m) => m.id === oferta.materia_id);
                  const color = materia?.color ?? "#7c5cbf";
                  const fechaObj = new Date(oferta.fecha_hora);
                  const enEdicion = editandoId === oferta.id;
                  return (
                    <div
                      key={oferta.id}
                      className="sp-card"
                      style={{ margin: 0, border: enEdicion ? `1.5px solid ${color}` : undefined }}
                    >
                      <div className="sp-card-header">
                        <div className="sp-card-icon" style={{ background: `${color}22`, color }}>
                          {materia?.nombre?.[0] ?? "?"}
                        </div>
                        <div className="sp-card-body">
                          <p className="sp-card-title">
                            {materia?.nombre ?? oferta.materia_id} · {oferta.duracion_minutos} min
                          </p>
                          <p className="sp-card-description">
                            {fechaObj.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
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
                          onClick={() => (enEdicion ? limpiarFormulario() : iniciarEdicion(oferta))}
                          style={{
                            flex: 1,
                            minHeight: 40,
                            borderRadius: 10,
                            border: `1px solid ${color}`,
                            background: enEdicion ? `${color}22` : "transparent",
                            color,
                            fontWeight: 700,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            cursor: "pointer",
                          }}
                        >
                          <HiOutlinePencilSquare /> {enEdicion ? "Editando…" : "Editar"}
                        </button>
                        <button
                          type="button"
                          disabled={borrandoId === oferta.id}
                          onClick={() => borrarOferta(oferta)}
                          style={{
                            flex: 1,
                            minHeight: 40,
                            borderRadius: 10,
                            border: "1px solid var(--wrong)",
                            background: "transparent",
                            color: "var(--wrong)",
                            fontWeight: 700,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
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
              </Seccion>

            <Seccion
              icono={<HiOutlineChatBubbleLeftRight />}
              color="#06b6d4"
              title={editandoId ? "Editando oferta" : "Detalles de la clase"}
              subtitle="Materia, horario, duración y cupo."
            >
              <div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Materia</p>
                <FilaChips
                  opciones={MATERIAS_TUTORIA.map((m) => m.nombre)}
                  valor={materiaElegida?.nombre}
                  onChange={(nombre) => setMateriaId(MATERIAS_TUTORIA.find((m) => m.nombre === nombre)?.id ?? "")}
                  color="#06b6d4"
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <input
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
                <input
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>

              <div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Duración</p>
                <FilaChips
                  opciones={DURACIONES.map((d) => d.label)}
                  valor={DURACIONES.find((d) => d.minutos === duracionMin)?.label}
                  onChange={(label) => setDuracionMin(DURACIONES.find((d) => d.label === label)?.minutos ?? 60)}
                  color="#06b6d4"
                />
              </div>
              <div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Cupo de alumnos</p>
              <input
                style={inputStyle}
                type="number"
                min={1}
                max={50}
                placeholder="Cupo máximo de alumnos"
                value={cupo}
                onChange={(e) => setCupo(e.target.value)}
              />
              </div>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                maxLength={500}
                placeholder="Notas para tu alumno (opcional)…"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </Seccion>

            <Seccion icono={<HiOutlineCurrencyDollar />} color="#4f8ef7" title="Tus datos y cobro" subtitle="Así te contactan y te pagan.">
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
                placeholder="CLABE (18 dígitos) para recibir el pago"
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
                placeholder={`¿Cuánto cobras? (Ej. 350, $${PRECIO_MIN_MXN}-$${PRECIO_MAX_MXN} MXN)`}
                value={precioMxn}
                onChange={(e) => setPrecioMxn(e.target.value)}
              />

              {errorPublicar && <p style={{ color: "var(--wrong)", fontSize: 13, margin: 0 }}>{errorPublicar}</p>}

              <div style={{ display: "flex", gap: 8 }}>
                {editandoId && (
                  <button
                    type="button"
                    onClick={limpiarFormulario}
                    style={{ minHeight: 44, borderRadius: 10, border: "1px solid var(--surface)", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={guardarOferta}
                  disabled={publicando}
                  style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "none", background: "#4f8ef7", color: "#fff", fontWeight: 700, fontSize: 14, cursor: publicando ? "default" : "pointer", opacity: publicando ? 0.7 : 1 }}
                >
                  {publicando ? "Guardando…" : editandoId ? "Guardar cambios" : "Publicar disponibilidad"}
                </button>
              </div>
            </Seccion>
          </>
        )}
      </main>
    </div>
  );
}
