import { NextResponse } from "next/server";
import { z } from "zod";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { calcularRiesgo, generarFolio } from "@/lib/riesgo";
import { generarChecklistSimulado } from "@/lib/llm";
import { SLA_HORAS } from "@/lib/tipos";

// Único punto de entrada que crea un tamizaje. Valida la señal estructurada
// (cifras de farmacia), calcula el riesgo, y — condición 1 del Blueprint —
// si el riesgo es medio o alto, SIEMPRE crea un caso de navegación: ningún
// tamizaje se queda solo con un número.
const cuerpoEsperado = z
  .object({
    nombre: z.string().min(1).max(120),
    edad: z.number().int().min(0).max(120).nullable().optional(),
    sistolica: z.number().int().min(60).max(260),
    diastolica: z.number().int().min(30).max(160),
    glucosaMgdl: z.number().int().min(40).max(500),
    mareosFrecuentes: z.boolean(),
    sedExcesiva: z.boolean(),
    antecedentesFamiliares: z.boolean(),
  })
  // Bug encontrado en prueba mecánica (w05): el esquema aceptaba presión
  // arterial invertida (diastólica >= sistólica), algo que no existe
  // fisiológicamente, y aun así el sistema la clasificaba como riesgo real.
  // Como ADVERSARY, esto es exactamente el tipo de dato falso que no debe
  // pasar disfrazado de señal médica real.
  .refine((datos) => datos.sistolica > datos.diastolica, {
    message: "presion_invertida",
    path: ["sistolica"],
  });

export async function POST(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const resultado = cuerpoEsperado.safeParse(cuerpo);
  if (!resultado.success) {
    const esPresionInvertida = resultado.error.issues.some(
      (i) => i.message === "presion_invertida"
    );
    return NextResponse.json(
      {
        error: esPresionInvertida
          ? "La presión sistólica debe ser mayor que la diastólica — revisa las cifras capturadas en la farmacia."
          : "Datos de tamizaje inválidos.",
      },
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
