-- =========================================================
-- Migración: metas de nutricionista, notas privadas, recetarios en
-- PDF, y lista de súper con sugerencias.
-- Ejecutar en Supabase: SQL Editor > New query > Run
-- Es seguro correrla más de una vez.
-- =========================================================

-- 1) Metas: reutiliza la tabla "habits" de siempre. Si assigned_by
--    tiene un valor, es una meta puesta por un nutricionista (se ve
--    y se completa igual que cualquier hábito propio).
alter table habits add column if not exists assigned_by uuid references auth.users(id) on delete set null;

drop policy if exists "habits: especialista asigna meta" on habits;
create policy "habits: especialista asigna meta" on habits
  for insert with check (
    assigned_by = auth.uid()
    and exists (
      select 1 from specialist_links sl
      where sl.patient_id = habits.user_id and sl.specialist_id = auth.uid()
        and sl.status = 'active' and 'habitos' = any(sl.shared_sections)
    )
  );

drop policy if exists "habits: especialista edita metas propias" on habits;
create policy "habits: especialista edita metas propias" on habits
  for update using (assigned_by = auth.uid()) with check (assigned_by = auth.uid());

-- 2) Notas privadas del nutricionista sobre un paciente. A propósito NO
--    hay ninguna policy que deje ver esto al paciente.
create table if not exists specialist_notes (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid references auth.users(id) on delete cascade not null,
  patient_id uuid references auth.users(id) on delete cascade not null,
  note text not null,
  updated_at timestamptz default now(),
  unique (specialist_id, patient_id)
);
alter table specialist_notes enable row level security;

drop policy if exists "specialist_notes: especialista gestiona las suyas" on specialist_notes;
create policy "specialist_notes: especialista gestiona las suyas" on specialist_notes
  for all using (auth.uid() = specialist_id) with check (auth.uid() = specialist_id);

-- 3) Recetarios en PDF: se suma a la tabla "recipes" que ya existía
--    (antes solo texto). file_url queda null si es una recomendación
--    de texto común.
alter table recipes add column if not exists file_url text;
alter table recipes add column if not exists file_name text;

insert into storage.buckets (id, name, public)
values ('recipe-files', 'recipe-files', true)
on conflict (id) do nothing;

drop policy if exists "recipe-files: nutricionista sube propio" on storage.objects;
create policy "recipe-files: nutricionista sube propio" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'recipe-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "recipe-files: nutricionista borra propio" on storage.objects;
create policy "recipe-files: nutricionista borra propio" on storage.objects
  for delete to authenticated
  using (bucket_id = 'recipe-files' and (storage.foldername(name))[1] = auth.uid()::text);

-- 4) Lista de súper del paciente + sugerencias del nutricionista.
create table if not exists shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  item text not null,
  checked boolean not null default false,
  suggested_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);
alter table shopping_list_items enable row level security;

drop policy if exists "shopping_list_items: propio" on shopping_list_items;
create policy "shopping_list_items: propio" on shopping_list_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "shopping_list_items: especialista sugiere" on shopping_list_items;
create policy "shopping_list_items: especialista sugiere" on shopping_list_items
  for insert with check (
    suggested_by = auth.uid()
    and exists (
      select 1 from specialist_links sl
      where sl.patient_id = shopping_list_items.user_id and sl.specialist_id = auth.uid()
        and sl.status = 'active' and 'comidas' = any(sl.shared_sections)
    )
  );

drop policy if exists "shopping_list_items: especialista ve si fue compartido" on shopping_list_items;
create policy "shopping_list_items: especialista ve si fue compartido" on shopping_list_items
  for select using (exists (
    select 1 from specialist_links sl
    where sl.patient_id = shopping_list_items.user_id and sl.specialist_id = auth.uid()
      and sl.status = 'active' and 'comidas' = any(sl.shared_sections)
  ));
