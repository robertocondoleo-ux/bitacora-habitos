-- Corré esto UNA VEZ en el SQL Editor de Supabase para agregar el
-- objetivo de pasos diarios a tu base ya existente.
alter table profiles add column if not exists steps_goal integer;
