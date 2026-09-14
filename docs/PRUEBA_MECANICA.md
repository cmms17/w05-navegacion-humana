# Prueba mecánica — resultados (w05)

Ejecutada sobre el despliegue en vivo (`w05-navegacion-humana.vercel.app`),
siguiendo el plan de pruebas de `docs/PACKET.md`.

1. Tamizaje con cifras normales → ✅ no crea caso, muestra recomendaciones generales.
2. Tamizaje con presión ≥140/90 → ✅ crea caso de riesgo alto, límite de 24 horas.
3. Entrar a `/navegador` sin sesión → ✅ redirige a `/navegador/login`.
4. Login con credenciales incorrectas → ✅ rechazado con mensaje claro.
5. Login correcto → ✅ aparece el caso en la cola, ordenado por urgencia.
6. Nota de revisión menor a 20 caracteres → ✅ bloqueada en el navegador (HTML5) y también en el servidor.
7. Revisión válida con nota + lugar/fecha/costo → ✅ pasa a "revisado", visible en `/estado`.
8. Panel de auditoría (pendientes / fuera de tiempo / horas promedio) → ✅ se actualiza en tiempo real tras cada revisión.

## Bug encontrado y corregido

Al presionar el sistema como ADVERSARY con datos médicamente imposibles
(presión sistólica 90 / diastólica 150 — la diastólica nunca puede ser mayor
que la sistólica), el tamizaje lo aceptó sin más y lo clasificó como "riesgo
alto" sin ninguna señal de que el dato en sí era inválido.

**Fix:** se agregó una validación (zod `refine` en el servidor + verificación
en el cliente) que rechaza explícitamente cualquier combinación donde la
sistólica no sea mayor que la diastólica, con un mensaje de error claro para
quien está capturando el dato en la farmacia.

**Commit:** `15f9003` — redeploy confirmado en producción.
