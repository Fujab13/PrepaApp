-- Quita dos políticas de Storage DUPLICADAS que creó por error la línea
-- base (20260803000000) al aplicarse el 2026-09-26: la guarda "crear solo
-- si falta" buscaba los nombres en minúsculas, pero los reales empiezan con
-- mayúscula ("Acceso examenes solo si esta en inventario" / "Acceso solo si
-- esta en inventario"), así que creó copias en minúsculas. Tenían
-- exactamente las mismas reglas que las originales (nadie ganó ni perdió
-- acceso); esto solo deja la base como estaba. La línea base ya se corrigió
-- para usar los nombres reales.
--
-- Solo se borran las copias en minúsculas (nombre exacto, entre comillas):
-- las originales con mayúscula no se tocan. En una base reconstruida desde
-- cero las copias nunca existen y esto es un no-op.

drop policy if exists "acceso examenes solo si esta en inventario" on storage.objects;
drop policy if exists "acceso solo si esta en inventario" on storage.objects;
