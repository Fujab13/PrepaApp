// Respaldo temporal — retirado de src/pages/Store.jsx (punto 1.4 del acuerdo
// con Lobosimuladores: ocultar el mensaje de "pagos protegidos por Stripe").
//
// Para restaurar:
// 1. Volver a agregar `import { FaStripe } from "react-icons/fa";` junto a
//    los demás imports de react-icons en Store.jsx.
// 2. Reemplazar el comentario
//    `{/* Mensaje de "pagos protegidos por Stripe" oculto temporalmente ... */}`
//    (justo antes del cierre del contenedor principal, después del bloque de
//    categorías) por el JSX de abajo.

<p style={{
  color: 'var(--text-muted)',
  fontSize: '0.7rem',
  marginTop: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px'
}}>
  <span>Tus pagos están protegidos y procesados por</span>
  <a href="https://stripe.com"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      color: 'inherit',
      textDecoration: 'none',
      cursor: 'pointer'
    }}
  >
    <FaStripe size="3.1em" />
  </a>
</p>
