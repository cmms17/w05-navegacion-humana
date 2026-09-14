import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieParaEscribir = {
  name: string;
  value: string;
  options?: CookieOptions;
};

// Verifica la sesión de Supabase Auth en cada request a una ruta protegida
// y refresca las cookies de sesión. Este es el único propósito de este
// cliente: confirmar QUIÉN es el navegador de salud que entra a /navegador.
// No se usa para leer ni escribir ninguna tabla de datos.
export async function actualizarSesion(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieParaEscribir[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const esRutaProtegida =
    request.nextUrl.pathname.startsWith("/navegador") &&
    !request.nextUrl.pathname.startsWith("/navegador/login");

  if (esRutaProtegida && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/navegador/login";
    return NextResponse.redirect(url);
  }

  return response;
}

