-- =========================================================
-- Migración: onboarding (usuario / nutricionista) + aprobación
-- Ejecutar en Supabase: SQL Editor > New query > Run
-- Es seguro correrla más de una vez.
-- =========================================================

alter table profiles add column if not exists onboarded boolean not null default false;
alter table profiles add column if not exists role_request text check (role_request in ('nutricionista'));
alter table profiles add column if not exists is_admin boolean not null default false;

-- Las cuentas que ya existían no tienen que ver la pantalla de bienvenida.
update profiles set onboarded = true where onboarded = false;

-- Marca tu cuenta como administrador (solo vos ves las solicitudes pendientes).
update profiles set is_admin = true where email = 'roberto.condoleo@gmail.com';

-- OJO: el chequeo de is_admin usa una función security definer, no una
-- subconsulta directa a "profiles" (eso causaba un loop infinito de
-- políticas — ver migration_fix_rls_admin.sql).
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
