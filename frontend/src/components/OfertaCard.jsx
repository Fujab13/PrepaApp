// OfertaCard.jsx
// Tarjeta resumida de una oferta del marketplace de tutorías (ver
// TutoriasAlumno.jsx / TutoriasMaestro.jsx). Se expande in-place para
// mostrar notas completas y el botón de acción: "Aceptar" si es de la otra
// parte, "Cancelar" si es propia y sigue abierta.

import { useState } from "react";
import { MATERIAS_TUTORIA } from "../data/materiasTutoria";
import { Estrellas } from "./Estrellas";

const ESTADO_ETIQUETA = {
  abierta: null,
  aceptada: { texto: "Aceptada", color: "#4f8ef7" },
  cancelada: { texto: "Cancelada", color: "var(--text-muted)" },
};

export function OfertaCard({ oferta, esPropia, cargando, onAceptar, onCancelar }) {
  const [abierta, setAbierta] = useState(false);
  const materia = MATERIAS_TUTORIA.find((m) => m.id === oferta.materia_id);
  const color = materia?.color ?? "#7c5cbf";
  const fecha = new Date(oferta.fecha_hora);
  const estadoInfo = ESTADO_ETIQUETA[oferta.estado];

  return (
    <div className="sp-card" style={{ cursor: "pointer", margin: 0 }} onClick={() => setAbierta((v) => !v)}>
      <div className="sp-card-header">
        <div className="sp-card-icon" style={{ background: `${color}22`, color }}>
          {materia?.nombre?.[0] ?? "?"}
        </div>
        <div className="sp-card-body">
          <p className="sp-card-title">
            {materia?.nombre ?? oferta.materia_id} · {oferta.duracion_minutos} min
          </p>
          <p className="sp-card-description">
            {fecha.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>
              {oferta.autor?.nombre || "Usuario"}
            </span>
            <Estrellas
              value={Number(oferta.autor?.calificacion_promedio) || 0}
              count={oferta.autor?.numero_calificaciones ?? 0}
              size={11}
            />
            {estadoInfo && (
              <span style={{ fontSize: 11, fontWeight: 700, color: estadoInfo.color }}>{estadoInfo.texto}</span>
            )}
          </div>
        </div>
        <p style={{ fontSize: 17, fontWeight: 800, color, margin: 0, whiteSpace: "nowrap" }}>
          ${Number(oferta.precio_mxn).toFixed(0)}
        </p>
      </div>

      {abierta && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }} onClick={(e) => e.stopPropagation()}>
          {oferta.notas && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{oferta.notas}</p>
          )}

          {esPropia && oferta.estado === "abierta" && onCancelar && (
            <button
              type="button"
              disabled={cargando}
              onClick={() => onCancelar(oferta)}
              style={{
                minHeight: 40,
                borderRadius: 10,
                border: "1px solid var(--wrong)",
                background: "transparent",
                color: "var(--wrong)",
                fontWeight: 700,
                fontSize: 13,
                cursor: cargando ? "default" : "pointer",
                opacity: cargando ? 0.6 : 1,
              }}
            >
              Cancelar oferta
            </button>
          )}

          {!esPropia && oferta.estado === "abierta" && onAceptar && (
            <button
              type="button"
              disabled={cargando}
              onClick={() => onAceptar(oferta)}
              style={{
                minHeight: 40,
                borderRadius: 10,
                border: "none",
                background: color,
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: cargando ? "default" : "pointer",
                opacity: cargando ? 0.6 : 1,
              }}
            >
              {cargando ? "Aceptando…" : "Aceptar"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
