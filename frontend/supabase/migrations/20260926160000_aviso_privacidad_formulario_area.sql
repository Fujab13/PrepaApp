-- Constancia de la aceptación del Aviso de privacidad en cada Formulario de
-- área (qué versión del aviso y cuándo), para usuarios que en su mayoría son
-- menores: la casilla del formulario confirma además que madre, padre o
-- tutor autorizó (ver components/CasillaConsentimiento.jsx y
-- data/avisoPrivacidad.js → VERSION_AVISO).
--
-- Solo agrega dos columnas opcionales: los formularios ya existentes quedan
-- con NULL (se llenaron antes de que existiera el aviso). No toca ninguna
-- otra columna, dato ni política. Las RPC que leen formularios_area con
-- `fa.*` (obtener_formularios_area_por_email) siguen funcionando igual.

alter table public.formularios_area
  add column if not exists aviso_privacidad_version text,
  add column if not exists aviso_privacidad_aceptado_en timestamptz;
