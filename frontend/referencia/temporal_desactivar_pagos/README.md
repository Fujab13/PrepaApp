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

## Apartado de tutorías inactivo por completo

Después se decidió apagar todo el apartado de tutorías (alumnos, maestros,
ofertas y su administración): la gestión de clases es compleja de llevar a
código y se deja para más adelante, y además así no se compite con los
cursos de Lobosimuladores. Nada se borró: lo que se oculta está comentado.

3. **`src/pages/Tutorias.jsx` → `src/pages/Ranking.jsx`** — la pantalla ya
   solo muestra el Ranking semanal, así que la ruta pasó de `/tutorias` a
   `/ranking` (`/tutorias` sigue existiendo como redirect a `/ranking`) y el
   archivo se renombró. La tarjeta de acceso a Maestros sigue dentro del
   archivo, oculta con `{false && ...}`; la guía y el botón de Alumnos
   siguen en el respaldo de esta carpeta (donde dice `Tutorias.jsx`, hoy es
   `Ranking.jsx`).

4. **`src/App.jsx`** — imports y `<Route>` comentados para
   `/tutorias/alumno`, `/tutorias/maestro`, `/tutorias/maestro/alumnos`,
   `/tutorias/maestro/ganancias`, `/perfil-profesor/:profesorId`,
   `/ofertas`, `/ofertas/publicar`, `/oferta-confirmada`, `/admin/pagos`,
   `/admin/maestros`, `/admin/reportes` y `/admin/ofertas`. Esas rutas
   están en `RUTAS_TUTORIAS_INACTIVAS` y redirigen al inicio (enlaces
   viejos, notificaciones push, regreso de Stripe, magic link de
   `admin-acceso-profesor`). Las páginas siguen en `src/pages/`.

5. **`src/components/Sidenav.jsx`** — sección "Administración" comentada
   (Pagos a profesores, Profesores, Ofertas, Reportes): las cuatro llevan a
   páginas del apartado de tutorías.

6. **`src/pages/InformeResultados.jsx`** — el modo maestro (entrar sin
   state de navegación para buscar informes de alumnos por correo) quedó
   comentado y redirige al inicio. El informe propio del alumno, después
   del formulario de área o del examen, sigue igual.

No se tocaron (son backend/producción y no se pueden alcanzar desde la app
mientras las rutas estén apagadas): las edge functions de
`supabase/functions/`, las migraciones y las tablas/RPCs de tutorías.
Tampoco el texto legal de `src/data/avisoPrivacidad.js`, que todavía
menciona a los maestros.

Para reactivar el apartado: quitar las rutas de `RUTAS_TUTORIAS_INACTIVAS`
y descomentar sus imports y `<Route>` en `App.jsx`, descomentar la sección
de Administración en `Sidenav.jsx` y la línea de `PaginaMaestro` en
`InformeResultados.jsx`, y cambiar `{false && ...}` en `Ranking.jsx`.

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
