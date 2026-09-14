import { NextResponse } from "next/server";
import { z } from "zod";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { calcularRiesgo, generarFolio } from "@/lib/riesgo";
import { generarChecklistSimulado } from "@/lib/llm";
import { SLA_HORAS } from "@/lib/tipos";

const cuerpoEsperado = z.object({
  nombre: z.string().min(1).max(120),
  edad: z.number().int().min(0).max(120).nullable().optional(),
  sistolica: z.number().int().min(60).max(260),
  diastolica: z.number().int().min(30).max(160),
  glucosaMgdl: z.number().int().min(40).max(500),
  mareosFrecuentes: z.boolean(),
  sedExcesiva: z.boolean(),
  antecedentesFamiliares: z.boolean(),
});

export async function POST(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const resultado = cuerpoEsperado.safeParse(cuerpo);
  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos de tamizaje inválidos." },
      { status: 400 }
    );
  }
  const datos = resultado.data;

  const supabase = crearClienteSupabaseServidor();

  const { data: paciente, error: errorPaciente } = await supabase
    .from("pacientes_demo")
    .insert({ nombre: datos.nombre, edad: datos.edad ?? null })
    .select()
    .single();
  if (errorPaciente || !paciente) {
    return NextResponse.json(
      { error: "No se pudo registrar el paciente demo." },
      { status: 500 }
    );
  }

  const { riesgo, motivo } = calcularRiesgo({
    sistolica: datos.sistolica,
    diastolica: datos.diastolica,
    glucosaMgdl: datos.glucosaMgdl,
    mareosFrecuentes: datos.mareosFrecuentes,
    sedExcesiva: datos.sedExcesiva,
    antecedentesFamiliares: datos.antecedentesFamiliares,
  });

  const folio = generarFolio();

  const { data: tamizaje, error: errorTamizaje } = await supabase
    .from("tamizajes")
    .insert({
      paciente_id: paciente.id,
      folio,
      sistolica: datos.sistolica,
      diastolica: datos.diastolica,
      glucosa_mgdl: datos.glucosaMgdl,
      mareos_frecuentes: datos.mareosFrecuentes,
      sed_excesiva: datos.sedExcesiva,
      antecedentes_familiares: datos.antecedentesFamiliares,
      riesgo,
      motivo_riesgo: motivo,
    })
    .select()
    .single();
  if (errorTamizaje || !tamizaje) {
    return NextResponse.json(
      { error: "No se pudo guardar el tamizaje." },
      { status: 500 }
    );
  }

  const checklist = generarChecklistSimulado(riesgo, motivo);
  let creoCaso = false;

  if (riesgo !== "bajo") {
    const slaLimite = new Date(
      Date.now() + SLA_HORAS[riesgo] * 60 * 60 * 1000
    ).toISOString();

    const { error: errorCaso } = await supabase
      .from("casos_navegacion")
      .insert({
        tamizaje_id: tamizaje.id,
        estado: "pendiente_revision",
        checklist_ia: checklist.texto,
        checklist_es_simulado: checklist.esSimulado,
        sla_limite: slaLimite,
      });
    if (errorCaso) {
      return NextResponse.json(
        { error: "No se pudo crear el caso de navegación." },
        { status: 500 }
      );
    }
    creoCaso = true;

    await supabase.from("eventos_navegacion").insert({
      tipo_evento: "caso_creado",
      entidad_tipo: "tamizaje",
      entidad_id: tamizaje.id,
      detalle: { riesgo, folio },
    });
  }

  return NextResponse.json({
    folio,
    riesgo,
    motivo,
    checklist: checklist.texto,
    creoCaso,
  });
}
