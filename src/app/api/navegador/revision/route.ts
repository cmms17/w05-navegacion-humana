import { NextResponse } from "next/server";
import { z } from "zod";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { obtenerNavegadorAutenticado } from "@/lib/supabase/auth-server";
import type { DecisionNavegador } from "@/lib/tipos";

const cuerpoEsperado = z.object({
  caso_id: z.string().uuid(),
  nota: z.string().min(20).max(800),
  decision: z.enum(["confirmar_siguiente_paso", "derivar", "pedir_mas_info"]),
  opcion_lugar: z.string().max(200).optional(),
  opcion_ventana_fecha: z.string().max(120).optional(),
  opcion_rango_precio: z.string().max(120).optional(),
});

export async function POST(request: Request) {
  const usuario = await obtenerNavegadorAutenticado();
  if (!usuario?.email) {
    return NextResponse.json(
      { error: "Necesitas iniciar sesión como navegador de salud." },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const resultado = cuerpoEsperado.safeParse({
    caso_id: formData.get("caso_id"),
    nota: formData.get("nota"),
    decision: formData.get("decision"),
    opcion_lugar: formData.get("opcion_lugar") || undefined,
    opcion_ventana_fecha: formData.get("opcion_ventana_fecha") || undefined,
    opcion_rango_precio: formData.get("opcion_rango_precio") || undefined,
  });

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos de revisión inválidos." },
      { status: 400 }
    );
  }

  const { caso_id, nota, decision, opcion_lugar, opcion_ventana_fecha, opcion_rango_precio } =
    resultado.data;

  const supabase = crearClienteSupabaseServidor();

  await supabase.from("revisiones_navegador").insert({
    caso_id,
    navegador_email: usuario.email,
    nota,
    decision: decision as DecisionNavegador,
    opcion_lugar: opcion_lugar ?? null,
    opcion_ventana_fecha: opcion_ventana_fecha ?? null,
    opcion_rango_precio: opcion_rango_precio ?? null,
  });

  await supabase
    .from("casos_navegacion")
    .update({ estado: "revisado" })
    .eq("id", caso_id);

  await supabase.from("eventos_navegacion").insert({
    tipo_evento: "revision_humana",
    entidad_tipo: "caso_navegacion",
    entidad_id: caso_id,
    detalle: { decision, navegador_email: usuario.email },
  });

  return NextResponse.redirect(new URL("/navegador", request.url), 303);
}
