-- =========================================================
-- Migración: ánimo del día + vasos de agua
-- Ejecutar en Supabase: SQL Editor > New query > Run
-- Es seguro correrla más de una vez (usa "if not exists").
-- =========================================================

create table if not exists daily_wellbeing (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  mood smallint,
  water_glasses smallint default 0,
  unique (user_id, date)
);

alter table daily_wellbeing enable row level security;

drop policy if exists "daily_wellbeing: propio" on daily_wellbeing;
create policy "daily_wellbeing: propio" on daily_wellbeing
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
