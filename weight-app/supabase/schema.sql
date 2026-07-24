-- =========================================================
-- Esquema para la app de seguimiento de peso y hábitos
-- Ejecutar TODO este archivo en Supabase: SQL Editor > New query > Run
-- =========================================================

create extension if not exists "pgcrypto";

-- Perfil de cada usuario (peso objetivo, etc)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  goal_weight numeric,
  starting_weight numeric,
  steps_goal integer,
  created_at timestamptz default now()
);

-- Por si la tabla ya existía de una instalación anterior sin esta columna.
alter table profiles add column if not exists steps_goal integer;

-- Crea automáticamente un perfil cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Registros de peso
create table if not exists weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  weight numeric not null,
  date date not null default current_date,
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- Hábitos personalizados (ej: "Desayuno", "Mate", "Tomar agua")
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Check diario de cada hábito
create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_id uuid references habits(id) on delete cascade not null,
  date date not null default current_date,
  checked boolean default true,
  unique (habit_id, date)
);

-- Pasos diarios
create table if not exists steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  steps integer not null,
  unique (user_id, date)
);

-- Comidas
create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  meal_type text not null, -- desayuno / almuerzo / merienda / cena / snack
  description text not null,
  created_at timestamptz default now()
);

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

-- =========================================================
-- Seguridad: cada usuario solo ve y edita sus propios datos
-- =========================================================
alter table profiles enable row level security;
alter table weights enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table steps enable row level security;
alter table meals enable row level security;
alter table training_profile enable row level security;
alter table training_logs enable row level security;

create policy "profiles: propio" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "weights: propio" on weights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "habits: propio" on habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "habit_logs: propio" on habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "steps: propio" on steps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meals: propio" on meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "training_profile: propio" on training_profile
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "training_logs: propio" on training_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
