"use client";

import { useState } from "react";
import Link from "next/link";

interface RespuestaApi {
  folio: string;
  riesgo: "bajo" | "medio" | "alto";
  motivo: string;
  checklist: string;
  creoCaso: boolean;
}

export default function Tamizaje() {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [sistolica, setSistolica] = useState("");
  const [diastolica, setDiastolica] = useState("");
  const [glucosa, setGlucosa] = useState("");
  const [mareos, setMareos] = useState(false);
  const [sed, setSed] = useState(false);
  const [antecedentes, setAntecedentes] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RespuestaApi | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Bug encontrado en prueba mecánica (w05): se podía capturar presión
    // diastólica mayor o igual a la sistólica — una combinación que no existe
    // fisiológicamente — y el sistema la aceptaba como si fuera una lectura
    // real. Lo atajamos aquí antes de llamar a la API, y el servidor también
    // lo rechaza por su cuenta (nunca hay que confiar solo en el navegador).
    if (Number(sistolica) <= Number(diastolica)) {
      setError(
        "La presión sistólica debe ser mayor que la diastólica — revisa las cifras capturadas en la farmacia."
      );
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/tamizaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          edad: edad ? Number(edad) : null,
          sistolica: Number(sistolica),
          diastolica: Number(diastolica),
          glucosaMgdl: Number(glucosa),
          mareosFrecuentes: mareos,
          sedExcesiva: sed,
          antecedentesFamiliares: antecedentes,
        }),
      });
      if (!res.ok) {
        const cuerpo = await res.json().catch(() => ({}));
        throw new Error(cuerpo.error ?? "No se pudo procesar el tamizaje.");
      }
      const datos: RespuestaApi = await res.json();
      setResultado(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          ← Inicio
        </Link>

        <div className="mt-4 rounded-xl border border-slate-200 p-6">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Folio (guárdalo, no necesitas cuenta ni internet en casa)
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {resultado.folio}
          </p>

          <p
            className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              resultado.riesgo === "alto"
                ? "bg-red-100 text-red-800"
                : resultado.riesgo === "medio"
                ? "bg-amber-100 text-amber-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {resultado.riesgo === "alto"
              ? "Riesgo alto"
              : resultado.riesgo === "medio"
              ? "Riesgo medio"
              : "Riesgo bajo"}
          </p>
          <p className="mt-2 text-sm text-slate-600">{resultado.motivo}</p>

          {resultado.creoCaso ? (
            <div className="mt-5 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                Este resultado <b>no se queda solo en un número</b>: un
                navegador de salud humano lo va a revisar antes de que se
                convierta en un siguiente paso. Con tu folio puedes checar el
                avance en{" "}
                <Link href="/estado" className="underline">
                  /estado
                </Link>
                .
              </p>
              <p className="mt-3 text-xs text-blue-700">
                Borrador generado (simulado, sin validar por un humano
                todavía):
              </p>
              <pre className="mt-1 whitespace-pre-wrap text-xs text-blue-900 font-sans">
                {resultado.checklist}
              </pre>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-600">
              No se generó un caso de navegación — recomendaciones generales
              de prevención abajo.
              <br />
              {resultado.checklist}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-slate-500 hover:underline">
        ← Inicio
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mt-2">
        Tamizaje en farmacia (simulado)
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Cifras y respuestas de demostración — como las que un/a farmacéutico/a
        tomaría con un baumanómetro y un glucómetro reales.
      </p>

      <form onSubmit={enviar} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600">
              Nombre (demo)
            </label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Edad
            </label>
            <input
              type="number"
              min={0}
              max={120}
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Presión sistólica
            </label>
            <input
              required
              type="number"
              min={60}
              max={260}
              value={sistolica}
              onChange={(e) => setSistolica(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Presión diastólica
            </label>
            <input
              required
              type="number"
              min={30}
              max={160}
              value={diastolica}
              onChange={(e) => setDiastolica(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Glucosa capilar (mg/dL)
            </label>
            <input
              required
              type="number"
              min={40}
              max={500}
              value={glucosa}
              onChange={(e) => setGlucosa(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={mareos}
              onChange={(e) => setMareos(e.target.checked)}
            />
            Mareos o dolores de cabeza frecuentes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={sed}
              onChange={(e) => setSed(e.target.checked)}
            />
            Sed excesiva o necesidad frecuente de orinar
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={antecedentes}
              onChange={(e) => setAntecedentes(e.target.checked)}
            />
            Antecedentes familiares de diabetes o hipertensión
          </label>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-blue-800 text-white text-sm font-semibold px-4 py-2 hover:bg-blue-900 disabled:opacity-50"
        >
          {enviando ? "Calculando…" : "Ver resultado"}
        </button>
      </form>
    </div>
  );
}
