// OfertaConfirmada.jsx
// Destino del `success_url` de Stripe tras pagar un asiento de ofertas_maestro
// (ver supabase/functions/crear-sesion-pago-oferta-maestro). El webhook
// confirma el pago de forma asíncrona (procesar_pago_completado puede tardar
// unos segundos en llegar) — mismo patrón que TutoriaConfirmada.jsx, pero
// contra `transacciones` (buscada por stripe_intent_id=session_id) en vez de
// `solicitudes_tutoria`.
//
// A diferencia de TutoriaConfirmada.jsx, cada intento de polling AQUÍ
// también llama a `verificar-pago-oferta-maestro` antes de releer la fila:
// esa función le pregunta a Stripe directamente si la sesión ya se pagó y,
// si es así, confirma ella misma en vez de esperar al webhook. Sin esto, un
// webhook que llega tarde, falla su verificación de firma (típico al
// probar en local si STRIPE_WEBHOOK_SIGNING_SECRET no coincide con el
// endpoint activo) o simplemente no se entrega, deja esta pantalla
// atascada en "Confirmando tu pago…" para siempre aunque Stripe sí haya
// cobrado. La llamada es segura de repetir: si el webhook ya confirmó,
// verificar-pago-oferta-maestro no hace nada.
//
// Estado "completado": se muestra como un comprobante/factura formal
// (folio, alumno, detalle de la clase, referencia de pago, total) en vez de
// solo un mensaje de éxito, para que el alumno tenga algo presentable que
// capturar o guardar. "Descargar PDF" reusa el mismo patrón de
// Informe.jsx (`window.print()` + la clase `.informe-print` de
// global.css, que re-tematiza a colores claros solo al imprimir): todo
// navegador — móvil incluido — ofrece "Guardar como PDF" como destino de
// impresión, así que no hace falta ninguna librería de PDF en el cliente.

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { MATERIAS_TUTORIA } from "../data/materiasTutoria";

import { AiOutlineClose, AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiOutlinePrinter, HiCheckCircle } from "react-icons/hi2";

const INTERVALO_MS = 3000;
const MAX_INTENTOS = 40; // ~2 minutos

function FilaDato({ label, valor, mono = false }) {
  if (!valor) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: "0.5px solid var(--surface)" }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          color: "var(--text)",
          fontWeight: 600,
          textAlign: "right",
          fontFamily: mono ? "monospace" : "inherit",
          wordBreak: "break-all",
        }}
      >
        {valor}
      </span>
    </div>
  );
}

function Recibo({ transaccion, oferta, materia, user, perfil }) {
  const folio = transaccion.id.slice(0, 8).toUpperCase();
  const fechaConfirmacion = new Date(transaccion.actualizado_en).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="sp-card" style={{ width: "100%", padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "26px 20px 18px", textAlign: "center", borderBottom: "1px dashed var(--surface)" }}>
        <HiCheckCircle style={{ fontSize: "2.3rem", color: "var(--correct)", marginBottom: 8 }} />
        <p style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: 0 }}>Comprobante de reserva</p>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0", letterSpacing: 0.3 }}>
          PrepaApp · Tutorías 1-a-1
        </p>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--correct)", margin: "12px 0 0" }}>
          Folio #{folio}
        </p>
      </div>

      <div style={{ padding: "4px 20px 6px" }}>
        <FilaDato label="Estado" valor="Confirmado" />
        <FilaDato label="Fecha de confirmación" valor={fechaConfirmacion} />
        <FilaDato label="Alumno" valor={perfil?.nombre || user?.email} />
        {perfil?.nombre && <FilaDato label="Correo" valor={user?.email} />}
      </div>

      {oferta && (
        <div style={{ padding: "10px 20px 6px", borderTop: "1px dashed var(--surface)" }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, margin: "6px 0 8px" }}>
            Detalle de la clase
          </p>
          <FilaDato label="Materia" valor={materia?.nombre ?? oferta.materia_id} />
          <FilaDato label="Maestro" valor={oferta.profesor} />
          <FilaDato
            label="Fecha y hora"
            valor={new Date(oferta.fecha_hora).toLocaleString("es-MX", { dateStyle: "full", timeStyle: "short" })}
          />
          <FilaDato label="Duración" valor={`${oferta.duracion_minutos} minutos`} />
        </div>
      )}

      <div style={{ padding: "10px 20px 6px", borderTop: "1px dashed var(--surface)" }}>
        <FilaDato label="Método de pago" valor="Tarjeta · Stripe Checkout" />
        <FilaDato label="Referencia de pago" valor={transaccion.stripe_intent_id} mono />
      </div>

      <div style={{ padding: "16px 20px", background: "var(--surface2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Total pagado</span>
        <span style={{ fontSize: 21, fontWeight: 800, color: "var(--correct)" }}>
          ${Number(transaccion.monto_total).toFixed(2)} {transaccion.moneda}
        </span>
      </div>

      <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5, margin: 0, padding: "14px 20px" }}>
        Guarda este comprobante. El grupo de WhatsApp y cualquier detalle adicional de la clase se coordinan
        directamente con tu maestro.
      </p>
    </div>
  );
}

