// AdminMaestros.jsx
// Verificación de profesores (RPCs `admin_listar_profesores` /
// `admin_set_profesor_verificado` / `admin_set_profesor_activo`, migración
// 20260826120000_registro_autoservicio_profesores): el profesor se registra
// solo desde /tutorias/maestro y manda su documentación por correo; aquí el
// admin revisa esos datos, activa `verificado` cuando todo cuadra y le
// reenvía a mano la contraseña de 6 dígitos que el sistema ya generó. Este
// panel reemplaza el alta manual que antes vivía aquí (tabla `maestros` +
// edge function `registrar-maestro`) — ambas se borraron en la migración
// 20260829130000_eliminar_sistema_maestros_viejo tras confirmar que ya no
// se usaban en ningún lado.
//
// "Acceder a esta cuenta" (edge function `admin-acceso-profesor`) genera un
// magic link real de Supabase Auth: el admin queda deslogueado de su propia
// cuenta y entra como el profesor, para poder hacer cambios rápidos sin
// pedirle su contraseña. Es un swap de sesión real, no una simulación —
// recuperar la cuenta de admin requiere volver a iniciar sesión a mano.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  listarProfesoresAdmin,
  establecerProfesorVerificado,
  establecerProfesorActivo,
  generarAccesoProfesor,
} from "../services/profesores";

