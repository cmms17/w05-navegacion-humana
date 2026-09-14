-- Datos de demostración — todo simulado, ninguna persona real (ver Blueprint,
-- condición 5, y el piso de seguridad del curso). Corre esto DESPUÉS de la
-- migración, en el SQL Editor de Supabase.

insert into public.pacientes_demo (id, nombre, edad)
values ('11111111-1111-1111-1111-111111111111', 'Rosa (demo)', 58)
on conflict (id) do nothing;

insert into public.tamizajes (
  id, paciente_id, folio, sistolica, diastolica, glucosa_mgdl,
  mareos_frecuentes, sed_excesiva, antecedentes_familiares, riesgo, motivo_riesgo
)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'NAV-1001',
  148, 94, 110,
  true, false, true,
  'alto',
  'Presión arterial 148/94 mmHg está en rango de hipertensión (≥140/90). Amerita confirmación médica pronta.'
)
on conflict (id) do nothing;

insert into public.casos_navegacion (
  id, tamizaje_id, estado, checklist_ia, checklist_es_simulado, sla_limite
)
values (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'pendiente_revision',
  'Resultado de riesgo alto: presión arterial elevada. Siguiente paso sugerido (borrador, revisar): 1) Confirmar con laboratorio o cita médica en los próximos días. 2) Buscar clínica cercana — confirmar cuál, con precio y fecha reales. 3) Explicar el resultado en palabras simples.',
  true,
  now() + interval '24 hours'
)
on conflict (id) do nothing;

