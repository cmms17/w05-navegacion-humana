import Link from "next/link";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { obtenerNavegadorAutenticado } from "@/lib/supabase/auth-server";
import { ETIQUETA_RIESGO, type CasoNavegacion, type Tamizaje } from "@/lib/tipos";
import CerrarSesion from "./cerrar-sesion";

export const dynamic = "force-dynamic";

type CasoConTamizaje = CasoNavegacion & { tamizajes: Tamizaje };

export default async function ColaNavegador() {
  const usuario = await obtenerNavegadorAutenticado();
  const supabase = crearClienteSupabaseServidor();

  const { data: pendientes } = await supabase
    .from("casos_navegacion")
    .select("*, tamizajes(*)")
    .eq("estado", "pendiente_revision")
    .order("sla_limite", { ascending: true })
    .returns<CasoConTamizaje[]>();

  const { data: resueltos } = await supabase
    .from("casos_navegacion")
    .select("id, creado_en, revisiones_navegador(creado_en)")
    .eq("estado", "revisado");

  // Server Component: necesita la hora real del servidor para calcular qué
  // casos están fuera de tiempo.
  // eslint-disable-next-line react-hooks/purity
  const ahora = Date.now();
  const lista = pendientes ?? [];
  const vencidos = lista.filter(
    (c) => new Date(c.sla_limite).getTime() < ahora
  );

  // Auditoría de tiempos de respuesta — la pieza central de mi rol como
  // ADVERSARY: que la cadena humana sea real y medible, no un supuesto.
  type ResueltoFila = {
    creado_en: string;
    revisiones_navegador: { creado_en: string }[] | { creado_en: string } | null;
  };
  const horas: number[] = [];
  for (const r of (resueltos ?? []) as ResueltoFila[]) {
    const rev = Array.isArray(r.revisiones_navegador)
      ? r.revisiones_navegador[0]
      : r.revisiones_navegador;
    if (rev) {
      const h =
        (new Date(rev.creado_en).getTime() - new Date(r.creado_en).getTime()) /
        (1000 * 60 * 60);
      horas.push(h);
    }
  }
  const promedioHoras =
    horas.length > 0
      ? (horas.reduce((a, b) => a + b, 0) / horas.length).toFixed(1)
      : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          ← Inicio
        </Link>
        <CerrarSesion />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mt-2">
        Cola de navegación humana
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Sesión: {usuario?.email ?? "navegador de salud"}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        Ningún caso de riesgo medio o alto llega al paciente como respuesta
        final sin pasar por aquí (Condición 2 y Shadow Clause del Blueprint
        del equipo).
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xl font-bold text-slate-900">{lista.length}</p>
          <p className="text-xs text-slate-500">Pendientes</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xl font-bold text-red-700">{vencidos.length}</p>
          <p className="text-xs text-red-600">Fuera de tiempo</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xl font-bold text-slate-900">
            {promedioHoras ?? "—"}
          </p>
          <p className="text-xs text-slate-500">Horas promedio de respuesta</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {lista.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay casos pendientes de revisión ahora mismo.
          </p>
        ) : (
          lista.map((c) => {
            const vencido = new Date(c.sla_limite).getTime() < ahora;
            return (
              <div
                key={c.id}
                className={`rounded-xl border p-5 ${
                  vencido
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200"
                }`}
              >
                {vencido ? (
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                    Fuera de tiempo — atender primero
                  </p>
                ) : null}
                <p className="text-sm font-semibold text-slate-900">
                  Folio {c.tamizajes.folio} —{" "}
                  {ETIQUETA_RIESGO[c.tamizajes.riesgo]}
                </p>
                <p className="text-xs text-slate-500">
                  Límite de revisión:{" "}
                  {new Date(c.sla_limite).toLocaleString("es-MX")}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  {c.tamizajes.motivo_riesgo}
                </p>

                {c.checklist_ia ? (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Borrador generado por IA
                      {c.checklist_es_simulado ? " (simulado)" : ""} — solo
                      referencia, tú decides:
                    </p>
                    <pre className="mt-1 whitespace-pre-wrap text-xs text-slate-700 font-sans">
                      {c.checklist_ia}
                    </pre>
                  </div>
                ) : null}

                <form
                  action="/api/navegador/revision"
                  method="POST"
                  className="mt-4 space-y-3"
                >
                  <input type="hidden" name="caso_id" value={c.id} />

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Tu nota para el paciente
                    </label>
                    <textarea
                      name="nota"
                      required
                      minLength={20}
                      rows={2}
                      placeholder="Explica con detalle qué revisaste y qué sigue (mínimo 20 caracteres — nada de 'ok')."
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      name="opcion_lugar"
                      placeholder="Dónde (clínica/CAF)"
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                    />
                    <input
                      name="opcion_ventana_fecha"
                      placeholder="Cuándo (ventana de fecha)"
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                    />
                    <input
                      name="opcion_rango_precio"
                      placeholder="Costo aproximado"
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      name="decision"
                      value="confirmar_siguiente_paso"
                      className="rounded-lg bg-green-700 text-white text-sm font-semibold px-4 py-2 hover:bg-green-800"
                    >
                      Confirmar siguiente paso
                    </button>
                    <button
                      name="decision"
                      value="derivar"
                      className="rounded-lg border border-blue-800 text-blue-800 text-sm font-semibold px-4 py-2 hover:bg-blue-50"
                    >
                      Derivar
                    </button>
                    <button
                      name="decision"
                      value="pedir_mas_info"
                      className="rounded-lg border border-slate-300 text-slate-600 text-sm px-4 py-2 hover:bg-slate-50"
                    >
                      Pedir más info
                    </button>
                  </div>
                </form>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
