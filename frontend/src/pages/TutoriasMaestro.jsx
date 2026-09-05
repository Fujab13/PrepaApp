// TutoriasMaestro.jsx
// Sub-página de "/tutorias" (ver Tutorias.jsx) para el lado Maestro: publica
// su disponibilidad (materia, horario, precio, cupo, notas y la CLABE donde
// recibe el pago) en la tabla `ofertas_maestro` para que los alumnos la vean
// en su portal. No hay flujo de aceptar/pagar dentro de la app — el maestro
// coordina grupo de WhatsApp y pago directamente con cada alumno.

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { FilaChips, chip } from "../components/FilaChips";
import { Seccion } from "../components/Seccion";
import { MATERIAS_TUTORIA, MATERIA_OTROS, nombreMateriaOferta } from "../data/materiasTutoria";
import {
  registrarProfesorPropio,
  actualizarProfesorPropio,
  actualizarCuentaProfesor,
  obtenerMiEstadoProfesor,
  verificarLoginProfesor,
} from "../services/profesores";
import {
  DURACIONES,
  PRECIO_MIN_MXN,
  PRECIO_MAX_MXN,
  inputStyle,
} from "../utils/tutorias";
import { CORREO_CONTACTO_APP } from "../utils/contacto";

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
  HiOutlineIdentification,
  HiOutlineClock,
  HiOutlinePauseCircle,
  HiOutlineLockClosed,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi2";

