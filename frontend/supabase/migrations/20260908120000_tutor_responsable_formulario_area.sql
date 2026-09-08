-- Agrega el bloque "Tutor o responsable" al formulario de área
-- (FormularioArea.jsx): nombre y teléfono de contacto de un padre, madre o
-- tutor. Ambos campos son opcionales, igual que edad/teléfono del alumno, y
-- viajan tal cual dentro de la fila existente de formularios_area — no
-- necesitan policy ni índice nuevos porque select_propio/insert_propio ya
-- cubren la tabla completa (ver 20260804120000_tutorias_esquema.sql), y
-- obtener_formularios_area_por_email hace `select fa.*` (ver
-- 20260811120000_informes_por_email.sql) así que ya los expone sin cambios.

alter table public.formularios_area
  add column tutor_nombre text,
  add column tutor_telefono text;
