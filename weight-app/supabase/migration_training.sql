-- =========================================================
-- Migración: módulo de Entrenamiento
-- Ejecutar UNA VEZ en Supabase: SQL Editor > New query > pegar todo > Run
-- =========================================================

-- Perfil de entrenamiento: objetivos elegidos y días disponibles por semana
create table if not exists training_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  goals text[] not null default '{}',
  days_per_week integer not null default 3,
  updated_at timestamptz default now()
);

-- Ejercicios registrados por día
create table if not exists training_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  exercise_name text not null,
  sets jsonb not null default '[]',
  created_at timestamptz default now()
);

alter table training_profile enable row level security;
alter table training_logs enable row level security;

create policy "training_profile: propio" on training_profile
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "training_logs: propio" on training_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