// Documentación que valida a un profesor: hoy se manda a mano por correo
// porque todavía no existe un panel de admin para recibirla (ver migración
// 20260826120000_registro_autoservicio_profesores) — sí hay un buzón
// dedicado (CORREO_CONTACTO_APP), separado de la cuenta personal del dueño
// del proyecto.
const CORREO_DOCUMENTOS_PROFESOR = CORREO_CONTACTO_APP;
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

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
  const { user, cargando: cargandoAuth, esMaestro } = useAuth();

  const [misOfertas, setMisOfertas] = useState([]);
  const [cargandoOfertas, setCargandoOfertas] = useState(true);
  const [mostrarOfertas, setMostrarOfertas] = useState(false);

  const [borrandoId, setBorrandoId] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  const [materiaId, setMateriaId] = useState("");
  const [materiaOtro, setMateriaOtro] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [precioMxn, setPrecioMxn] = useState("");
  const [duracionMin, setDuracionMin] = useState(60);
  const [cupo, setCupo] = useState("");
  const [notas, setNotas] = useState("");

  const [publicando, setPublicando] = useState(false);
  const [errorPublicar, setErrorPublicar] = useState("");
  const [error, setError] = useState("");

  // Registro self-service de profesor (mientras no sea maestro verificado).
  const [estadoProfesor, setEstadoProfesor] = useState(null);
  const [cargandoEstadoProfesor, setCargandoEstadoProfesor] = useState(true);
  const [errorEstadoProfesor, setErrorEstadoProfesor] = useState("");
  const [regNombre, setRegNombre] = useState("");
  const [regCurp, setRegCurp] = useState("");
  const [regEmailContacto, setRegEmailContacto] = useState("");
  const [regTelefono, setRegTelefono] = useState("");
  const [regMaterias, setRegMaterias] = useState([]);
  const [regNumeroCuenta, setRegNumeroCuenta] = useState("");
  const [registrandoProfesor, setRegistrandoProfesor] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState("");
  const [editandoRegistro, setEditandoRegistro] = useState(false);

  // Editar SOLO la CLABE de cobro (RPC aparte, funciona aunque ya esté
  // verificado — ver actualizar_cuenta_profesor en la migración
  // 20260904130000_numero_cuenta_profesor).
  const [editandoCuenta, setEditandoCuenta] = useState(false);
  const [nuevaCuenta, setNuevaCuenta] = useState("");
  const [guardandoCuenta, setGuardandoCuenta] = useState(false);
  const [errorCuenta, setErrorCuenta] = useState("");

  // Login aparte (correo + contraseña de profesor) que desbloquea el
  // portal una vez que la cuenta ya quedó verificada.
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginContrasena, setLoginContrasena] = useState("");
  const [verificandoLogin, setVerificandoLogin] = useState(false);
  const [errorLogin, setErrorLogin] = useState("");

  const cargarEstadoProfesor = useCallback(() => {
    if (!user) return () => {};
    let cancelado = false;
    setCargandoEstadoProfesor(true);
    setErrorEstadoProfesor("");
    obtenerMiEstadoProfesor()
      .then((data) => { if (!cancelado) setEstadoProfesor(data); })
      .catch((err) => {
        if (cancelado) return;
        // Sin esto, un fallo de red se ve idéntico a "nunca te registraste":
        // estadoProfesor cae en null en ambos casos y el render de abajo
        // muestra el formulario de alta vacío, como si el nombre/CURP que
        // ya había registrado nunca se hubiera guardado.
        console.error('No se pudo cargar tu registro de profesor:', err.message);
        setEstadoProfesor(null);
        setErrorEstadoProfesor('No se pudo cargar tu registro de profesor. Revisa tu conexión e intenta de nuevo.');
      })
      .finally(() => { if (!cancelado) setCargandoEstadoProfesor(false); });
    return () => { cancelado = true; };
  }, [user]);

  useEffect(() => cargarEstadoProfesor(), [cargarEstadoProfesor]);

  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem(`profesorDesbloqueado_${user.id}`) === "1") setDesbloqueado(true);
  }, [user]);

  function alternarMateriaRegistro(id) {
    setRegMaterias((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  function validarFormularioRegistro() {
    if (!regNombre.trim()) return "Escribe tu nombre completo.";
    if (!CURP_REGEX.test(regCurp.trim().toUpperCase())) return "Escribe tu CURP completa (18 caracteres).";
    if (!regEmailContacto.trim() || !regEmailContacto.includes("@")) return "Escribe un correo de contacto válido.";
    if (regMaterias.length === 0) return "Elige al menos una materia que puedas impartir.";
    if (!/^\d{18}$/.test(regNumeroCuenta.trim())) return "La CLABE debe tener exactamente 18 dígitos.";
    return "";
  }

  function iniciarEdicionRegistro() {
    if (!estadoProfesor) return;
    setRegNombre(estadoProfesor.nombre || "");
    setRegCurp(estadoProfesor.curp || "");
    setRegEmailContacto(estadoProfesor.email_contacto || "");
    setRegTelefono(estadoProfesor.telefono_contacto || "");
    setRegMaterias(estadoProfesor.materias || []);
    setRegNumeroCuenta(estadoProfesor.numero_cuenta || "");
    setErrorRegistro("");
    setEditandoRegistro(true);
  }

  function cancelarEdicionRegistro() {
    setEditandoRegistro(false);
    setErrorRegistro("");
  }

  async function enviarRegistroProfesor() {
    const errValidacion = validarFormularioRegistro();
    setErrorRegistro(errValidacion);
    if (errValidacion) return;

    setRegistrandoProfesor(true);
    try {
      await registrarProfesorPropio({
        nombre: regNombre.trim(),
        curp: regCurp.trim().toUpperCase(),
        emailContacto: regEmailContacto.trim(),
        telefonoContacto: regTelefono.trim(),
        materias: regMaterias,
        numeroCuenta: regNumeroCuenta.trim(),
      });
      setEstadoProfesor(await obtenerMiEstadoProfesor());
    } catch (err) {
      const msg = err.message || "";
      setErrorRegistro(
        msg.includes("ya_registrado")
          ? "Ya tienes un registro de profesor con esta cuenta."
          : msg.includes("curp") || err.code === "23505"
            ? "Esa CURP ya está registrada."
            : "No se pudo enviar tu registro. Intenta de nuevo."
      );
    }
    setRegistrandoProfesor(false);
  }

  async function guardarEdicionRegistro() {
    const errValidacion = validarFormularioRegistro();
    setErrorRegistro(errValidacion);
    if (errValidacion) return;

    setRegistrandoProfesor(true);
    try {
      await actualizarProfesorPropio({
        nombre: regNombre.trim(),
        curp: regCurp.trim().toUpperCase(),
        emailContacto: regEmailContacto.trim(),
        telefonoContacto: regTelefono.trim(),
        materias: regMaterias,
        numeroCuenta: regNumeroCuenta.trim(),
      });
      setEstadoProfesor(await obtenerMiEstadoProfesor());
      setEditandoRegistro(false);
    } catch (err) {
      const msg = err.message || "";
      setErrorRegistro(
        msg.includes("ya_verificado")
          ? "Tu cuenta ya fue verificada; contáctanos si necesitas corregir algo."
          : msg.includes("curp") || err.code === "23505"
            ? "Esa CURP ya está registrada."
            : "No se pudieron guardar tus cambios. Intenta de nuevo."
      );
    }
    setRegistrandoProfesor(false);
  }

  function iniciarEdicionCuenta() {
    setNuevaCuenta(estadoProfesor?.numero_cuenta || "");
    setErrorCuenta("");
    setEditandoCuenta(true);
  }

  function cancelarEdicionCuenta() {
    setEditandoCuenta(false);
    setErrorCuenta("");
  }

  async function guardarCuenta() {
    if (!/^\d{18}$/.test(nuevaCuenta.trim())) {
      return setErrorCuenta("La CLABE debe tener exactamente 18 dígitos.");
    }
    setGuardandoCuenta(true);
    try {
      await actualizarCuentaProfesor(nuevaCuenta.trim());
      setEstadoProfesor(await obtenerMiEstadoProfesor());
      setEditandoCuenta(false);
    } catch {
      setErrorCuenta("No se pudo guardar tu CLABE. Intenta de nuevo.");
    }
    setGuardandoCuenta(false);
  }

  async function iniciarSesionProfesor() {
    setErrorLogin("");
    if (!loginEmail.trim() || !loginContrasena.trim()) {
      return setErrorLogin("Escribe tu correo y tu contraseña de profesor.");
    }
    setVerificandoLogin(true);
    try {
      await verificarLoginProfesor(loginEmail.trim(), loginContrasena.trim());
      sessionStorage.setItem(`profesorDesbloqueado_${user.id}`, "1");
      setDesbloqueado(true);
    } catch {
      setErrorLogin("Correo o contraseña de profesor incorrectos.");
    }
    setVerificandoLogin(false);
  }

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
    setMateriaOtro(oferta.materia_otro || "");
    const f = new Date(oferta.fecha_hora);
    setFecha(fechaInput(f));
    setHora(horaInput(f));
    setPrecioMxn(String(oferta.precio_mxn));
    setDuracionMin(oferta.duracion_minutos);
    setCupo(oferta.cupo_maximo);
    setNotas(oferta.notas || "");
  }

  function limpiarFormulario() {
    setEditandoId(null);
    setErrorPublicar("");
    setMateriaId("");
    setMateriaOtro("");
    setFecha("");
    setHora("");
    setPrecioMxn("");
    setDuracionMin(60);
    setCupo("");
    setNotas("");
  }

  async function guardarOferta() {
    setErrorPublicar("");
    if (!materiaId) return setErrorPublicar("Selecciona una materia.");
    if (materiaId === MATERIA_OTROS.id && !materiaOtro.trim()) {
      return setErrorPublicar("Escribe el nombre de la materia.");
    }
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
    if (notas.length > 500) return setErrorPublicar("Tus notas son muy largas (máximo 500 caracteres).");
    if (!estadoProfesor?.nombre) return setErrorPublicar("No se pudo cargar tu nombre registrado. Recarga la página.");
    if (!/^\d{18}$/.test(estadoProfesor?.numero_cuenta || "")) {
      return setErrorPublicar("Configura tu CLABE para recibir pagos (arriba, en \"Tu cuenta para recibir pagos\") antes de publicar.");
    }

    const datos = {
      materia_id: materiaId,
      materia_otro: materiaId === MATERIA_OTROS.id ? materiaOtro.trim() : null,
      fecha_hora: fechaHora.toISOString(),
      precio_mxn: precio,
      duracion_minutos: duracionMin,
      cupo_maximo: cupoNum,
      profesor: estadoProfesor.nombre.trim(),
      notas: notas.trim() || null,
      cuenta_clave: estadoProfesor.numero_cuenta.trim(),
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

  const materiaElegida =
    materiaId === MATERIA_OTROS.id
      ? MATERIA_OTROS
      : MATERIAS_TUTORIA.find((m) => m.id === materiaId);

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
              className="gm-cta"
              style={{
                minHeight: 44, padding: "0 20px", borderRadius: 12, border: "none",
                background: "#06b6d4", color: "#fff", fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(6, 182, 212, 0.3)",
              }}
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {!cargandoAuth && user && !esMaestro && (
          <>
            {cargandoEstadoProfesor && (
              <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>Cargando…</p>
            )}

            {!cargandoEstadoProfesor && errorEstadoProfesor && (
              <div className="sp-card" style={{ textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "var(--wrong)", margin: "0 0 12px" }}>{errorEstadoProfesor}</p>
                <button
                  type="button"
                  onClick={cargarEstadoProfesor}
                  style={{ minHeight: 44, padding: "0 20px", borderRadius: 10, border: "1px solid var(--surface2)", background: "transparent", color: "var(--text)", fontWeight: 700, cursor: "pointer" }}
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Sin `!errorEstadoProfesor`, un fallo de red se vería igual que
                "nunca te registraste" (estadoProfesor cae en null en ambos
                casos) y este formulario vacío tapa un registro que sí existe. */}
            {!cargandoEstadoProfesor && !errorEstadoProfesor && (!estadoProfesor || (estadoProfesor && !estadoProfesor.verificado && editandoRegistro)) && (
              <Seccion
                icono={<HiOutlineIdentification />}
                color="#06b6d4"
                title={estadoProfesor ? "Edita tu registro" : "Regístrate como profesor"}
                subtitle={
                  estadoProfesor
                    ? "Corrige tus datos antes de que revisemos tu documentación."
                    : "Llena tus datos; tu acceso se activa después de validar tu documentación."
                }
              >
                <input
                  style={inputStyle}
                  placeholder="Nombre completo"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  maxLength={80}
                />
                <input
                  style={inputStyle}
                  placeholder="CURP (18 caracteres)"
                  value={regCurp}
                  onChange={(e) => setRegCurp(e.target.value.toUpperCase().slice(0, 18))}
                  maxLength={18}
                />
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="Correo de contacto (a dónde te buscamos, puede ser distinto al de tu cuenta)"
                  value={regEmailContacto}
                  onChange={(e) => setRegEmailContacto(e.target.value)}
                />
                <input
                  style={inputStyle}
                  type="tel"
                  placeholder="Teléfono de contacto (opcional)"
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)}
                  maxLength={20}
                />
                <div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Materias que puedes impartir</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {MATERIAS_TUTORIA.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        style={chip(regMaterias.includes(m.id), m.color)}
                        onClick={() => alternarMateriaRegistro(m.id)}
                      >
                        {m.nombre}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  style={inputStyle}
                  inputMode="numeric"
                  placeholder="CLABE (18 dígitos) para recibir tus pagos"
                  value={regNumeroCuenta}
                  onChange={(e) => setRegNumeroCuenta(e.target.value.replace(/\D/g, "").slice(0, 18))}
                  maxLength={18}
                />

                {errorRegistro && <p style={{ color: "var(--wrong)", fontSize: 13, margin: 0 }}>{errorRegistro}</p>}

                <div style={{ display: "flex", gap: 8 }}>
                  {estadoProfesor && (
                    <button
                      type="button"
                      onClick={cancelarEdicionRegistro}
                      style={{ minHeight: 44, borderRadius: 10, border: "1px solid var(--surface2)", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={estadoProfesor ? guardarEdicionRegistro : enviarRegistroProfesor}
                    disabled={registrandoProfesor}
                    className="gm-cta"
                    style={{
                      flex: 1, minHeight: 44, borderRadius: 12, border: "none", background: "#06b6d4",
                      color: "#fff", fontWeight: 700, fontSize: 14, cursor: registrandoProfesor ? "default" : "pointer",
                      opacity: registrandoProfesor ? 0.7 : 1, boxShadow: "0 4px 14px rgba(6, 182, 212, 0.3)",
                    }}
                  >
                    {registrandoProfesor ? "Guardando…" : estadoProfesor ? "Guardar cambios" : "Enviar mi registro"}
                  </button>
                </div>
              </Seccion>
            )}

            {!cargandoEstadoProfesor && estadoProfesor && !estadoProfesor.verificado && !editandoRegistro && (
              <Seccion
                icono={<HiOutlineClock />}
                color="#eab308"
                title="Tu registro está en revisión"
                subtitle="Falta un paso: mándanos tu documentación para validar tu cuenta."
              >
                <div style={{ background: "var(--surface)", border: "1px solid var(--surface2)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Lo que enviaste</p>
                  <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>Nombre: {estadoProfesor.nombre}</p>
                  <p style={{ fontSize: 13, color: "var(--text)", margin: 0, fontFamily: "monospace" }}>CURP: {estadoProfesor.curp}</p>
                  <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>Correo de contacto: {estadoProfesor.email_contacto}</p>
                  <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>Teléfono: {estadoProfesor.telefono_contacto || "—"}</p>
                  <p style={{ fontSize: 13, color: "var(--text)", margin: 0, fontFamily: "monospace" }}>CLABE: {estadoProfesor.numero_cuenta || "—"}</p>
                  <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>
                    Materias: {(estadoProfesor.materias || []).map((id) => MATERIAS_TUTORIA.find((m) => m.id === id)?.nombre ?? id).join(", ") || "—"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={iniciarEdicionRegistro}
                  style={{ minHeight: 44, borderRadius: 10, border: "1px solid #eab308", background: "transparent", color: "#eab308", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <HiOutlinePencilSquare /> Editar mis datos
                </button>

                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                  Manda la siguiente documentación en este orden y con estos nombres al correo{" "}
                  <a
                    href={`mailto:${CORREO_DOCUMENTOS_PROFESOR}?subject=${encodeURIComponent(estadoProfesor.curp || "")}`}
                    style={{ color: "#eab308" }}
                  >
                    {CORREO_DOCUMENTOS_PROFESOR}
                  </a>{" "}
                  con tu CURP como asunto:
                </p>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#eab308", margin: 0, fontFamily: "monospace" }}>
                  {estadoProfesor.curp}
                </p>
                <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                  {["CERTIFICADO DE ESTUDIOS", "CURP", "INE", "ACTA DE NACIMIENTO", "RFC"].map((doc) => (
                    <li key={doc} style={{ fontSize: 13, color: "var(--text)", fontFamily: "monospace", fontWeight: 700 }}>
                      {doc}
                    </li>
                  ))}
                </ol>
                <p style={{ fontSize: 13, color: "var(--text)", margin: 0, lineHeight: 1.6 }}>
                  Asegúrate de realizar correctamente tu registro todo en formato pdf.
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                  Cuando el equipo confirme tu documentación, te compartiremos por correo tu contraseña de profesor
                  para que puedas entrar aquí.
                </p>
              </Seccion>
            )}

            {/* Verificado pero soy_maestro_actual() da false: la única causa
                posible es que un admin te haya desactivado (ver
                establecerProfesorActivo en AdminMaestros.jsx) — mi_estado_profesor()
                no expone `activo`, así que no hay forma de distinguir esto de
                otro estado; sin este bloque la pantalla se queda en blanco
                porque ninguna otra condición de arriba/abajo aplica. */}
            {!cargandoEstadoProfesor && estadoProfesor && estadoProfesor.verificado && !editandoRegistro && (
              <Seccion
                icono={<HiOutlinePauseCircle />}
                color="#f97316"
                title="Tu acceso está pausado"
                subtitle="Estamos revisando tu perfil — no es nada que tengas que hacer."
              >
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                  El equipo de PrepaApp pausó temporalmente tu acceso al portal de maestros mientras revisa tu perfil.
                  En cuanto termine, tu acceso se restablece solo — no necesitas volver a registrarte.
                </p>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                  Si tienes dudas, escríbenos a{" "}
                  <a
                    href={`mailto:${CORREO_DOCUMENTOS_PROFESOR}?subject=${encodeURIComponent(estadoProfesor.curp || "")}`}
                    style={{ color: "#f97316" }}
                  >
                    {CORREO_DOCUMENTOS_PROFESOR}
                  </a>{" "}
                  usando tu CURP como asunto.
                </p>
              </Seccion>
            )}
          </>
        )}

        {!cargandoAuth && user && esMaestro && !desbloqueado && (
          <Seccion
            icono={<HiOutlineLockClosed />}
            color="#4f8ef7"
            title="Entra como profesor"
            subtitle="Tu cuenta ya está verificada. Usa el correo y la contraseña de profesor que te compartimos por correo."
          >
            <input
              style={inputStyle}
              type="email"
              placeholder="Tu correo"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              style={inputStyle}
              inputMode="numeric"
              placeholder="Contraseña de profesor (6 dígitos)"
              value={loginContrasena}
              onChange={(e) => setLoginContrasena(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
            />
            {errorLogin && <p style={{ color: "var(--wrong)", fontSize: 13, margin: 0 }}>{errorLogin}</p>}
            <button
              onClick={iniciarSesionProfesor}
              disabled={verificandoLogin}
              className="gm-cta"
              style={{
                minHeight: 44, borderRadius: 12, border: "none", background: "#4f8ef7", color: "#fff",
                fontWeight: 700, fontSize: 14, cursor: verificandoLogin ? "default" : "pointer",
                opacity: verificandoLogin ? 0.7 : 1, boxShadow: "0 4px 14px rgba(79, 142, 247, 0.3)",
              }}
            >
              {verificandoLogin ? "Verificando…" : "Entrar"}
            </button>
          </Seccion>
        )}

        {!cargandoAuth && user && esMaestro && desbloqueado && (
          <>
            <Seccion
              icono={<HiOutlineIdentification />}
              color="#4f8ef7"
              title="Tu cuenta para recibir pagos"
              subtitle="Esta CLABE es la que se publica en todas tus clases; cámbiala aquí si necesitas corregirla."
            >
              {!editandoCuenta ? (
                <>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", fontFamily: "monospace", margin: 0 }}>
                    {estadoProfesor?.numero_cuenta || "No configurada"}
                  </p>
                  <button
                    type="button"
                    onClick={iniciarEdicionCuenta}
                    style={{ minHeight: 44, borderRadius: 10, border: "1px solid #4f8ef7", background: "transparent", color: "#4f8ef7", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <HiOutlinePencilSquare /> {estadoProfesor?.numero_cuenta ? "Cambiar CLABE" : "Configurar CLABE"}
                  </button>
                </>
              ) : (
                <>
                  <input
                    style={inputStyle}
                    inputMode="numeric"
                    placeholder="CLABE (18 dígitos)"
                    value={nuevaCuenta}
                    onChange={(e) => setNuevaCuenta(e.target.value.replace(/\D/g, "").slice(0, 18))}
                    maxLength={18}
                  />
                  {errorCuenta && <p style={{ color: "var(--wrong)", fontSize: 13, margin: 0 }}>{errorCuenta}</p>}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={cancelarEdicionCuenta}
                      style={{ minHeight: 44, borderRadius: 10, border: "1px solid var(--surface2)", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={guardarCuenta}
                      disabled={guardandoCuenta}
                      className="gm-cta"
                      style={{
                        flex: 1, minHeight: 44, borderRadius: 12, border: "none", background: "#4f8ef7",
                        color: "#fff", fontWeight: 700, fontSize: 14, cursor: guardandoCuenta ? "default" : "pointer",
                        opacity: guardandoCuenta ? 0.7 : 1, boxShadow: "0 4px 14px rgba(79, 142, 247, 0.3)",
                      }}
                    >
                      {guardandoCuenta ? "Guardando…" : "Guardar"}
                    </button>
                  </div>
                </>
              )}
            </Seccion>

            <Seccion icono={<HiOutlineBanknotes />} color="#4f8ef7" title="Mis ganancias" subtitle="Cuánto te deben, cuánto ya te pagamos y tus recibos por quincena.">
              <button
                type="button"
                onClick={() => navigate("/tutorias/maestro/ganancias")}
                className="gm-cta"
                style={{
                  minHeight: 44, borderRadius: 12, border: "none", background: "#4f8ef7", color: "#fff",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(79, 142, 247, 0.3)",
                }}
              >
                Ver mis ganancias
              </button>
            </Seccion>

            <Seccion icono={<HiOutlineClipboardDocumentList />} color="#22c55e" title="Informes de alumnos" subtitle="Consulta el formulario de área y el examen simulador de un alumno por su correo.">
              <button
                type="button"
                onClick={() => navigate("/informe-resultados")}
                className="gm-cta"
                style={{
                  minHeight: 44, borderRadius: 12, border: "none", background: "#22c55e", color: "#fff",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(34, 197, 94, 0.3)",
                }}
              >
                Buscar por correo
              </button>
            </Seccion>

            <Seccion icono={<HiOutlineUserGroup />} color="#06b6d4" title="Alumnos inscritos" subtitle="Correo, nombre y teléfono de quienes ya compraron un cupo en tus ofertas.">
              <button
                type="button"
                onClick={() => navigate("/tutorias/maestro/alumnos")}
                className="gm-cta"
                style={{
                  minHeight: 44, borderRadius: 12, border: "none", background: "#06b6d4", color: "#fff",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(6, 182, 212, 0.3)",
                }}
              >
                Ver alumnos inscritos
              </button>
            </Seccion>

            {error && <p style={{ color: "var(--wrong)", fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>}

            <Seccion
              icono={<HiOutlineChatBubbleLeftRight />}
              color="#06b6d4"
              title={editandoId ? "Editando oferta" : "Publicar una clase"}
              subtitle="Los alumnos la ven en su portal; el grupo de WhatsApp y el pago se coordinan directamente contigo."
              style={
                editandoId
                  ? { border: "1.5px solid #06b6d4", boxShadow: "0 0 0 4px rgba(6,182,212,0.18)" }
                  : undefined
              }
            >
              <div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Se publica con tus datos registrados</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", background: "var(--surface2)", cursor: "not-allowed" }}>
                    <HiOutlineLockClosed style={{ flexShrink: 0, fontSize: 14, opacity: 0.7 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {estadoProfesor?.nombre || "—"}
                    </span>
                  </div>
                  <div style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", background: "var(--surface2)", cursor: "not-allowed", fontFamily: "monospace" }}>
                    <HiOutlineLockClosed style={{ flexShrink: 0, fontSize: 14, opacity: 0.7 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {estadoProfesor?.numero_cuenta || "Configura tu CLABE arriba"}
                    </span>
                  </div>
                </div>
              </div>

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
                  color="#06b6d4"
                />
                {materiaId === MATERIA_OTROS.id && (
                  <input
                    style={{ ...inputStyle, marginTop: 10 }}
                    placeholder="¿Qué materia? (ej. Robótica, Contabilidad…)"
                    value={materiaOtro}
                    onChange={(e) => setMateriaOtro(e.target.value.slice(0, 60))}
                    maxLength={60}
                  />
                )}
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
                  className="gm-cta"
                  style={{
                    flex: 1, minHeight: 44, borderRadius: 12, border: "none", background: "#4f8ef7", color: "#fff",
                    fontWeight: 700, fontSize: 14, cursor: publicando ? "default" : "pointer",
                    opacity: publicando ? 0.7 : 1, boxShadow: "0 4px 14px rgba(79, 142, 247, 0.3)",
                  }}
                >
                  {publicando ? "Guardando…" : editandoId ? "Guardar cambios" : "Publicar disponibilidad"}
                </button>
              </div>
            </Seccion>

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
                  const color = materia?.color ?? MATERIA_OTROS.color;
                  const nombreMateria = nombreMateriaOferta(oferta.materia_id, oferta.materia_otro);
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
                          {nombreMateria[0] ?? "?"}
                        </div>
                        <div className="sp-card-body">
                          <p className="sp-card-title">
                            {nombreMateria} · {oferta.duracion_minutos} min
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
          </>
        )}
      </main>
    </div>
  );
}
