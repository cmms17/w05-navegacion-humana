import { type NextRequest } from "next/server";
import { actualizarSesion } from "@/lib/supabase/middleware";

// Puerta de acceso al navegador de salud (Condición 2 del Blueprint: debe
// existir escalamiento humano real). Cualquiera puede hacer un tamizaje o
// consultar su folio sin cuenta (Condición 4: accesible sin identidad
// digital), pero SOLO un navegador de salud autenticado puede entrar a
// /navegador a revisar y aprobar casos.
export async function middleware(request: NextRequest) {
  return actualizarSesion(request);
}

export const config = {
  matcher: ["/navegador/:path*"],
};

