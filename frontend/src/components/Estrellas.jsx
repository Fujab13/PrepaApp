// Estrellas.jsx
// Modo solo-lectura (value/count, para tarjetas de oferta y encabezados) y
// modo interactivo (onChange, para el flujo de calificar una clase ya
// terminada). Es el mismo componente en los dos casos para que ambos usos
// se vean idénticos visualmente. En modo interactivo, pasar el mouse
// previsualiza el número de estrellas antes de hacer clic (como Amazon/eBay).

import { useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

export function Estrellas({ value = 0, count, onChange, size = 14, color = "#f5b942", disabled = false }) {
  const interactivo = typeof onChange === "function" && !disabled;
  const [hover, setHover] = useState(0);
  const mostrado = interactivo && hover > 0 ? hover : value;
  const redondeado = Math.round(mostrado);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      <span
        style={{ display: "inline-flex", gap: 1 }}
        onMouseLeave={() => interactivo && setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const Icono = n <= redondeado ? AiFillStar : AiOutlineStar;
          return interactivo ? (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              aria-label={`${n} estrellas`}
              style={{
                border: "none",
                background: "transparent",
                padding: 4,
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color,
                fontSize: size * 1.6,
                transform: hover >= n ? "scale(1.18)" : "scale(1)",
                transition: "transform 120ms ease, color 120ms ease",
              }}
            >
              <Icono />
            </button>
          ) : (
            <Icono
              key={n}
              style={{
                color: disabled ? "var(--text-muted)" : color,
                fontSize: size,
                opacity: disabled ? 0.5 : 1,
              }}
            />
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
