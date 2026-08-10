// TutoriaConfirmada.jsx
// Destino del `success_url` de Stripe tras pagar una tutoría. El webhook de
// Stripe confirma el pago de forma asíncrona (puede tardar unos segundos en
// llegar), así que esta página hace polling hasta ver el cambio de estado —
// a diferencia de StoreContext.jsx (que espera un regreso de pestaña), aquí
// Stripe redirige la MISMA pestaña, así que un listener de visibilitychange
// solo nunca se dispararía.

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

import { AiOutlineClose } from "react-icons/ai";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const INTERVALO_MS = 3000;
const MAX_INTENTOS = 40; // ~2 minutos

export default function TutoriaConfirmada() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const solicitudId = searchParams.get("solicitud");

  const [solicitud, setSolicitud] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const intentosRef = useRef(0);

  async function consultar() {
    if (!solicitudId) return;
    const { data, error } = await supabase
      .from("solicitudes_tutoria")
      .select("*")
      .eq("id", solicitudId)
      .single();

    if (error || !data) {
      setErrorCarga("No encontramos esa solicitud.");
      setCargando(false);
      return;
    }

    setSolicitud(data);
    setCargando(false);
  }

  useEffect(() => {
    consultar();
  }, [solicitudId]);

  useEffect(() => {
    if (!solicitud || solicitud.estado !== "pendiente_pago") return;

    const id = setInterval(() => {
      intentosRef.current += 1;
      if (intentosRef.current > MAX_INTENTOS) {
        clearInterval(id);
        return;
      }
      consultar();
    }, INTERVALO_MS);

    const alVolverAVer = () => {
      if (document.visibilityState === "visible") consultar();
    };
    document.addEventListener("visibilitychange", alVolverAVer);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", alVolverAVer);
    };
  }, [solicitud?.estado]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="page-topbar-compact" style={{ paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Tu tutoría</h2>
      </header>

      <main className="page-content-compact" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {cargando && (
          <AiOutlineLoading3Quarters className="spin" style={{ fontSize: "1.8rem", color: "#7c5cbf" }} />
        )}

        {!cargando && errorCarga && (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--wrong)", fontSize: 14, marginBottom: 16 }}>{errorCarga}</p>
            <button
              onClick={() => navigate("/tutorias/alumno")}
              style={{ minHeight: 44, padding: "0 20px", borderRadius: 10, border: "none", background: "#7c5cbf", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Volver a tutorías
            </button>
          </div>
        )}

        {!cargando && !errorCarga && solicitud && (
          <div className="sp-card" style={{ width: "100%", textAlign: "center" }}>
            {solicitud.estado === "pendiente_pago" && (
              <>
                <AiOutlineLoading3Quarters className="spin" style={{ fontSize: "1.6rem", color: "#7c5cbf", marginBottom: 12 }} />
                <p style={{ fontSize: 14, color: "var(--text)" }}>Confirmando tu pago…</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Esto puede tardar unos segundos.</p>
              </>
            )}

            {solicitud.estado === "confirmada" && (
              <>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--correct)", marginBottom: 8 }}>
                  ¡Tu tutoría quedó confirmada!
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                  {new Date(solicitud.fecha_hora_solicitada).toLocaleString("es-MX", { dateStyle: "full", timeStyle: "short" })}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                  Duración: {solicitud.duracion_minutos} min · ${Number(solicitud.precio_total_mxn).toFixed(2)} MXN
                </p>
                {solicitud.meeting_url && (
                  <a
                    href={solicitud.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", minHeight: 44, lineHeight: "44px", padding: "0 20px", borderRadius: 10, background: "#7c5cbf", color: "#fff", fontWeight: 700, textDecoration: "none" }}
                  >
                    Ver liga de tu clase
                  </a>
                )}
                <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 16 }}>
                  Revisa tu correo: te mandamos la confirmación con todos los detalles.
                </p>
              </>
            )}

            {solicitud.estado === "cancelada" && (
              <p style={{ fontSize: 14, color: "var(--wrong)" }}>
                Esta solicitud fue cancelada. Si ya pagaste, contáctanos directamente.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
