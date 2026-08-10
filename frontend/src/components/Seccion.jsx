// Seccion.jsx
// Wrapper de tarjeta con icono+título+subtítulo usado por las páginas de
// Tutorías (alumno y maestro comparten exactamente el mismo look).

export function Seccion({ icono, color, title, subtitle, children }) {
  return (
    <div className="sp-card">
      <div className="sp-card-header">
        <div className="sp-card-icon" style={{ background: `${color}22`, color }}>
          {icono}
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
