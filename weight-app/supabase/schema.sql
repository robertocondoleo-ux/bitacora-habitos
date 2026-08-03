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
  -- 'daily': todos los días. 'weekly': target_count veces por semana (no importa qué días).
  frequency_type text not null default 'daily' check (frequency_type in ('daily', 'weekly')),
  target_count integer,
  created_at timestamptz default now()
);

-- Por si la tabla ya existía de una instalación anterior sin estas columnas.
alter table habits add column if not exists frequency_type text not null default 'daily' check (frequency_type in ('daily', 'weekly'));
alter table habits add column if not exists target_count integer;

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

-- Ánimo del día + vasos de agua
create table if not exists daily_wellbeing (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  mood smallint,
  water_glasses smallint default 0,
  unique (user_id, date)
);

-- Comidas
create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  meal_type text not null, -- desayuno / almuerzo / merienda / cena / snack
  description text not null,
  photo_url text,
  created_at timestamptz default now()
);

-- Bucket público para fotos de comidas (cada usuario sube/borra solo
-- dentro de su propia carpeta, identificada por su user_id).
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', true)
on conflict (id) do nothing;

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

-- Estudios de laboratorio
create table if not exists study_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  values jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Preferencia de dieta elegida
create table if not exists diet_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  selected_diet text,
  selected_meal text,
  updated_at timestamptz default now()
);

-- Composición corporal
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

-- =========================================================
-- Seguridad: cada usuario solo ve y edita sus propios datos
-- =========================================================
alter table profiles enable row level security;
alter table weights enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table steps enable row level security;
alter table daily_wellbeing enable row level security;
alter table meals enable row level security;
alter table training_profile enable row level security;
alter table training_logs enable row level security;
alter table study_entries enable row level security;
alter table diet_preferences enable row level security;
alter table body_comp_entries enable row level security;

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

create policy "daily_wellbeing: propio" on daily_wellbeing
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meals: propio" on meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meal-photos: subir propio" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "meal-photos: borrar propio" on storage.objects
  for delete to authenticated
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "training_profile: propio" on training_profile
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "training_logs: propio" on training_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "study_entries: propio" on study_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "diet_preferences: propio" on diet_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "body_comp_entries: propio" on body_comp_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- =========================================================
-- Migración: roles (usuario / nutricionista / entrenador),
-- vínculo paciente-especialista, recetas y entrenamiento asignado.
-- Ejecutar UNA VEZ en Supabase: SQL Editor > New query > pegar todo > Run
-- =========================================================

-- 1) Rol de cuenta. Por default todos son "usuario" (nadie cambia sin querer).
alter table profiles add column if not exists role text not null default 'usuario'
  check (role in ('usuario','nutricionista','entrenador'));
alter table profiles add column if not exists display_name text;

-- Onboarding (pantalla de bienvenida la primera vez) + solicitud de
-- rol nutricionista pendiente de aprobación + cuenta administradora.
alter table profiles add column if not exists onboarded boolean not null default false;
alter table profiles add column if not exists role_request text check (role_request in ('nutricionista'));
alter table profiles add column if not exists is_admin boolean not null default false;
update profiles set is_admin = true where email = 'roberto.condoleo@gmail.com';

-- 2) Vínculo entre un paciente y su especialista, con qué secciones comparte.
create table if not exists specialist_links (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id) on delete cascade not null,
  specialist_id uuid references auth.users(id) on delete cascade not null,
  specialty text not null check (specialty in ('nutricionista','entrenador')),
  shared_sections text[] not null default '{}',
  status text not null default 'pending',
  created_at timestamptz default now(),
  unique (patient_id, specialist_id)
);

-- 3) Recetas / recomendaciones que un nutricionista le deja a un paciente.
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade not null,
  patient_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  type text not null default 'recomendacion', -- 'recomendacion' | 'receta'
  created_at timestamptz default now()
);

