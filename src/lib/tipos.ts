export type NivelRiesgo = "bajo" | "medio" | "alto";

export type EstadoCaso = "pendiente_revision" | "revisado" | "vencido";

export type DecisionNavegador =
  | "confirmar_siguiente_paso"
  | "derivar"
  | "pedir_mas_info";

export interface Tamizaje {
  id: string;
  paciente_id: string;
  folio: string;
  sistolica: number | null;
  diastolica: number | null;
  glucosa_mgdl: number | null;
  mareos_frecuentes: boolean;
  sed_excesiva: boolean;
  antecedentes_familiares: boolean;
  riesgo: NivelRiesgo;
  motivo_riesgo: string;
  creado_en: string;
}

export interface PacienteDemo {
  id: string;
  nombre: string;
  edad: number | null;
}

export interface CasoNavegacion {
  id: string;
  tamizaje_id: string;
  estado: EstadoCaso;
  checklist_ia: string | null;
  checklist_es_simulado: boolean;
  sla_limite: string;
  creado_en: string;
}

export interface RevisionNavegador {
  id: string;
  caso_id: string;
  navegador_email: string;
  nota: string;
  decision: DecisionNavegador;
  opcion_lugar: string | null;
  opcion_ventana_fecha: string | null;
  opcion_rango_precio: string | null;
  creado_en: string;
}

export const ETIQUETA_RIESGO: Record<NivelRiesgo, string> = {
  bajo: "Riesgo bajo",
  medio: "Riesgo medio",
  alto: "Riesgo alto",
};

export const ETIQUETA_DECISION: Record<DecisionNavegador, string> = {
  confirmar_siguiente_paso: "Confirmar siguiente paso",
  derivar: "Derivar a otro servicio",
  pedir_mas_info: "Pedir más información",
};

// Ventana de tiempo (horas) dentro de la cual un navegador de salud humano
// debe revisar un caso de riesgo medio/alto antes de que se marque como
// vencido en la cola de auditoría (Shadow Clause del Blueprint del equipo:
// la detección nunca puede quedarse sin una respuesta humana real).
export const SLA_HORAS: Record<NivelRiesgo, number> = {
  alto: 24,
  medio: 72,
  bajo: 0,
};
