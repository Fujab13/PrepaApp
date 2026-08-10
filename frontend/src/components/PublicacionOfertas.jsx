// PublicacionOfertas.jsx
// Muestra y (opcionalmente) permite publicar ofertas de la tabla
// `ofertas_maestro` (ver supabase/migrations/20260809120000_ofertas_maestro.sql)
// — sistema simple, separado del marketplace bidireccional de
// ofertas_tutoria: aquí solo el maestro publica y el alumno solo consulta,
// sin flujo de pago dentro de la app (el maestro comparte su CLABE y
// coordina el resto por WhatsApp).
//
// `permitirPublicar`: sin esto, es de solo lectura (portal de alumnos).
// Con esto, muestra el formulario de publicación y el botón de borrar en
// las ofertas propias (portal de maestros). No hay gate de rol "maestro"
// todavía — cualquier usuario logueado puede publicar; la policy de RLS
// solo exige que el autor sea quien la borra.

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { FilaChips } from "./FilaChips";
import { Seccion } from "./Seccion";
import { MATERIAS_TUTORIA } from "../data/materiasTutoria";
import { HiOutlineCurrencyDollar, HiOutlineTrash, HiOutlineUserGroup } from "react-icons/hi2";

const DURACIONES_MIN = [60, 90, 120];
const PRECIO_MIN = 50;
const PRECIO_MAX = 5000;

const inputStyle = {
  width: "100%",
  minHeight: 44,
  background: "var(--surface2)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  padding: "12px 14px",
  color: "var(--text)",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
};

function mensajeError(err) {
  if (err?.code === "23514") {
    return "Revisa los datos: alguno no cumple el formato esperado (p. ej. la CLABE debe tener 18 dígitos).";
  }
  return "No se pudo procesar tu solicitud. Intenta de nuevo.";
}