import { AiOutlineClose } from "react-icons/ai";
import {
  HiOutlineUserPlus,
  HiOutlineClipboardDocument,
  HiCheckCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowRightOnRectangle,
  HiOutlineFlag,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";

function fmtFecha(ts) {
  return ts ? new Date(ts).toLocaleDateString("es-MX", { dateStyle: "medium" }) : "—";
}

export default function AdminMaestros() {
  const navigate = useNavigate();
  const { user, cargando: cargandoAuth, esAdmin } = useAuth();

  const [profesores, setProfesores] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  // CLABEs que cada profesor ha capturado al publicar sus ofertas: no existe
  // un "número de cuenta" fijo en el registro del profesor (ver `profesores`
  // en Supabase) — cada oferta publicada guarda la suya en
  // ofertas_maestro.cuenta_clave, así que se agrupan aquí por creado_por.
  const [clabesPorProfesor, setClabesPorProfesor] = useState({});

  const [accesoObjetivo, setAccesoObjetivo] = useState(null); // profesor a confirmar
  const [accediendo, setAccediendo] = useState(false);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const data = await listarProfesoresAdmin();
      setProfesores(data);
    } catch {
      setError("No se pudo cargar la lista de profesores.");
    }
    setCargando(false);

    const { data: ofertas } = await supabase.from("ofertas_maestro").select("creado_por, cuenta_clave");
    const agrupadas = {};
    for (const o of ofertas ?? []) {
      if (!o.cuenta_clave) continue;
      (agrupadas[o.creado_por] ??= new Set()).add(o.cuenta_clave);
    }
    setClabesPorProfesor(agrupadas);
  }

  useEffect(() => {
    if (!user || !esAdmin) return;
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, esAdmin]);

  async function alternarVerificado(p) {
    setProcesandoId(p.id);
    try {
      await establecerProfesorVerificado(p.id, !p.verificado);
      await cargar();
    } catch {
      setError("No se pudo actualizar la verificación de ese profesor.");
    }
    setProcesandoId(null);
  }

  async function alternarActivo(p) {
    setProcesandoId(p.id);
    try {
      await establecerProfesorActivo(p.id, !p.activo);
      await cargar();
    } catch {
      setError("No se pudo actualizar el acceso de ese profesor.");
    }
    setProcesandoId(null);
  }

  async function copiarPassword(p) {
    try {
      await navigator.clipboard.writeText(p["contraseña"]);
      setCopiadoId(p.id);
      setTimeout(() => setCopiadoId(null), 2000);
    } catch {
      // Clipboard puede fallar sin HTTPS/permiso; la contraseña sigue visible en pantalla.
    }
  }

  async function confirmarAcceso() {
    if (!accesoObjetivo) return;
    setAccediendo(true);
    try {
      const url = await generarAccesoProfesor(accesoObjetivo.email_cuenta);
      await supabase.auth.signOut();
      window.location.href = url;
    } catch (err) {
      setError(err.message || "No se pudo generar el acceso a esa cuenta.");
      setAccediendo(false);
      setAccesoObjetivo(null);
    }
  }

  function coincideBusqueda(p) {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      p.nombre?.toLowerCase().includes(q) ||
      p.email_cuenta?.toLowerCase().includes(q) ||
      p.curp?.toLowerCase().includes(q)
    );
  }

  const pendientes = profesores?.filter((p) => !p.verificado && coincideBusqueda(p)) ?? [];
  const verificados = profesores?.filter((p) => p.verificado && coincideBusqueda(p)) ?? [];

  function TarjetaProfesor({ p, esPendiente }) {
    const tieneReportes = p.total_reportes > 0;
    const colorBorde = tieneReportes ? "#ef4444" : esPendiente ? "#eab308" : "transparent";
    const clabes = [...(clabesPorProfesor[p.user_id] ?? [])];

    return (
      <div className="sp-card" style={{ margin: 0, border: `1.5px solid ${colorBorde}` }}>
        <div className="sp-card-header">
          <div
            className="sp-card-icon"
            style={{
              background: tieneReportes ? "rgba(239,68,68,0.15)" : esPendiente ? "rgba(234,179,8,0.15)" : "rgba(124,92,191,0.15)",
              color: tieneReportes ? "#ef4444" : esPendiente ? "#eab308" : "#7c5cbf",
              flexShrink: 0,
            }}
          >
            {esPendiente ? <HiOutlineUserPlus /> : (p.nombre?.[0]?.toUpperCase() ?? "?")}
          </div>
          <div className="sp-card-body" style={{ minWidth: 0 }}>
            <button
              type="button"
              onClick={() => navigate(`/perfil-profesor/${p.user_id}`)}
              className="sp-card-title"
              style={{
                wordBreak: "break-word", background: "transparent", border: "none", padding: 0, margin: 0,
                color: "var(--text)", textAlign: "left", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2,
              }}
            >
              {p.nombre}
            </button>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "2px 0 0", wordBreak: "break-word" }}>
              {p.email_cuenta}
            </p>
            <p className="sp-card-description" style={{ wordBreak: "break-word" }}>
              CURP: {p.curp || "—"} · Desde {fmtFecha(p.creado_en)}
            </p>
          </div>
        </div>

        {tieneReportes && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 800,
                color: "#fff", background: "#ef4444", borderRadius: 999, padding: "4px 10px",
              }}
            >
              <HiOutlineFlag />
              {p.reportes_pendientes > 0
                ? `${p.reportes_pendientes} reporte${p.reportes_pendientes === 1 ? "" : "s"} sin revisar`
                : `${p.total_reportes} reporte${p.total_reportes === 1 ? "" : "s"}`}
            </span>
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, wordBreak: "break-word" }}>
          <p style={{ margin: 0 }}>Contacto: {p.email_contacto || "—"} {p.telefono_contacto ? `· ${p.telefono_contacto}` : ""}</p>
          <p style={{ margin: 0 }}>Materias: {(p.materias || []).join(", ") || "—"}</p>
        </div>

        {/* CLABE del registro (profesores.numero_cuenta, migración
            20260904130000): desde esa migración es la que se publica en
            TODAS sus ofertas nuevas — ya no se captura a mano por oferta. */}
        <div style={{ marginTop: 10, background: "var(--surface)", border: "1px solid var(--surface2)", borderRadius: 10, padding: 10 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px" }}>CLABE de su registro</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "monospace", margin: 0 }}>
            {p.numero_cuenta || "No configurada"}
          </p>
        </div>

        {/* Legado de antes de esa migración: ofertas publicadas con una
            CLABE distinta a la del registro (typo, cambio de cuenta, o
            profesores verificados antes de que existiera numero_cuenta). */}
        {clabes.length > 0 && !(clabes.length === 1 && clabes[0] === p.numero_cuenta) && (
          <div style={{ marginTop: 10, background: "var(--surface)", border: "1px solid var(--surface2)", borderRadius: 10, padding: 10 }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px" }}>
              CLABE{clabes.length > 1 ? "s" : ""} usada{clabes.length > 1 ? "s" : ""} en sus ofertas (histórico)
            </p>
            {clabes.map((clabe) => (
              <p key={clabe} style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "monospace", margin: 0 }}>
                {clabe}
              </p>
            ))}
          </div>
        )}

        <div style={{ marginTop: 10, background: "var(--surface)", border: "1px solid var(--surface2)", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", flex: 1, minWidth: 120 }}>Contraseña de profesor:</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#eab308", fontFamily: "monospace" }}>{p["contraseña"] || "—"}</span>
          {p["contraseña"] && (
            <button
              type="button"
              onClick={() => copiarPassword(p)}
              style={{ minHeight: 36, padding: "0 10px", borderRadius: 8, border: "1px solid var(--surface2)", background: "transparent", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}
            >
              {copiadoId === p.id ? <HiCheckCircle /> : <HiOutlineClipboardDocument />} {copiadoId === p.id ? "Copiado" : "Copiar"}
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {esPendiente ? (
            <button
              type="button"
              disabled={procesandoId === p.id}
              onClick={() => alternarVerificado(p)}
              style={{
                flex: "1 1 160px", minHeight: 44, borderRadius: 10, fontSize: 13, fontWeight: 700,
                border: "1px solid var(--correct)", background: "transparent", color: "var(--correct)",
                cursor: procesandoId === p.id ? "default" : "pointer", opacity: procesandoId === p.id ? 0.6 : 1,
              }}
            >
              {procesandoId === p.id ? "…" : "Marcar como verificado"}
            </button>
          ) : (
            <button
              type="button"
              disabled={procesandoId === p.id}
              onClick={() => alternarActivo(p)}
              style={{
                flex: "1 1 160px", minHeight: 44, borderRadius: 10, fontSize: 13, fontWeight: 700,
                border: p.activo ? "1px solid var(--wrong)" : "1px solid var(--correct)",
                background: "transparent",
                color: p.activo ? "var(--wrong)" : "var(--correct)",
                cursor: procesandoId === p.id ? "default" : "pointer", opacity: procesandoId === p.id ? 0.6 : 1,
              }}
            >
              {procesandoId === p.id ? "…" : p.activo ? "Desactivar" : "Activar"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setAccesoObjetivo(p)}
            style={{
              flex: "1 1 160px", minHeight: 44, borderRadius: 10, fontSize: 13, fontWeight: 700,
              border: "1px solid #4f8ef7", background: "transparent", color: "#4f8ef7", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <HiOutlineArrowRightOnRectangle /> Acceder a esta cuenta
          </button>

          {/* Sigue funcionando aunque este profesor esté desactivado: a
              diferencia de "Acceder a esta cuenta" (que entra como él),
              esto va al panel de admin sobre TODAS las ofertas
              (admin_update_todas/admin_delete_todas en Supabase), no
              depende de que su propio portal de maestro esté disponible. */}
          <button
            type="button"
            onClick={() => navigate(`/admin/ofertas?buscar=${encodeURIComponent(p.nombre || "")}`)}
            style={{
              flex: "1 1 160px", minHeight: 44, borderRadius: 10, fontSize: 13, fontWeight: 700,
              border: "1px solid #eab308", background: "transparent", color: "#eab308", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <HiOutlineClipboardDocumentList /> Ver sus ofertas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem", flex: 1 }}>Profesores</h2>
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
                placeholder="Buscar por correo, nombre o CURP…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {cargando && <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Cargando…</p>}

            {!cargando && (
              <>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                  Pendientes de verificar ({pendientes.length})
                </p>

                {pendientes.length === 0 && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                    {busqueda.trim() ? "Ningún pendiente coincide con tu búsqueda." : "No hay registros pendientes."}
                  </p>
                )}

                {pendientes.map((p) => (
                  <TarjetaProfesor key={p.id} p={p} esPendiente />
                ))}

                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "8px 0 0" }}>
                  Verificados ({verificados.length})
                </p>

                {verificados.length === 0 && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                    {busqueda.trim() ? "Ningún verificado coincide con tu búsqueda." : "Todavía no hay profesores verificados."}
                  </p>
                )}

                {verificados.map((p) => (
                  <TarjetaProfesor key={p.id} p={p} esPendiente={false} />
                ))}
              </>
            )}
          </>
        )}
      </main>

      <ConfirmDialog
        abierto={Boolean(accesoObjetivo)}
        titulo="¿Entrar a esta cuenta?"
        mensaje={
          accesoObjetivo
            ? `Vas a iniciar sesión como ${accesoObjetivo.nombre} (${accesoObjetivo.email_cuenta}). Se cerrará tu sesión de administrador y tendrás que volver a iniciar sesión para recuperarla.`
            : ""
        }
        textoConfirmar={accediendo ? "Entrando…" : "Sí, entrar"}
        colorConfirmar="#4f8ef7"
        onConfirmar={confirmarAcceso}
        onCancelar={() => { if (!accediendo) setAccesoObjetivo(null); }}
      />
    </div>
  );
}
