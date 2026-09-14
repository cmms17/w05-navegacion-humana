import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Inicio() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">
        Detección a tratamiento
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Proof-of-Skill · Business Bending · Cristina Meouchi (ADVERSARY) ·
        Team 8
      </p>

      <p className="mt-6 text-slate-700 leading-relaxed">
        Esta pieza ataca el vacío del equipo:{" "}
        <b>detección a tratamiento en tamizaje de farmacia</b>. Detectar un
        riesgo temprano nunca es suficiente por sí solo — cada caso de
        riesgo medio o alto pasa por un navegador de salud humano real antes
        de convertirse en un siguiente paso concreto para el paciente.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/tamizaje"
          className="rounded-xl border border-slate-200 p-5 hover:border-blue-400 transition"
        >
          <p className="font-semibold text-slate-900">
            Hacer un tamizaje (farmacia)
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Cuestionario simulado de presión arterial y glucosa capilar,
            como en una farmacia.
          </p>
        </Link>

        <Link
          href="/estado"
          className="rounded-xl border border-slate-200 p-5 hover:border-blue-400 transition"
        >
          <p className="font-semibold text-slate-900">
            Consultar mi folio
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Sin cuenta ni internet en casa — solo el folio que te dieron en
            la farmacia.
          </p>
        </Link>

        <Link
          href="/navegador/login"
          className="rounded-xl border border-slate-200 p-5 hover:border-blue-400 transition sm:col-span-2"
        >
          <p className="font-semibold text-slate-900">
            Soy navegador/a de salud
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Cola de revisión humana obligatoria, con auditoría de tiempos de
            respuesta.
          </p>
        </Link>
      </div>
    </div>
  );
}
