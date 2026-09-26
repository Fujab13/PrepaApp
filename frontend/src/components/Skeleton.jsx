// Skeleton.jsx
// Piezas base de las pantallas de carga tipo "skeleton": en vez de un
// spinner, se dibuja una silueta sombreada de lo que va a aparecer. Estilos
// y animación viven en global.css (.skeleton*), así que cada pieza es solo
// un elemento con clase — barato aunque haya muchos en pantalla.
//
// - <Skeleton>: un bloque (línea, círculo, rectángulo).
// - <SkeletonTexto>: un párrafo de N líneas, la última más corta.
// - <SkeletonPantalla>: envuelve la silueta de una pantalla/sección: la
//   anuncia como "Cargando…" a lectores de pantalla, oculta los bloques
//   decorativos y los hace aparecer con un pequeño retraso.
// - Clase .skeleton-tarjeta (CSS): contenedor con fondo y borde de tarjeta
//   real para siluetas de opciones/filas/tarjetas.
//
// Para una página nueva: crea su silueta en components/skeletons/ con estas
// piezas, imitando el layout real (mismos paddings y clases de página), y
// úsala en su estado de carga y en el fallback de <Suspense> de su ruta en
// App.jsx. Si solo una sección carga, exporta también la silueta de esa
// sección (ver RankingSkeleton.jsx).

// `sutil`: para bloques encima de una tarjeta (fondo --surface2 o
// degradado), donde el tono base se perdería.
export function Skeleton({ width = '100%', height = 14, radius, circle = false, sutil = false, style }) {
  return (
    <span
      className={sutil ? 'skeleton skeleton-sutil' : 'skeleton'}
      style={{
        width: circle ? height : width,
        height,
        borderRadius: circle ? '50%' : radius,
        ...style,
      }}
    />
  )
}

// Alto de línea ~= al del texto real (fontSize * lineHeight) menos el aire
// entre líneas, para que el párrafo ocupe lo mismo que el que reemplaza.
export function SkeletonTexto({ lineas = 3, alto = 12, separacion = 9, ultima = '55%', sutil = false, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: separacion, ...style }}>
      {Array.from({ length: lineas }, (_, i) => (
        <Skeleton
          key={i}
          height={alto}
          width={i === lineas - 1 && lineas > 1 ? ultima : '100%'}
          sutil={sutil}
        />
      ))}
    </div>
  )
}

// Barra superior estándar de página (.page-topbar-compact): botón de salir
// sombreado + el título REAL (es texto fijo, no depende de datos) +
// opcionalmente algo a la derecha (ej. saldo de monedas). `tituloStyle`
// por si la página real le cambia el tamaño al título.
export function SkeletonBarra({ titulo, tituloStyle, derecha, style }) {
  return (
    <div className="page-topbar-compact" style={style}>
      <Skeleton circle height={36} />
      {titulo && <h2 className="page-topbar-title" style={{ fontSize: '1rem', ...tituloStyle }}>{titulo}</h2>}
      {derecha && <div style={{ marginLeft: 'auto', display: 'flex' }}>{derecha}</div>}
    </div>
  )
}

export function SkeletonPantalla({ etiqueta = 'Cargando…', children, style }) {
  return (
    <div role="status" aria-busy="true" className="skeleton-pantalla" style={style}>
      <span className="solo-lector">{etiqueta}</span>
      <div aria-hidden="true" style={{ display: 'contents' }}>
        {children}
      </div>
    </div>
  )
}
