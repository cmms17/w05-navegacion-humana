"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { crearClienteSupabaseNavegador } from "@/lib/supabase/client";

export default function LoginNavegador() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    const supabase = crearClienteSupabaseNavegador();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setCargando(false);
    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/navegador");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <Link href="/" className="text-sm text-slate-500 hover:underline">
        ← Inicio
      </Link>
      <h1 className="text-xl font-bold text-slate-900 mt-2">
        Acceso — navegador/a de salud
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Esta cola solo la puede ver un navegador de salud con cuenta — nunca
        queda abierta al público (Condición 5 del Blueprint: datos
        seguros).
      </p>

      <form onSubmit={iniciarSesion} className="mt-6 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600">
            Correo
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-lg bg-blue-800 text-white text-sm font-semibold px-4 py-2 hover:bg-blue-900 disabled:opacity-50"
        >
          {cargando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
