import type { NivelRiesgo } from "./tipos";

export interface ChecklistGenerado {
  texto: string;
  esSimulado: boolean;
}

export function generarChecklistSimulado(
  riesgo: NivelRiesgo,
  motivo: string
): ChecklistGenerado {
  if (riesgo === "alto") {
    return {
      esSimulado: true,
      texto:
        `Resultado de riesgo alto: ${motivo}\n\n` +
        "Siguiente paso sugerido (borrador para que el navegador revise, no una instrucción " +
        "automática):\n" +
        "1) Confirmar el resultado con una prueba de laboratorio o cita médica en los próximos días.\n" +
        "2) Buscar una clínica u hospital cercano que atienda este caso — el navegador debe " +
        "confirmar cuál, con precio y fecha reales.\n" +
        "3) Explicar en palabras simples qué significa el resultado y por qué conviene actuar pronto, " +
        "sin generar alarma innecesaria.",
    };
  }
  if (riesgo === "medio") {
    return {
      esSimulado: true,
      texto:
        `Resultado de riesgo medio: ${motivo}\n\n` +
        "Siguiente paso sugerido (borrador para que el navegador revise):\n" +
        "1) Recomendar una revisión de seguimiento en las próximas semanas, no como urgencia.\n" +
        "2) Compartir hábitos y señales de alarma a vigilar mientras tanto.\n" +
        "3) Dejar abierta la puerta a escalar si aparecen nuevos síntomas.",
    };
  }
  return {
    esSimulado: true,
    texto:
      `Resultado de riesgo bajo: ${motivo}\n\n` +
      "No se genera caso de navegación — se muestra el resultado directamente al paciente con " +
      "recomendaciones generales de prevención.",
  };
}
