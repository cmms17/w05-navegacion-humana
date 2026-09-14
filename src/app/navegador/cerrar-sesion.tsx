"use client";

import { useRouter } from "next/navigation";
import { crearClienteSupabaseNavegador } from "@/lib/supabase/client";

export default function CerrarSesion() {
  const router = useRouter();

  async function salir() {
    const supabase = crearClienteSupabaseNavegador();
    await supabase.auth.signOut();
    router.push("/navegador/login");
    router.refresh();
  }

  return (
    <button
      onClick={salir}
      className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
    >
      Cerrar sesión
    </button>
  );
}
