-- =========================================================
-- Migración: fotos en Comidas
-- Ejecutar en Supabase: SQL Editor > New query > Run
-- Es seguro correrla más de una vez.
-- =========================================================

alter table meals add column if not exists photo_url text;

-- Bucket público para las fotos (cada usuario solo puede subir/borrar
-- dentro de su propia carpeta, identificada por su user_id).
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', true)
on conflict (id) do nothing;

drop policy if exists "meal-photos: subir propio" on storage.objects;
create policy "meal-photos: subir propio" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "meal-photos: borrar propio" on storage.objects;
create policy "meal-photos: borrar propio" on storage.objects
  for delete to authenticated
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
