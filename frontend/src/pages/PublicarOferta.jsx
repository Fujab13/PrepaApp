// PublicarOferta.jsx
// Portal de maestros para publicar ofertas simples (ver componente
// PublicacionOfertas / tabla ofertas_maestro). Sin gate de contraseña
// todavía — cualquier usuario logueado puede publicar; useAuth ya exige
// sesión iniciada.

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PublicacionOfertas } from "../components/PublicacionOfertas";
import { AiOutlineClose } from "react-icons/ai";
import { PiChalkboardTeacher } from "react-icons/pi";

export default function PublicarOferta() {
  const navigate = useNavigate();
  const { user, cargando } = useAuth();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header
        className="page-topbar-compact"
        style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}
      >
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <span className="page-topbar-btn" style={{ fontSize: "1.35rem" }}>
          <PiChalkboardTeacher />
        </span>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Publicar oferta</h2>
      </header>

      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 60 }}>
        {cargando && <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>Cargando…</p>}

        {!cargando && !user && (
          <div className="sp-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 12 }}>
              Necesitas iniciar sesión para publicar ofertas.
            </p>
            <button
              onClick={() => navigate("/login?modo=login")}
              style={{
                minHeight: 44,
                padding: "0 20px",
                borderRadius: 10,
                border: "none",
                background: "#06b6d4",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {!cargando && user && <PublicacionOfertas permitirPublicar />}
      </main>
    </div>
  );
}
