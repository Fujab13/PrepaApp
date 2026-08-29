-- Desarma el sistema viejo de alta de maestros (admin-driven, migración
-- 20260812140000_registro_maestros.sql), reemplazado desde
-- 20260826120000_registro_autoservicio_profesores.sql por el autoregistro
-- de `profesores` que usa hoy AdminMaestros.jsx. Esa migración ya dejaba
-- documentado que la tabla `maestros` y estas dos RPCs quedaban "SIN USO
-- pero intactas a propósito" — confirmado con el usuario que ya se puede
-- borrar. Sus filas (solo 2) ya se migraron a `profesores` en el backfill
-- de esa misma migración, así que no hay pérdida de información.
--
-- Deliberadamente NO se tocan `soy_maestro_actual()` ni
-- `obtener_mis_transacciones_oferta_maestro()`, aunque se crearon en la
-- misma migración original de `maestros`: la primera ya fue redefinida
-- sobre `profesores` (20260826120000) y sigue siendo el gate real de las
-- policies de `ofertas_maestro`; la segunda la sigue usando en vivo el
-- portal de ganancias del maestro (`MisGanancias.jsx`).

drop function if exists public.admin_listar_maestros();
drop function if exists public.admin_set_maestro_activo(uuid, boolean);
drop table if exists public.maestros;
