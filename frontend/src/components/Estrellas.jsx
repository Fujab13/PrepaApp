// Estrellas.jsx
// Modo solo-lectura (value/count, para tarjetas de oferta y encabezados) y
// modo interactivo (onChange, para el flujo de calificar una clase ya
// terminada). Es el mismo componente en los dos casos para que ambos usos
// se vean idénticos visualmente.

import { AiFillStar, AiOutlineStar } from "react-icons/ai";

export function Estrellas({ value = 0, count, onChange, size = 14, color = "#f5b942" }) {
  const interactivo = typeof onChange === "function";
  const redondeado = Math.round(value);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      <span style={{ display: "inline-flex", gap: 1 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const Icono = n <= redondeado ? AiFillStar : AiOutlineStar;
          return interactivo ? (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-label={`${n} estrellas`}
              style={{
                border: "none",
                background: "transparent",
                padding: 4,
                minWidth: 32,
                minHeight: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color,
                fontSize: size * 1.6,
              }}
            >
              <Icono />
            </button>
          ) : (
            <Icono key={n} style={{ color, fontSize: size }} />
          );
        })}
      </span>
      {typeof count === "number" && (
        <span style={{ fontSize: size * 0.8, color: "var(--text-muted)" }}>
          {value > 0 ? value.toFixed(1) : "—"} ({count})
        </span>
      )}
    </span>
  );
}
