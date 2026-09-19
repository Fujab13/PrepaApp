// Seccion.jsx
// Wrapper de tarjeta con icono+título+subtítulo usado por las páginas de
// Tutorías (alumno y maestro comparten exactamente el mismo look).

export function Seccion({ icono, color, title, subtitle, children, style, badge }) {
  return (
    <div className="sp-card" style={style}>
      <div className="sp-card-header">
        <div className="sp-card-icon" style={{ background: `${color}22`, color, position: "relative" }}>
          {icono}
          {badge > 0 && (
            <span
              style={{
                position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, padding: "0 4px",
                borderRadius: 999, background: "var(--wrong)", color: "#fff", fontSize: 11, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                boxShadow: "0 0 0 2px var(--surface)",
              }}
            >
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </div>
        <div className="sp-card-body">
          <p className="sp-card-title">{title}</p>
          {subtitle && <p className="sp-card-description">{subtitle}</p>}
        </div>
      </div>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}
