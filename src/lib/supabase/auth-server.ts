import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente de Supabase Auth para Server Components — SOLO se usa para saber
// qué navegador de salud inició sesión (su correo), nunca para leer o
// escribir las tablas de datos (eso siempre pasa por
// src/lib/supabase/server.ts con la Service Role Key).
export async function obtenerNavegadorAutenticado() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Los Server Components no pueden escribir cookies; el middleware
          // ya se encarga de refrescar la sesión en cada request.
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

