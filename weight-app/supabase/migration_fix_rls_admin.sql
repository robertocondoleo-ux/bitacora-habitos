-- =========================================================
-- FIX urgente: las políticas de admin en "profiles" quedaron
-- auto-referenciadas y Postgres tira "infinite recursion detected
-- in policy for relation profiles". Eso hace fallar en silencio
-- cualquier lectura del perfil (peso inicial, objetivo, meta de
-- pasos aparecían vacíos aunque el dato seguía en la base).
--
-- Ejecutar en Supabase: SQL Editor > New query > Run
-- Es seguro correrla más de una vez.
-- =========================================================

-- Función que chequea is_admin corriendo con permisos propios
-- (security definer), así NO vuelve a pasar por las políticas de
-- "profiles" y no se genera el loop.
create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

drop policy if exists "profiles: admin ve todos" on profiles;
create policy "profiles: admin ve todos" on profiles
  for select using (public.is_admin_user());

drop policy if exists "profiles: admin actualiza roles" on profiles;
create policy "profiles: admin actualiza roles" on profiles
  for update using (public.is_admin_user());
