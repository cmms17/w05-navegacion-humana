import type { NivelRiesgo } from "./tipos";

export interface RespuestasTamizaje {
  sistolica: number;
  diastolica: number;
  glucosaMgdl: number;
  mareosFrecuentes: boolean;
  sedExcesiva: boolean;
  antecedentesFamiliares: boolean;
}

export interface ResultadoRiesgo {
  riesgo: NivelRiesgo;
  motivo: string;
}

export function calcularRiesgo(r: RespuestasTamizaje): ResultadoRiesgo {
  if (r.sistolica >= 140 || r.diastolica >= 90) {
    return {
      riesgo: "alto",
      motivo:
        `Presión arterial ${r.sistolica}/${r.diastolica} mmHg está en rango de hipertensión ` +
        `(≥140/90). Amerita confirmación médica pronta.`,
    };
  }
  if (r.glucosaMgdl >= 126) {
    return {
      riesgo: "alto",
      motivo:
        `Glucosa capilar de ${r.glucosaMgdl} mg/dL está en rango compatible con diabetes ` +
        `(≥126 mg/dL en ayuno). Amerita confirmación médica pronta.`,
    };
  }
  if (
    (r.sistolica >= 130 || r.glucosaMgdl >= 100) &&
    (r.antecedentesFamiliares || r.mareosFrecuentes || r.sedExcesiva)
  ) {
    return {
      riesgo: "medio",
      motivo:
        "Cifras un poco elevadas combinadas con antecedentes o síntomas reportados. " +
        "Vale la pena una revisión, sin ser una urgencia.",
    };
  }
  return {
    riesgo: "bajo",
    motivo: "Cifras dentro de rango esperado y sin señales de alarma reportadas.",
  };
}

export function generarFolio(): string {
  const numero = Math.floor(1000 + Math.random() * 9000);
  return `NAV-${numero}`;
}
