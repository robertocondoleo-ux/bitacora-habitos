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

drop policy if exists "profiles: admin ve todos" on profiles;
create policy "profiles: admin ve todos" on profiles
  for select using (
    exists (select 1 from profiles me where me.id = auth.uid() and me.is_admin = true)
  );

drop policy if exists "profiles: admin actualiza roles" on profiles;
create policy "profiles: admin actualiza roles" on profiles
  for update using (
    exists (select 1 from profiles me where me.id = auth.uid() and me.is_admin = true)
  );
