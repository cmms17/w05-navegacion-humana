import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase que usa la Service Role Key. Solo debe importarse
// desde código de servidor (Server Components, Route Handlers). El paquete
// "server-only" hace que el build falle si algún componente de cliente
// intenta importar este archivo. Este es el ÚNICO cliente que lee o escribe
// las tablas de datos (pacientes, tamizajes, casos, revisiones, eventos) —
// nunca se exponen directamente al navegador.
export function crearClienteSupabaseServidor() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan las variables de entorno de Supabase en el servidor."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

