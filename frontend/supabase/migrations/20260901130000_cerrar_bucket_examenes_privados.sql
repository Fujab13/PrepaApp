-- Cierra el hueco de seguridad del bucket viejo "Examenes privados": tenía
-- una política ("Usuarios autenticados pueden ver examenes") que dejaba leer
-- CUALQUIER archivo del bucket a CUALQUIER usuario autenticado, sin checar
-- si lo había comprado — bastaba con tener sesión iniciada y saber (o
-- adivinar) el nombre del archivo. El reemplazo correcto ya está en
-- producción: el bucket "Examenes comprados" + examenesPremium.js, que sí
-- valida el inventario antes de firmar una URL.
--
-- Esta migración no borra el bucket ni los archivos (por si algo más
-- dependiera de ellos, o quieras conservarlos como respaldo) — solo revoca
-- el acceso de lectura abierto:
--
--   1. Busca y elimina cualquier policy de storage.objects que mencione el
--      bucket 'Examenes privados' en su condición (no depende de adivinar
--      el nombre exacto de la policy).
--   2. Se asegura de que el bucket en sí no esté marcado como público
--      (si lo estuviera, cualquiera con la URL —ni siquiera con sesión—
--      podría leerlo, sin importar las policies de storage.objects).
--
-- VERIFICACIÓN RECOMENDADA ANTES DE APLICAR — corre esto y confirma que la
-- policy listada es la que esperas cerrar (bucket_id = 'Examenes privados',
-- no 'Examenes comprados'):
--   select policyname, cmd, roles, qual
--   from pg_policies
--   where schemaname = 'storage' and tablename = 'objects';

do $$
declare
  v_policy record;
begin
  for v_policy in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and qual ilike '%Examenes privados%'
  loop
    execute format('drop policy %I on storage.objects', v_policy.policyname);
    raise notice 'Policy eliminada: %', v_policy.policyname;
  end loop;
end $$;

update storage.buckets
set public = false
where name = 'Examenes privados';
