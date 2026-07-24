-- =========================================================
-- Migración correctiva: vínculo con aceptación del especialista +
-- directorio de "Agregar especialista" restringido solo a
-- nutricionista/entrenador.
-- Ejecutar UNA VEZ en Supabase: SQL Editor > New query > pegar todo > Run
-- =========================================================

-- 1) Los vínculos existentes que quedaron en 'active' automáticamente por la
--    versión anterior pasan a 'pending', para que el especialista los tenga
--    que aceptar como corresponde. Si ya estabas usando algún vínculo de
--    prueba y no querés perderlo, comentá esta línea antes de correr todo.
update specialist_links set status = 'pending' where status = 'active';

-- 2) De acá en más, todo vínculo nuevo nace 'pending' por defecto.
alter table specialist_links alter column status set default 'pending';

-- 3) El especialista ahora puede actualizar el estado (aceptar) del vínculo,
--    algo que antes no podía hacer (solo lo podía ver).
drop policy if exists "specialist_links: especialista actualiza estado" on specialist_links;
create policy "specialist_links: especialista actualiza estado" on specialist_links
  for update using (auth.uid() = specialist_id) with check (auth.uid() = specialist_id);

-- 4) El directorio de "Agregar especialista" queda restringido: un usuario
--    logueado solo puede ver cuentas nutricionista/entrenador, nunca a otros
--    usuarios normales.
drop policy if exists "profiles: cualquiera logueado puede buscar especialistas" on profiles;
drop policy if exists "profiles: buscar especialistas" on profiles;
create policy "profiles: buscar especialistas" on profiles
  for select using (role in ('nutricionista', 'entrenador'));
