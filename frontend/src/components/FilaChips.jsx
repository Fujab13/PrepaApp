// FilaChips.jsx
// Selector tipo "chip" (elige una opción de una lista) usado originalmente
// solo dentro de FormularioArea.jsx; extraído aquí para reusarlo también en
// Tutorias.jsx sin duplicar el estilo.

export function chip(activo, color = "#7c5cbf") {
  return {
    minHeight: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: activo ? `1.5px solid ${color}` : "0.5px solid var(--surface)",
    background: activo ? `${color}1f` : "var(--surface)",
    color: activo ? color : "var(--text)",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  };
}

export function FilaChips({ opciones, valor, onChange, color }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {opciones.map((op) => (
        <button key={op} type="button" style={chip(valor === op, color)} onClick={() => onChange(op)}>
          {op}
        </button>
      ))}
    </div>
  );
}
