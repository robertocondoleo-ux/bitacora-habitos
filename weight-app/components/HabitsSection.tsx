"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isoDaysAgo, todayISO, weekStart } from "@/lib/dates";
import { ListChecks, Flame, Check, CalendarDays, Trash2 } from "lucide-react";

const WEEKDAY_LETTERS = ["L", "M", "M", "J", "V", "S", "D"];

type Frequency = "daily" | "weekly";
type Habit = {
  id: string;
  name: string;
  frequency_type: Frequency;
  target_count: number | null;
};
type Log = { habit_id: string; date: string; checked: boolean };

const LOG_WINDOW_DAYS = 120; // suficiente para rachas largas + semana en curso

function addDays(dateISO: string, n: number): string {
  const d = new Date(dateISO + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function HabitsSection({ userId }: { userId: string }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [targetCount, setTargetCount] = useState(3);
  const [loading, setLoading] = useState(true);

  const today = todayISO();
  const monday = useMemo(() => weekStart(today), [today]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(monday, i)), [monday]);

  const load = useCallback(async () => {
    const [{ data: h }, { data: l }] = await Promise.all([
      supabase
        .from("habits")
        .select("id, name, frequency_type, target_count")
        .eq("user_id", userId)
        .eq("active", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("habit_logs")
        .select("habit_id, date, checked")
        .eq("user_id", userId)
        .gte("date", isoDaysAgo(LOG_WINDOW_DAYS)),
    ]);
    setHabits((h as Habit[]) || []);
    setLogs((l as Log[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    await supabase.from("habits").insert({
      user_id: userId,
      name: newHabit.trim(),
      frequency_type: frequency,
      target_count: frequency === "weekly" ? targetCount : null,
    });
    setNewHabit("");
    setFrequency("daily");
    setTargetCount(3);
    load();
  }

  async function removeHabit(id: string) {
    await supabase.from("habits").update({ active: false }).eq("id", id);
    load();
  }

  function isChecked(habitId: string, date: string) {
    return logs.some((l) => l.habit_id === habitId && l.date === date && l.checked);
  }

  async function toggle(habitId: string, date: string) {
    const checked = isChecked(habitId, date);
    setLogs((prev) => {
      const without = prev.filter((l) => !(l.habit_id === habitId && l.date === date));
      return checked ? without : [...without, { habit_id: habitId, date, checked: true }];
    });

    if (checked) {
      await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habitId)
        .eq("date", date)
        .eq("user_id", userId);
    } else {
      await supabase
        .from("habit_logs")
        .upsert({ user_id: userId, habit_id: habitId, date, checked: true }, { onConflict: "habit_id,date" });
    }
  }

  function streakFor(habitId: string): number {
    let cursor = isChecked(habitId, today) ? today : addDays(today, -1);
    let streak = 0;
    while (isChecked(habitId, cursor)) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  function weekProgressFor(habitId: string): number {
    let count = 0;
    let d = monday;
    while (d <= today) {
      if (isChecked(habitId, d)) count++;
      d = addDays(d, 1);
    }
    return count;
  }

  const dailyHabits = habits.filter((h) => h.frequency_type === "daily");
  const weeklyHabits = habits.filter((h) => h.frequency_type === "weekly");
  const todayList = dailyHabits.filter((h) => !isChecked(h.id, today));
  const doneList = dailyHabits.filter((h) => isChecked(h.id, today));

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ListChecks size={15} className="text-clay" strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide text-soft">Hábitos</p>
      </div>

      <form onSubmit={addHabit} className="mb-5 space-y-3">
        <input
          type="text"
          placeholder="Nuevo hábito (ej: Mate, Desayuno, Tomar agua)"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
        />
        <div className="flex items-center gap-2 bg-paper/60 rounded-full p-1">
          <button
            type="button"
            onClick={() => setFrequency("daily")}
            className={`flex-1 text-xs font-semibold py-2 rounded-full transition ${
              frequency === "daily" ? "bg-panel shadow-sm text-ink" : "text-soft"
            }`}
          >
            Todos los días
          </button>
          <button
            type="button"
            onClick={() => setFrequency("weekly")}
            className={`flex-1 text-xs font-semibold py-2 rounded-full transition ${
              frequency === "weekly" ? "bg-panel shadow-sm text-ink" : "text-soft"
            }`}
          >
            X veces por semana
          </button>
        </div>
        {frequency === "weekly" && (
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setTargetCount((n) => Math.max(1, n - 1))}
              className="w-8 h-8 rounded-full bg-panel border border-line press"
            >
              −
            </button>
            <span className="font-display font-extrabold text-sm">
              {targetCount} {targetCount === 1 ? "vez" : "veces"} por semana
            </span>
            <button
              type="button"
              onClick={() => setTargetCount((n) => Math.min(7, n + 1))}
              className="w-8 h-8 rounded-full bg-panel border border-line press"
            >
              +
            </button>
          </div>
        )}
        <button type="submit" className="btn-primary px-4 py-2.5 text-sm w-full">
          Agregar hábito
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : habits.length === 0 ? (
        <p className="text-sm text-soft">Todavía no agregaste hábitos. Sumá el primero arriba.</p>
      ) : (
        <div className="space-y-5">
          {todayList.length > 0 && (
            <HabitGroup label="Hoy">
              {todayList.map((h, i) => (
                <HabitRow
                  key={h.id}
                  habit={h}
                  checked={false}
                  streak={streakFor(h.id)}
                  rotate={i % 2 === 0 ? "-rotate-[0.5deg]" : "rotate-[0.5deg]"}
                  onToggle={() => toggle(h.id, today)}
                  onRemove={() => removeHabit(h.id)}
                  weekDays={weekDays}
                  today={today}
                  isChecked={isChecked}
                  onToggleDate={(d) => toggle(h.id, d)}
                />
              ))}
            </HabitGroup>
          )}

          {weeklyHabits.length > 0 && (
            <HabitGroup label="Esta semana">
              {weeklyHabits.map((h, i) => (
                <WeeklyHabitRow
                  key={h.id}
                  habit={h}
                  progress={weekProgressFor(h.id)}
                  checkedToday={isChecked(h.id, today)}
                  rotate={i % 2 === 0 ? "-rotate-[0.5deg]" : "rotate-[0.5deg]"}
                  onToggle={() => toggle(h.id, today)}
                  onRemove={() => removeHabit(h.id)}
                  weekDays={weekDays}
                  today={today}
                  isChecked={isChecked}
                  onToggleDate={(d) => toggle(h.id, d)}
                />
              ))}
            </HabitGroup>
          )}

          {doneList.length > 0 && (
            <HabitGroup label="Hecho">
              {doneList.map((h, i) => (
                <HabitRow
                  key={h.id}
                  habit={h}
                  checked={true}
                  streak={streakFor(h.id)}
                  rotate={i % 2 === 0 ? "-rotate-[0.5deg]" : "rotate-[0.5deg]"}
                  onToggle={() => toggle(h.id, today)}
                  onRemove={() => removeHabit(h.id)}
                  weekDays={weekDays}
                  today={today}
                  isChecked={isChecked}
                  onToggleDate={(d) => toggle(h.id, d)}
                />
              ))}
            </HabitGroup>
          )}
        </div>
      )}
    </div>
  );
}

function HabitGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-soft mb-2">{label}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

type HistoryProps = {
  weekDays: string[];
  today: string;
  isChecked: (habitId: string, date: string) => boolean;
  onToggleDate: (date: string) => void;
};

function HistoryStrip({
  habitId,
  weekDays,
  today,
  isChecked,
  onToggleDate,
}: HistoryProps & { habitId: string }) {
  return (
    <div className="flex justify-between gap-1.5 mt-3 pt-3 border-t border-dashed border-line">
      {weekDays.map((d, i) => {
        const on = isChecked(habitId, d);
        const isToday = d === today;
        const isFuture = d > today;
        return (
          <div key={d} className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-semibold text-soft">{WEEKDAY_LETTERS[i]}</span>
            <button
              type="button"
              disabled={isFuture}
              onClick={() => onToggleDate(d)}
              aria-label={`${on ? "Desmarcar" : "Marcar"} ${d}`}
              className={`w-7 h-7 rounded-full flex items-center justify-center press transition-all border-2 ${
                on
                  ? "bg-gradient-to-br from-moss to-moss border-transparent text-paper"
                  : isFuture
                  ? "border-line/50 opacity-40"
                  : "border-line"
              } ${isToday ? "ring-2 ring-amber ring-offset-1 ring-offset-panel" : ""}`}
            >
              {on && <Check size={12} strokeWidth={3} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function HabitRow({
  habit,
  checked,
  streak,
  rotate,
  onToggle,
  onRemove,
  weekDays,
  today,
  isChecked,
  onToggleDate,
}: {
  habit: Habit;
  checked: boolean;
  streak: number;
  rotate: string;
  onToggle: () => void;
  onRemove: () => void;
} & HistoryProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`p-3 rounded-[20px] bg-panel/60 border border-line ${rotate}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          aria-label={`Marcar ${habit.name}`}
          className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center press transition-all ${
            checked
              ? "bg-gradient-to-br from-moss to-moss text-paper animate-check-pop"
              : "border-2 border-line"
          }`}
        >
          {checked && <Check size={14} strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`font-display font-bold text-sm truncate ${checked ? "text-soft line-through" : "text-ink"}`}>
            {habit.name}
          </p>
          <p className="text-[11px] text-soft flex items-center gap-1">
            {streak > 0 && <Flame size={11} className="text-clay" strokeWidth={2.4} />}
            {checked ? "Completado hoy" : streak > 0 ? `Todos los días · racha de ${streak}` : "Todos los días"}
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 press transition ${
            open ? "bg-gradient-to-br from-sky to-sky2 text-paper" : "bg-panel border border-line text-soft"
          }`}
          title="Cargar días anteriores"
          aria-label="Cargar días anteriores"
        >
          <CalendarDays size={14} strokeWidth={2.2} />
        </button>
      </div>
      {open && (
        <>
          <HistoryStrip
            habitId={habit.id}
            weekDays={weekDays}
            today={today}
            isChecked={isChecked}
            onToggleDate={onToggleDate}
          />
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 text-[11px] text-soft hover:text-clay mt-3"
          >
            <Trash2 size={12} /> Quitar hábito
          </button>
        </>
      )}
    </div>
  );
}

function WeeklyHabitRow({
  habit,
  progress,
  checkedToday,
  rotate,
  onToggle,
  onRemove,
  weekDays,
  today,
  isChecked,
  onToggleDate,
}: {
  habit: Habit;
  progress: number;
  checkedToday: boolean;
  rotate: string;
  onToggle: () => void;
  onRemove: () => void;
} & HistoryProps) {
  const [open, setOpen] = useState(false);
  const target = habit.target_count ?? 1;
  const met = progress >= target;
  return (
    <div className={`p-3 rounded-[20px] bg-panel/60 border border-line ${rotate}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          aria-label={`Marcar ${habit.name} hoy`}
          className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center press transition-all ${
            checkedToday ? "bg-gradient-to-br from-moss to-moss text-paper animate-check-pop" : "border-2 border-line"
          }`}
        >
          {checkedToday && <Check size={14} strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm text-ink truncate">{habit.name}</p>
          <p className="text-[11px] text-soft">
            {target} {target === 1 ? "vez" : "veces"} por semana · {progress}/{target}
            {met && " · ¡completo! 🎉"}
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 press transition ${
            open ? "bg-gradient-to-br from-sky to-sky2 text-paper" : "bg-panel border border-line text-soft"
          }`}
          title="Cargar días anteriores"
          aria-label="Cargar días anteriores"
        >
          <CalendarDays size={14} strokeWidth={2.2} />
        </button>
      </div>
      <div className="flex gap-1 mt-2 ml-10">
        {Array.from({ length: target }).map((_, i) => (
          <span
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i < progress ? "bg-gradient-to-br from-moss to-moss" : "bg-line"}`}
          />
        ))}
      </div>
      {open && (
        <>
          <HistoryStrip
            habitId={habit.id}
            weekDays={weekDays}
            today={today}
            isChecked={isChecked}
            onToggleDate={onToggleDate}
          />
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 text-[11px] text-soft hover:text-clay mt-3"
          >
            <Trash2 size={12} /> Quitar hábito
          </button>
        </>
      )}
    </div>
  );
}
