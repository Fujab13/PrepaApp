# Desactivación temporal de pagos — alianza con Lobosimuladores

Contexto: autorización para apalancarse de Lobosimuladores para crecer
usuarios, con la condición de no canibalizar su plataforma. Mientras dure
el acuerdo, se ocultan (no se borran) los elementos que involucran dinero
real, para poder reactivarlos apagando el cambio, no reescribiéndolo.

## Cambios aplicados

1. **`src/pages/Tutorias.jsx`** — Tutorías NO se desactivó. Se ocultó
   solo el botón de acceso al portal de Alumnos (`/tutorias/alumno`, que
   es donde se reservan y pagan clases) y la guía rápida ("¿Cómo
   funcionan las Tutorías?"). El portal de Maestros sigue visible y
   funcional. Código retirado y cómo restaurarlo:
   [`Tutorias.guia-y-boton-alumnos.backup.jsx`](./Tutorias.guia-y-boton-alumnos.backup.jsx).

2. **`src/pages/Store.jsx`** — Los productos de pago con dinero real ya
   estaban desactivados desde antes (no se tocó nada de eso). Se ocultó
   además el mensaje "Tus pagos están protegidos y procesados por
   Stripe" al fondo de la Tienda. Código retirado y cómo restaurarlo:
   [`Store.mensaje-stripe.backup.jsx`](./Store.mensaje-stripe.backup.jsx).

## Para reactivar todo

Seguir las instrucciones de restauración dentro de cada archivo
`.backup.jsx` de esta carpeta y correr `npm run build` para confirmar que
no queda nada roto.

## Pendiente de decisión (no tocado)

Estas páginas también forman parte del flujo de pago de Tutorías
(reservar/publicar ofertas, cobros, comprobantes) pero no se modificaron
porque no estaban explícitamente pedidas y su portal de Maestros se debía
dejar funcionando:

- `src/pages/Ofertas.jsx`, `PublicarOferta.jsx`, `OfertaConfirmada.jsx`,
  `AlumnosOfertas.jsx`, `MisGanancias.jsx`, `PerfilProfesor.jsx`,
  `AdminPagos.jsx`, `Inventario.jsx`.
- Edge functions de Stripe en `supabase/functions/` (`crear-sesion-pago`,
  `crear-sesion-pago-oferta-maestro`, `stripe-webhook`,
  `verificar-pago-producto`, `verificar-pago-oferta-maestro`).

Si se quiere ocultar/ajustar algo más de esto, definir primero el
alcance antes de tocarlas.