export function PublicacionOfertas({ permitirPublicar = false }) {
  const { user, perfil } = useAuth();

  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [borrandoId, setBorrandoId] = useState(null);

  const [profesor, setProfesor] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [duracionMin, setDuracionMin] = useState(60);
  const [precio, setPrecio] = useState("");
  const [cupo, setCupo] = useState(1);
  const [notas, setNotas] = useState("");
  const [cuentaClave, setCuentaClave] = useState("");

  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (perfil?.nombre && !profesor) setProfesor(perfil.nombre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil?.nombre]);

  async function cargarOfertas() {
    setCargando(true);
    const { data } = await supabase
      .from("ofertas_maestro")
      .select("*")
      .gte("fecha_hora", new Date().toISOString())
      .order("fecha_hora", { ascending: true });
    setOfertas(data ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargarOfertas();
  }, []);

  async function publicar() {
    setError("");
    if (!profesor.trim()) return setError("Escribe tu nombre.");
    if (!materiaId) return setError("Selecciona una materia.");
    if (!fecha || !hora) return setError("Elige la fecha y la hora.");

    const fechaHora = new Date(`${fecha}T${hora}:00`);
    if (Number.isNaN(fechaHora.getTime()) || fechaHora.getTime() < Date.now()) {
      return setError("Elige una fecha y hora futuras.");
    }
    const precioNum = Number(precio);
    if (!precioNum || precioNum < PRECIO_MIN || precioNum > PRECIO_MAX) {
      return setError(`El precio debe estar entre $${PRECIO_MIN} y $${PRECIO_MAX} MXN.`);
    }
    const cupoNum = Number(cupo);
    if (!cupoNum || cupoNum < 1 || cupoNum > 50) return setError("El cupo debe ser entre 1 y 50 alumnos.");
    if (notas.length > 500) return setError("Tus notas son muy largas (máximo 500 caracteres).");
    if (!/^\d{18}$/.test(cuentaClave.trim())) return setError("La CLABE debe tener exactamente 18 dígitos.");

    setPublicando(true);
    const { error: insertError } = await supabase.from("ofertas_maestro").insert({
      profesor: profesor.trim(),
      materia_id: materiaId,
      fecha_hora: fechaHora.toISOString(),
      duracion_minutos: duracionMin,
      precio_mxn: precioNum,
      cupo_maximo: cupoNum,
      notas: notas.trim() || null,
      cuenta_clave: cuentaClave.trim(),
    });
    setPublicando(false);

    if (insertError) return setError(mensajeError(insertError));

    setMateriaId("");
    setFecha("");
    setHora("");
    setDuracionMin(60);
    setPrecio("");
    setCupo(1);
    setNotas("");
    setCuentaClave("");
    cargarOfertas();
  }

  async function borrar(oferta) {
    setBorrandoId(oferta.id);
    const { error: deleteError } = await supabase.from("ofertas_maestro").delete().eq("id", oferta.id);
    setBorrandoId(null);
    if (deleteError) return setError(mensajeError(deleteError));
    cargarOfertas();
  }

  const materiaElegida = MATERIAS_TUTORIA.find((m) => m.id === materiaId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && <p style={{ color: "var(--wrong)", fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>}

      {permitirPublicar && (
        <Seccion
          icono={<HiOutlineUserGroup />}
          color="#06b6d4"
          title="Publica una oferta"
          subtitle="Los alumnos la verán en su portal; coordina el resto por WhatsApp."
        >
          <input
            style={inputStyle}
            placeholder="Tu nombre"
            value={profesor}
            onChange={(e) => setProfesor(e.target.value)}
            maxLength={80}
          />

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
            <input style={inputStyle} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            <input style={inputStyle} type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </div>

          <div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Duración</p>
            <FilaChips
              opciones={DURACIONES_MIN.map((d) => `${d} min`)}
              valor={`${duracionMin} min`}
              onChange={(label) => setDuracionMin(Number(label.replace(" min", "")))}
              color="#06b6d4"
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              style={inputStyle}
              type="number"
              min={PRECIO_MIN}
              max={PRECIO_MAX}
              step={10}
              placeholder={`Precio ($${PRECIO_MIN}-$${PRECIO_MAX})`}
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
            <input
              style={inputStyle}
              type="number"
              min={1}
              max={50}
              placeholder="Cupo máx."
              value={cupo}
              onChange={(e) => setCupo(e.target.value)}
            />
          </div>

          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            maxLength={500}
            placeholder="Notas para tus alumnos (opcional)…"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />

          <input
            style={inputStyle}
            inputMode="numeric"
            placeholder="CLABE (18 dígitos) para recibir el pago"
            value={cuentaClave}
            onChange={(e) => setCuentaClave(e.target.value.replace(/\D/g, "").slice(0, 18))}
            maxLength={18}
          />

          <button
            onClick={publicar}
            disabled={publicando}
            style={{
              minHeight: 44,
              borderRadius: 10,
              border: "none",
              background: "#06b6d4",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: publicando ? "default" : "pointer",
              opacity: publicando ? 0.7 : 1,
            }}
          >
            {publicando ? "Publicando…" : "Publicar oferta"}
          </button>
        </Seccion>
      )}

      <Seccion
        icono={<HiOutlineCurrencyDollar />}
        color="#7c5cbf"
        title={permitirPublicar ? "Ofertas publicadas" : "Ofertas disponibles"}
      >
        {cargando && <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Cargando…</p>}
        {!cargando && ofertas.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Por ahora no hay ofertas disponibles.</p>
        )}
        {ofertas.map((oferta) => {
          const materia = MATERIAS_TUTORIA.find((m) => m.id === oferta.materia_id);
          const color = materia?.color ?? "#7c5cbf";
          const fechaObj = new Date(oferta.fecha_hora);
          const esPropia = permitirPublicar && user && oferta.creado_por === user.id;
          return (
            <div key={oferta.id} className="sp-card" style={{ margin: 0 }}>
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
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
                    {oferta.profesor} · Cupo: {oferta.cupo_maximo}
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

              {esPropia && (
                <button
                  type="button"
                  disabled={borrandoId === oferta.id}
                  onClick={() => borrar(oferta)}
                  style={{
                    marginTop: 10,
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
                  <HiOutlineTrash /> {borrandoId === oferta.id ? "Borrando…" : "Borrar oferta"}
                </button>
              )}
            </div>
          );
        })}
      </Seccion>
    </div>
  );
}
