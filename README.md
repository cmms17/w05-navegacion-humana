# w05-navegacion-humana

Detección a tratamiento — la pieza que le impide al sistema quedarse en "detecta
y ya". Cada tamizaje de riesgo medio o alto pasa por un navegador de salud
humano real antes de convertirse en un siguiente paso concreto para el
paciente.

Ver `docs/PACKET.md` para el problema, la usuaria, los diagramas de flujo y el
plan de pruebas completo.

## Cómo funciona esta pieza

1. `/tamizaje` — cuestionario estructurado simulado (presión arterial, glucosa
   capilar, síntomas), como en una farmacia. Calcula un riesgo simulado y, si
   es medio o alto, genera un caso de navegación — nunca se queda solo en un
   número.
2. `/navegador` (con cuenta, Supabase Auth) — cola de revisión humana
   obligatoria, con auditoría de tiempos de respuesta: marca en rojo los
   casos fuera de tiempo. Aprobar, derivar o pedir más información, siempre
   con una nota real (mínimo 20 caracteres).
3. `/estado` — el paciente consulta su folio sin cuenta ni internet en casa.
   Solo ve el siguiente paso después de que un humano lo revisó, y decide si
   lo acepta (nadie agenda nada en automático a su nombre).

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, desplegado en Vercel, con
Supabase como base de datos (Row Level Security activado; toda la
lectura/escritura de datos ocurre del lado del servidor con la Service Role
Key) y Supabase Auth (correo/contraseña) solo para la sesión del navegador de
salud.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # llena las variables de Supabase
```

Aplica `supabase/migrations/20260914000000_esquema_navegacion_humana.sql` y
luego `supabase/seed_demo.sql` en el SQL Editor de tu proyecto de Supabase.
Crea un usuario navegador de salud en Authentication → Users (correo +
contraseña) para poder entrar a `/navegador`.

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).
