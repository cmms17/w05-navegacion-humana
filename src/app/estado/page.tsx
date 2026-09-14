import Link from "next/link";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { ETIQUETA_DECISION, ETIQUETA_RIESGO } from "@/lib/tipos";
import type {
  CasoNavegacion,
  RevisionNavegador,
  Tamizaje,
} from "@/lib/tipos";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ folio?: string }> };

// Consulta pública por folio — sin cuenta, sin necesidad de smartphone ni
// internet en casa (Condición 4 del Blueprint: accesible por diseño). El
// folio es literalmente el mismo tipo de papelito que ya entregan las
// farmacias mexicanas hoy.
export default async function Estado({ searchParams }: Props) {
  const { folio } = await searchParams;

  let tamizaje: Tamizaje | null = null;
  let caso: CasoNavegacion | null = null;
  let revision: RevisionNavegador | null = null;
  let noEncontrado = false;

  if (folio) {
    const supabase = crearClienteSupabaseServidor();
    const { data: t } = await supabase
      .from("tamizajes")
      .select("*")
      .eq("folio", folio.trim().toUpperCase())
      .maybeSingle<Tamizaje>();

    if (!t) {
      noEncontrado = true;
    } else {
      tamizaje = t;
      const { data: c } = await supabase
        .from("casos_navegacion")
        .select("*")
        .eq("tamizaje_id", t.id)
        .maybeSingle<CasoNavegacion>();
      caso = c ?? null;

      if (caso) {
        const { data: r } = await supabase
          .from("revisiones_navegador")
          .select("*")
          .eq("caso_id", caso.id)
          .order("creado_en", { ascending: false })
          .maybeSingle<RevisionNavegador>();
        revision = r ?? null;
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-slate-500 hover:underline">
        ← Inicio
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mt-2">
        Consultar mi folio
      </h1>

      <form method="GET" className="mt-6 flex gap-2">
        <input
          name="folio"
          defaultValue={folio ?? ""}
          placeholder="NAV-1234"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-800 text-white text-sm font-semibold px-4 py-2 hover:bg-blue-900"
        >
          Buscar
        </button>
      </form>

      {noEncontrado ? (
        <p className="mt-6 text-sm text-red-600">
          No encontramos ese folio. Revisa que esté escrito igual que en tu
          papelito.
        </p>
      ) : null}

      {tamizaje ? (
        <div className="mt-6 rounded-xl border border-slate-200 p-5">
          <p
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              tamizaje.riesgo === "alto"
                ? "bg-red-100 text-red-800"
                : tamizaje.riesgo === "medio"
                ? "bg-amber-100 text-amber-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {ETIQUETA_RIESGO[tamizaje.riesgo]}
          </p>

          {!caso ? (
            <p className="mt-3 text-sm text-slate-600">
              No se requiere seguimiento adicional. {tamizaje.motivo_riesgo}
            </p>
          ) : !revision ? (
            <p className="mt-3 text-sm text-slate-600">
              Un navegador de salud humano todavía está revisando tu caso —
              no se te va a dejar solo con este resultado. Vuelve a checar
              en unas horas.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-semibold text-slate-900">
                Ya lo revisó un navegador de salud: {ETIQUETA_DECISION[revision.decision]}
              </p>
              <p className="text-sm text-slate-700">{revision.nota}</p>
              {revision.opcion_lugar ? (
                <p className="text-sm text-slate-600">
                  <b>Dónde:</b> {revision.opcion_lugar}
                </p>
              ) : null}
              {revision.opcion_ventana_fecha ? (
                <p className="text-sm text-slate-600">
                  <b>Cuándo:</b> {revision.opcion_ventana_fecha}
                </p>
              ) : null}
              {revision.opcion_rango_precio ? (
                <p className="text-sm text-slate-600">
                  <b>Costo aproximado:</b> {revision.opcion_rango_precio}
                </p>
              ) : null}
              <p className="text-xs text-slate-400 mt-2">
                Tú decides si aceptas esta opción, buscas otra fecha o pides
                más información — nadie agenda nada en automático a tu
                nombre.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
