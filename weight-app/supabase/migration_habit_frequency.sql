-- =========================================================
-- Migración: cadencia de hábitos (diario vs. X veces por semana)
-- Ejecutar en Supabase: SQL Editor > New query > Run
-- Es seguro correrla más de una vez (usa "if not exists").
-- =========================================================

alter table habits add column if not exists frequency_type text not null default 'daily' check (frequency_type in ('daily', 'weekly'));
alter table habits add column if not exists target_count integer;
