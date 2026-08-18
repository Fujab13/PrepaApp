// AdminMaestros.jsx
// Registro de maestros (edge function `registrar-maestro`, migración
// 20260812140000): el admin da de alta nombre+correo, el sistema genera la
// contraseña (nunca la elige el maestro) y este queda vinculado en la tabla
// `maestros`, que es lo que le da acceso real a /tutorias/maestro (RLS de
// ofertas_maestro exige `soy_maestro_actual()`). También permite
// activar/desactivar acceso sin borrar su historial de ofertas/pagos.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registrarMaestro, listarMaestros, establecerMaestroActivo } from "../services/maestros";
import { inputStyle } from "../utils/tutorias";

import { AiOutlineClose } from "react-icons/ai";
import { HiOutlineUserPlus, HiOutlineClipboardDocument, HiCheckCircle } from "react-icons/hi2";

function fmtFecha(ts) {
  return ts ? new Date(ts).toLocaleDateString("es-MX", { dateStyle: "medium" }) : "—";
}

export default function AdminMaestros() {
  const navigate = useNavigate();
  const { user, cargando: cargandoAuth, esAdmin } = useAuth();

  const [maestros, setMaestros] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const [resultado, setResultado] = useState(null); // { email, password, correo_enviado }
  const [copiado, setCopiado] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const data = await listarMaestros();
      setMaestros(data);
    } catch {
      setError("No se pudo cargar la lista de maestros.");
    }
    setCargando(false);
  }

  useEffect(() => {
    if (!user || !esAdmin) return;
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, esAdmin]);

  async function registrar() {
    setError("");
    if (!nombre.trim() || !email.trim()) return setError("Escribe el nombre y el correo del maestro.");
    setRegistrando(true);
    setResultado(null);
    try {
      const data = await registrarMaestro(nombre.trim(), email.trim());
      setResultado(data);
      setNombre("");
      setEmail("");
      cargar();
    } catch (err) {
      setError(err.message || "No se pudo registrar al maestro.");
    }
    setRegistrando(false);
  }

  async function copiarPassword() {
    try {
      await navigator.clipboard.writeText(resultado.password);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Clipboard puede fallar sin HTTPS/permiso; la contraseña sigue visible en pantalla.
    }
  }

  async function alternarActivo(m) {
    setProcesandoId(m.user_id);
    try {
      await establecerMaestroActivo(m.user_id, !m.activo);
      await cargar();
    } catch {
      setError("No se pudo actualizar el acceso de ese maestro.");
    }
    setProcesandoId(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem", flex: 1 }}>Maestros</h2>
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

            <div className="sp-card" style={{ margin: 0 }}>
              <div className="sp-card-header">
                <div className="sp-card-icon" style={{ background: "rgba(234,179,8,0.15)", color: "#eab308" }}>
                  <HiOutlineUserPlus />
                </div>
                <div className="sp-card-body">
                  <p className="sp-card-title">Registrar maestro</p>
                  <p className="sp-card-description">Genera su contraseña de acceso al portal de maestros.</p>
                </div>
              </div>

              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <input style={inputStyle} placeholder="Nombre del maestro" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} />
                <input style={inputStyle} type="email" placeholder="Correo del maestro" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button
                  onClick={registrar}
                  disabled={registrando}
                  style={{ minHeight: 44, borderRadius: 10, border: "none", background: "#eab308", color: "#1a1a2e", fontWeight: 700, fontSize: 14, cursor: registrando ? "default" : "pointer", opacity: registrando ? 0.7 : 1 }}
                >
                  {registrando ? "Registrando…" : "Registrar y generar contraseña"}
                </button>

                {resultado && (
                  <div style={{ background: "var(--surface)", border: "1px solid #eab308", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                      Guarda esta contraseña — no se volverá a mostrar.
                      {resultado.correo_enviado ? " También se le envió por correo." : " No se pudo enviar por correo; compártela tú mismo."}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>{resultado.email}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#eab308", fontFamily: "monospace", flex: 1 }}>{resultado.password}</span>
                      <button
                        type="button"
                        onClick={copiarPassword}
                        style={{ minHeight: 36, padding: "0 10px", borderRadius: 8, border: "1px solid var(--surface2)", background: "transparent", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}
                      >
                        {copiado ? <HiCheckCircle /> : <HiOutlineClipboardDocument />} {copiado ? "Copiado" : "Copiar"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "4px 0 0" }}>Maestros registrados</p>

            {cargando && <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Cargando…</p>}
            {!cargando && (maestros?.length ?? 0) === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Todavía no has registrado a ningún maestro.</p>
            )}

            {maestros?.map((m) => (
              <div key={m.user_id} className="sp-card" style={{ margin: 0, display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
                <div className="sp-card-icon" style={{ background: "rgba(124,92,191,0.15)", color: "#7c5cbf" }}>
                  {m.nombre?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="sp-card-body">
                  <p className="sp-card-title">{m.nombre}</p>
                  <p className="sp-card-description">{m.email} · Desde {fmtFecha(m.creado_en)}</p>
                </div>
                <button
                  type="button"
                  disabled={procesandoId === m.user_id}
                  onClick={() => alternarActivo(m)}
                  style={{
                    minHeight: 36, padding: "0 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, flexShrink: 0,
                    border: m.activo ? "1px solid var(--wrong)" : "1px solid var(--correct)",
                    background: "transparent",
                    color: m.activo ? "var(--wrong)" : "var(--correct)",
                    cursor: procesandoId === m.user_id ? "default" : "pointer",
                    opacity: procesandoId === m.user_id ? 0.6 : 1,
                  }}
                >
                  {procesandoId === m.user_id ? "…" : m.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
