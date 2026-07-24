-- =========================================================
-- Migración: roles (usuario / nutricionista / entrenador),
-- vínculo paciente-especialista, recetas y entrenamiento asignado.
-- Ejecutar UNA VEZ en Supabase: SQL Editor > New query > pegar todo > Run
-- =========================================================

-- 1) Rol de cuenta. Por default todos son "usuario" (nadie cambia sin querer).
alter table profiles add column if not exists role text not null default 'usuario'
  check (role in ('usuario','nutricionista','entrenador'));
alter table profiles add column if not exists display_name text;

-- 2) Vínculo entre un paciente y su especialista, con qué secciones comparte.
create table if not exists specialist_links (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id) on delete cascade not null,
  specialist_id uuid references auth.users(id) on delete cascade not null,
  specialty text not null check (specialty in ('nutricionista','entrenador')),
  shared_sections text[] not null default '{}',
  status text not null default 'active',
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
-- El especialista puede ver (no editar) los vínculos donde es el especialista.
create policy "specialist_links: especialista ve" on specialist_links
  for select using (auth.uid() = specialist_id);

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

-- 6) Los especialistas necesitan poder listar perfiles por rol (para el
--    buscador de "Agregar especialista"). Se expone lo mínimo: id, email,
--    display_name y role — nada sensible.
create policy "profiles: cualquiera logueado puede buscar especialistas" on profiles
  for select using (auth.role() = 'authenticated');
