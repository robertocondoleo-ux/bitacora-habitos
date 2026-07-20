-- =========================================================
-- IMPORTACION DE DATOS HISTORICOS
-- Reemplaza 'TU_USER_ID' mas abajo por tu UUID real de Supabase
-- (Authentication -> Users -> columna UID de tu usuario)
-- Este script se puede correr mas de una vez sin duplicar habitos.
-- =========================================================

do $$
declare
  v_user_id uuid := 'TU_USER_ID';  -- <--- CAMBIAR ESTO
  v_habit_id uuid;
begin

  -- Objetivo de peso (78 kg, segun tu planilla)
  update profiles set goal_weight = 78.0 where id = v_user_id;

  -- Historial de peso
  insert into weights (user_id, date, weight) values (v_user_id, '2025-12-23', 105.0) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2025-12-29', 102.2) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-01-05', 102.7) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-01-12', 100.5) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-01-19', 99.6) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-01-26', 99.1) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-01-31', 98.7) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-02-02', 98.95) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-02-09', 96.4) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-02-16', 94.9) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-02-23', 94.3) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-02-28', 93.3) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-03-02', 92.2) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-03-09', 91.4) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-03-16', 91.0) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-03-23', 90.25) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-03-31', 88.5) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-04-01', 88.5) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-04-06', 88.6) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-04-13', 87.1) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-04-20', 86.4) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-04-27', 85.35) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-04-30', 84.9) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-05-01', 84.95) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-05-04', 84.4) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-05-11', 83.6) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-05-18', 82.6) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-05-25', 82.2) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-05-30', 81.7) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-06-01', 82.2) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-06-08', 82.0) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-06-15', 81.0) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-06-22', 80.0) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-06-29', 79.5) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-06-30', 79.6) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-07-01', 79.6) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-07-06', 80.1) on conflict (user_id, date) do update set weight = excluded.weight;
  insert into weights (user_id, date, weight) values (v_user_id, '2026-07-13', 79.8) on conflict (user_id, date) do update set weight = excluded.weight;

  -- Habito: Desayuno
  select id into v_habit_id from habits where user_id = v_user_id and name = 'Desayuno' limit 1;
  if v_habit_id is null then
    insert into habits (user_id, name) values (v_user_id, 'Desayuno') returning id into v_habit_id;
  end if;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-01', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-02', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-03', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-04', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-05', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-06', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-07', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-08', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-09', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-10', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-11', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-12', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-13', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-14', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-15', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-16', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-17', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-18', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-19', true) on conflict (habit_id, date) do nothing;

  -- Habito: Dientes mañana
  select id into v_habit_id from habits where user_id = v_user_id and name = 'Dientes mañana' limit 1;
  if v_habit_id is null then
    insert into habits (user_id, name) values (v_user_id, 'Dientes mañana') returning id into v_habit_id;
  end if;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-01', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-02', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-03', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-04', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-05', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-09', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-10', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-11', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-13', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-14', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-15', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-16', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-17', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-18', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-19', true) on conflict (habit_id, date) do nothing;

  -- Habito: 2 Litros de agua
  select id into v_habit_id from habits where user_id = v_user_id and name = '2 Litros de agua' limit 1;
  if v_habit_id is null then
    insert into habits (user_id, name) values (v_user_id, '2 Litros de agua') returning id into v_habit_id;
  end if;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-01', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-02', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-03', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-04', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-05', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-06', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-07', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-08', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-09', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-10', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-11', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-12', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-13', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-14', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-15', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-16', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-17', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-18', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-19', true) on conflict (habit_id, date) do nothing;

  -- Habito: Entrenamiento
  select id into v_habit_id from habits where user_id = v_user_id and name = 'Entrenamiento' limit 1;
  if v_habit_id is null then
    insert into habits (user_id, name) values (v_user_id, 'Entrenamiento') returning id into v_habit_id;
  end if;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-10', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-11', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-12', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-13', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-15', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-16', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-17', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-18', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-19', true) on conflict (habit_id, date) do nothing;

  -- Habito: Caminar 10.000 pasos
  select id into v_habit_id from habits where user_id = v_user_id and name = 'Caminar 10.000 pasos' limit 1;
  if v_habit_id is null then
    insert into habits (user_id, name) values (v_user_id, 'Caminar 10.000 pasos') returning id into v_habit_id;
  end if;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-02', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-03', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-06', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-07', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-08', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-09', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-10', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-11', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-13', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-14', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-15', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-16', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-17', true) on conflict (habit_id, date) do nothing;

  -- Habito: Mate
  select id into v_habit_id from habits where user_id = v_user_id and name = 'Mate' limit 1;
  if v_habit_id is null then
    insert into habits (user_id, name) values (v_user_id, 'Mate') returning id into v_habit_id;
  end if;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-01', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-02', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-03', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-04', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-05', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-06', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-07', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-08', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-09', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-10', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-11', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-12', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-13', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-14', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-15', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-16', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-17', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-18', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-19', true) on conflict (habit_id, date) do nothing;

  -- Habito: Comida sana
  select id into v_habit_id from habits where user_id = v_user_id and name = 'Comida sana' limit 1;
  if v_habit_id is null then
    insert into habits (user_id, name) values (v_user_id, 'Comida sana') returning id into v_habit_id;
  end if;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-01', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-02', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-03', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-07', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-08', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-10', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-11', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-12', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-13', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-14', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-16', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-17', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-18', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-19', true) on conflict (habit_id, date) do nothing;

  -- Habito: Creatina
  select id into v_habit_id from habits where user_id = v_user_id and name = 'Creatina' limit 1;
  if v_habit_id is null then
    insert into habits (user_id, name) values (v_user_id, 'Creatina') returning id into v_habit_id;
  end if;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-17', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-18', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-19', true) on conflict (habit_id, date) do nothing;

  -- Habito: Dientes noche
  select id into v_habit_id from habits where user_id = v_user_id and name = 'Dientes noche' limit 1;
  if v_habit_id is null then
    insert into habits (user_id, name) values (v_user_id, 'Dientes noche') returning id into v_habit_id;
  end if;

  -- Habito: Crema pies
  select id into v_habit_id from habits where user_id = v_user_id and name = 'Crema pies' limit 1;
  if v_habit_id is null then
    insert into habits (user_id, name) values (v_user_id, 'Crema pies') returning id into v_habit_id;
  end if;

  -- Habito: Crema brazos
  select id into v_habit_id from habits where user_id = v_user_id and name = 'Crema brazos' limit 1;
  if v_habit_id is null then
    insert into habits (user_id, name) values (v_user_id, 'Crema brazos') returning id into v_habit_id;
  end if;

  -- Habito: Sin gaseosa
  select id into v_habit_id from habits where user_id = v_user_id and name = 'Sin gaseosa' limit 1;
  if v_habit_id is null then
    insert into habits (user_id, name) values (v_user_id, 'Sin gaseosa') returning id into v_habit_id;
  end if;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-01', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-02', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-03', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-04', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-06', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-08', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-10', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-11', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-12', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-13', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-14', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-15', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-16', true) on conflict (habit_id, date) do nothing;
  insert into habit_logs (user_id, habit_id, date, checked) values (v_user_id, v_habit_id, '2026-07-17', true) on conflict (habit_id, date) do nothing;

end $$;