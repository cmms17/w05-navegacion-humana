# Prueba de persona — Rosa (w05)

## Quién es Rosa

Rosa, 58 años, Ecatepec (ver `docs/PACKET.md`). No tiene celular inteligente
propio — usa el de su hijo cuando la visita. No está acostumbrada a escribir
códigos ni llenar formularios digitales. Le dieron un papelito con su folio
en el CAF.

## Recorrido simulado

Me puse en su lugar para usar `/estado`, el único paso de la aplicación que
Rosa usaría sola, sin ayuda de nadie, posiblemente días después del tamizaje
y con el celular prestado de su hijo.

1. Rosa busca el papelito que le dieron en la farmacia. Dice "NAV-1001".
2. Al escribirlo en el celular de su hijo, lo más probable es que no ponga
   el guion — o ponga un espacio en su lugar — porque no es una forma de
   escribir a la que esté acostumbrada. Escribe algo como "nav 1001" o
   "nav1001".
3. Antes del fix: la búsqueda no encontraba nada, y la página solo decía
   "revisa que esté escrito igual que en tu papelito" — un mensaje que no
   le dice qué hizo mal, y que la deja pensando que perdió su resultado o
   que la farmacia se equivocó.

## Confusión encontrada

El sistema exigía una coincidencia exacta del folio, incluyendo el guion y
las mayúsculas — una carga silenciosa sobre alguien que no tiene por qué
saber que eso importa.

## Fix aplicado

Se normaliza lo que la persona escribe (se quitan espacios/guiones, se
compara solo por las letras y números) antes de buscar en la base de datos,
y se agregó un texto de ejemplo junto al campo ("Escríbelo como te lo dieron
en la farmacia, por ejemplo NAV-1234 — si se te olvida el guion o pones
espacios, no hay problema").

**Commit:** `9512291` — redeploy confirmado en producción.

## Verificación

Se probó en el despliegue en vivo escribiendo `nav1001` (sin guion, en
minúsculas) y el sistema encontró y mostró correctamente el caso NAV-1001.
