import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para el navegador. Usa la clave anon (pública por
// diseño) SOLO para el inicio de sesión del navegador de salud (Supabase
// Auth). Las tablas de datos tienen RLS activado sin policies para el rol
// authenticated: este cliente nunca puede leer ni escribir datos, solo
// autenticar. La lectura/escritura real siempre ocurre del lado del
// servidor con la Service Role Key (ver src/lib/supabase/server.ts).
export function crearClienteSupabaseNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

