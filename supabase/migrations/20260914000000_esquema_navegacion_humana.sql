-- Esquema: Detección a tratamiento — navegación humana (w05)
-- Row Level Security ON en todas las tablas, sin policies para anon ni
-- authenticated: toda la lectura/escritura real ocurre del lado del
-- servidor con la Service Role Key (ver src/lib/supabase/server.ts). El
-- rol authenticated (navegadores de salud con sesión) solo se usa para
-- autenticación vía Supabase Auth, nunca para tocar estas tablas
-- directamente.

create extension if not exists "pgcrypto";

create table if not exists public.pacientes_demo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  edad int,
  creado_en timestamptz not null default now()
);

create table if not exists public.tamizajes (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes_demo(id) on delete cascade,
  folio text not null unique,
  sistolica int,
  diastolica int,
  glucosa_mgdl int,
  mareos_frecuentes boolean not null default false,
  sed_excesiva boolean not null default false,
  antecedentes_familiares boolean not null default false,
  riesgo text not null check (riesgo in ('bajo', 'medio', 'alto')),
  motivo_riesgo text,
  creado_en timestamptz not null default now()
);

create table if not exists public.casos_navegacion (
  id uuid primary key default gen_random_uuid(),
  tamizaje_id uuid not null references public.tamizajes(id) on delete cascade,
  estado text not null default 'pendiente_revision'
    check (estado in ('pendiente_revision', 'revisado', 'vencido')),
  checklist_ia text,
  checklist_es_simulado boolean not null default true,
  sla_limite timestamptz not null,
  creado_en timestamptz not null default now(),
  unique (tamizaje_id)
);

create table if not exists public.revisiones_navegador (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid not null references public.casos_navegacion(id) on delete cascade,
  navegador_email text not null,
  nota text not null,
  decision text not null
    check (decision in ('confirmar_siguiente_paso', 'derivar', 'pedir_mas_info')),
  opcion_lugar text,
  opcion_ventana_fecha text,
  opcion_rango_precio text,
  creado_en timestamptz not null default now()
);

create table if not exists public.eventos_navegacion (
  id uuid primary key default gen_random_uuid(),
  tipo_evento text not null,
  entidad_tipo text not null,
  entidad_id uuid,
  detalle jsonb,
  creado_en timestamptz not null default now()
);

alter table public.pacientes_demo enable row level security;
alter table public.tamizajes enable row level security;
alter table public.casos_navegacion enable row level security;
alter table public.revisiones_navegador enable row level security;
alter table public.eventos_navegacion enable row level security;