export default function OfertaConfirmada() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user, perfil } = useAuth();

  const [transaccion, setTransaccion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const intentosRef = useRef(0);

  async function consultar() {
    if (!sessionId) return;
    const { data, error } = await supabase
      .from("transacciones")
      .select("*, ofertas_maestro(*)")
      .eq("stripe_intent_id", sessionId)
      .single();

    if (error || !data) {
      setErrorCarga("No encontramos esa reserva.");
      setCargando(false);
      return;
    }

    setTransaccion(data);
    setCargando(false);
  }

  // Best-effort: si falla (sin conexión, sesión vencida, etc.) simplemente
  // no se auto-corrige en este intento, pero `consultar()` de todas formas
  // muestra lo que ya haya en la base — el webhook sigue siendo el camino
  // normal, esto solo es la red de seguridad.
  async function verificarConStripe() {
    if (!sessionId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verificar-pago-oferta-maestro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch (err) {
      console.error("No se pudo verificar el pago directamente con Stripe:", err);
    }
  }

  async function verificarYConsultar() {
    await verificarConStripe();
    await consultar();
  }

  useEffect(() => {
    verificarYConsultar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    if (!transaccion || transaccion.estado_pago !== "pendiente") return;

    const id = setInterval(() => {
      intentosRef.current += 1;
      if (intentosRef.current > MAX_INTENTOS) {
        clearInterval(id);
        return;
      }
      verificarYConsultar();
    }, INTERVALO_MS);

    const alVolverAVer = () => {
      if (document.visibilityState === "visible") verificarYConsultar();
    };
    document.addEventListener("visibilitychange", alVolverAVer);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", alVolverAVer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaccion?.estado_pago]);

  const oferta = transaccion?.ofertas_maestro;
  const materia = oferta ? MATERIAS_TUTORIA.find((m) => m.id === oferta.materia_id) : null;
  const confirmado = transaccion?.estado_pago === "completado";

  return (
    <div className="informe-print" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header className="page-topbar-compact no-print" style={{ paddingBottom: 14 }}>
        <button onClick={() => navigate("/ofertas")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem", flex: 1 }}>Tu reserva</h2>
        {confirmado && (
          <div className="page-topbar-actions">
            <button onClick={() => window.print()} title="Guardar / Imprimir PDF" className="util-btn" style={{ color: "#7c5cbf" }}>
              <HiOutlinePrinter />
            </button>
          </div>
        )}
      </header>

      <main className="page-content-compact" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {cargando && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AiOutlineLoading3Quarters className="spin" style={{ fontSize: "1.8rem", color: "#7c5cbf" }} />
          </div>
        )}

        {!cargando && errorCarga && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <p style={{ color: "var(--wrong)", fontSize: 14, marginBottom: 16 }}>{errorCarga}</p>
            <button
              onClick={() => navigate("/ofertas")}
              style={{ minHeight: 44, padding: "0 20px", borderRadius: 10, border: "none", background: "#7c5cbf", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Volver a ofertas
            </button>
          </div>
        )}

        {!cargando && !errorCarga && transaccion && transaccion.estado_pago === "pendiente" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <AiOutlineLoading3Quarters className="spin" style={{ fontSize: "1.6rem", color: "#7c5cbf", marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: "var(--text)" }}>Confirmando tu pago…</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Esto puede tardar unos segundos.</p>
          </div>
        )}

        {!cargando && !errorCarga && confirmado && (
          <>
            <Recibo transaccion={transaccion} oferta={oferta} materia={materia} user={user} perfil={perfil} />

            <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => navigate("/ofertas")}
                style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "0.5px solid var(--surface)", background: "var(--surface2)", color: "var(--text)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                Volver a ofertas
              </button>
              <button
                onClick={() => window.print()}
                style={{ flex: 1, minHeight: 44, borderRadius: 10, border: "none", background: "#7c5cbf", color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}
              >
                <HiOutlinePrinter /> Guardar / Imprimir PDF
              </button>
            </div>
          </>
        )}

        {!cargando && !errorCarga && transaccion && (transaccion.estado_pago === "cancelado" || transaccion.estado_pago === "expirado") && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--wrong)" }}>
              Esta reserva {transaccion.estado_pago === "expirado" ? "expiró" : "fue cancelada"} antes de poder
              confirmarse. Si ya pagaste, contáctanos directamente para reembolsarte.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
