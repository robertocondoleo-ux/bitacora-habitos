-- =========================================================
-- Migración: módulos de Estudios, Dieta y Composición corporal
-- Ejecutar UNA VEZ en Supabase: SQL Editor > New query > pegar todo > Run
-- (Si ya corriste migration_training.sql antes, este archivo es aparte y
-- no lo pisa; podés correr los dos sin problema.)
-- =========================================================

-- Estudios de laboratorio: un registro por análisis, con todos los valores
-- cargados juntos en una sola columna jsonb (ej. {"glucosa": 90, "tsh": 1.25})
create table if not exists study_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  values jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Preferencia de dieta elegida (una fila por usuario, se pisa cada vez que
-- cambia de enfoque o de comida seleccionada)
create table if not exists diet_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  selected_diet text,
  selected_meal text,
  updated_at timestamptz default now()
);

-- Composición corporal: peso, % grasa, % músculo y medidas
create table if not exists body_comp_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  peso numeric,
  grasa numeric,
  musculo numeric,
  cintura numeric,
  cadera numeric,
  brazo numeric,
  pierna numeric,
  created_at timestamptz default now()
);

alter table study_entries enable row level security;
alter table diet_preferences enable row level security;
alter table body_comp_entries enable row level security;

create policy "study_entries: propio" on study_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "diet_preferences: propio" on diet_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "body_comp_entries: propio" on body_comp_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