-- 4) Ejercicios que un entrenador asigna a un paciente, por día de la semana
--    (0 = Lunes ... 6 = Domingo).
create table if not exists assigned_training (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references auth.users(id) on delete cascade not null,
  patient_id uuid references auth.users(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  focus text,
  exercises jsonb not null default '[]',
  updated_at timestamptz default now(),
  unique (trainer_id, patient_id, day_of_week)
);

alter table specialist_links enable row level security;
alter table recipes enable row level security;
alter table assigned_training enable row level security;

-- El paciente controla su propio vínculo (crearlo, editar qué comparte, borrarlo).
create policy "specialist_links: paciente gestiona" on specialist_links
  for all using (auth.uid() = patient_id) with check (auth.uid() = patient_id);
-- El especialista puede ver (no editar salvo el estado) los vínculos donde es el especialista.
create policy "specialist_links: especialista ve" on specialist_links
  for select using (auth.uid() = specialist_id);
-- Aceptar/rechazar una solicitud es la única edición permitida del lado del especialista.
create policy "specialist_links: especialista actualiza estado" on specialist_links
  for update using (auth.uid() = specialist_id) with check (auth.uid() = specialist_id);

create policy "recipes: nutricionista gestiona las suyas" on recipes
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "recipes: paciente ve las suyas" on recipes
  for select using (auth.uid() = patient_id);

create policy "assigned_training: entrenador gestiona" on assigned_training
  for all using (auth.uid() = trainer_id) with check (auth.uid() = trainer_id);
create policy "assigned_training: paciente ve lo suyo" on assigned_training
  for select using (auth.uid() = patient_id);

-- 5) Para que "Ver pacientes" pueda mostrar el histórico compartido, cada
--    tabla necesita una policy extra de lectura para especialistas, que solo
--    deja pasar si hay un vínculo activo y esa sección fue compartida.

create policy "weights: especialista ve si fue compartido" on weights
  for select using (exists (
    select 1 from specialist_links sl
    where sl.patient_id = weights.user_id and sl.specialist_id = auth.uid()
      and sl.status = 'active' and 'peso' = any(sl.shared_sections)
  ));

create policy "steps: especialista ve si fue compartido" on steps
  for select using (exists (
    select 1 from specialist_links sl
    where sl.patient_id = steps.user_id and sl.specialist_id = auth.uid()
      and sl.status = 'active' and 'pasos' = any(sl.shared_sections)
  ));

create policy "habits: especialista ve si fue compartido" on habits
  for select using (exists (
    select 1 from specialist_links sl
    where sl.patient_id = habits.user_id and sl.specialist_id = auth.uid()
      and sl.status = 'active' and 'habitos' = any(sl.shared_sections)
  ));

create policy "habit_logs: especialista ve si fue compartido" on habit_logs
  for select using (exists (
    select 1 from specialist_links sl
    where sl.patient_id = habit_logs.user_id and sl.specialist_id = auth.uid()
      and sl.status = 'active' and 'habitos' = any(sl.shared_sections)
  ));

create policy "meals: especialista ve si fue compartido" on meals
  for select using (exists (
    select 1 from specialist_links sl
    where sl.patient_id = meals.user_id and sl.specialist_id = auth.uid()
      and sl.status = 'active' and 'comidas' = any(sl.shared_sections)
  ));

create policy "training_logs: especialista ve si fue compartido" on training_logs
  for select using (exists (
    select 1 from specialist_links sl
    where sl.patient_id = training_logs.user_id and sl.specialist_id = auth.uid()
      and sl.status = 'active' and 'entrenamiento' = any(sl.shared_sections)
  ));

create policy "training_profile: especialista ve si fue compartido" on training_profile
  for select using (exists (
    select 1 from specialist_links sl
    where sl.patient_id = training_profile.user_id and sl.specialist_id = auth.uid()
      and sl.status = 'active' and 'entrenamiento' = any(sl.shared_sections)
  ));

create policy "study_entries: especialista ve si fue compartido" on study_entries
  for select using (exists (
    select 1 from specialist_links sl
    where sl.patient_id = study_entries.user_id and sl.specialist_id = auth.uid()
      and sl.status = 'active' and 'estudios' = any(sl.shared_sections)
  ));

create policy "diet_preferences: especialista ve si fue compartido" on diet_preferences
  for select using (exists (
    select 1 from specialist_links sl
    where sl.patient_id = diet_preferences.user_id and sl.specialist_id = auth.uid()
      and sl.status = 'active' and 'dieta' = any(sl.shared_sections)
  ));

create policy "body_comp_entries: especialista ve si fue compartido" on body_comp_entries
  for select using (exists (
    select 1 from specialist_links sl
    where sl.patient_id = body_comp_entries.user_id and sl.specialist_id = auth.uid()
      and sl.status = 'active' and 'composicion' = any(sl.shared_sections)
  ));

-- 6) Los usuarios necesitan poder listar perfiles por rol (para el buscador
--    de "Agregar especialista"), pero SOLO de cuentas nutricionista/entrenador
--    — nunca de otros usuarios normales.
create policy "profiles: buscar especialistas" on profiles
  for select using (role in ('nutricionista', 'entrenador'));

-- 7) La cuenta administradora ve y aprueba/rechaza solicitudes de rol
--    nutricionista de cualquier cuenta.
create policy "profiles: admin ve todos" on profiles
  for select using (
    exists (select 1 from profiles me where me.id = auth.uid() and me.is_admin = true)
  );

create policy "profiles: admin actualiza roles" on profiles
  for update using (
    exists (select 1 from profiles me where me.id = auth.uid() and me.is_admin = true)
  );
