"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isoDaysAgo, formatShort, todayISO } from "@/lib/dates";

type Habit = { id: string; name: string };
type Log = { habit_id: string; date: string; checked: boolean };

export default function HabitsSection({ userId }: { userId: string }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => {
    const arr: string[] = [];
    for (let i = 6; i >= 0; i--) arr.push(isoDaysAgo(i));
    return arr;
  }, []);

  const load = useCallback(async () => {
    const [{ data: h }, { data: l }] = await Promise.all([
      supabase
        .from("habits")
        .select("id, name")
        .eq("user_id", userId)
        .eq("active", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("habit_logs")
        .select("habit_id, date, checked")
        .eq("user_id", userId)
        .gte("date", isoDaysAgo(6)),
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
    await supabase
      .from("habits")
      .insert({ user_id: userId, name: newHabit.trim() });
    setNewHabit("");
    load();
  }

  async function removeHabit(id: string) {
    await supabase.from("habits").update({ active: false }).eq("id", id);
    load();
  }

  function isChecked(habitId: string, date: string) {
    return logs.some(
      (l) => l.habit_id === habitId && l.date === date && l.checked
    );
  }

  async function toggle(habitId: string, date: string) {
    const checked = isChecked(habitId, date);
    // actualización optimista
    setLogs((prev) => {
      const without = prev.filter(
        (l) => !(l.habit_id === habitId && l.date === date)
      );
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
      await supabase.from("habit_logs").upsert(
        { user_id: userId, habit_id: habitId, date, checked: true },
        { onConflict: "habit_id,date" }
      );
    }
  }

  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-soft mb-3">
        Hábitos diarios
      </p>

      <form onSubmit={addHabit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nuevo hábito (ej: Mate, Desayuno, Tomar agua)"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
        />
        <button
          type="submit"
          className="bg-ink text-paper px-4 rounded-lg text-sm whitespace-nowrap"
        >
          Agregar
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : habits.length === 0 ? (
        <p className="text-sm text-soft">
          Todavía no agregaste hábitos. Sumá el primero arriba.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-normal text-soft pb-2 pr-2">
                  Hábito
                </th>
                {days.map((d) => (
                  <th
                    key={d}
                    className={`font-normal pb-2 px-1 text-center ${
                      d === todayISO() ? "text-clay" : "text-soft"
                    }`}
                  >
                    {formatShort(d)}
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h.id} className="border-t border-line">
                  <td className="py-2 pr-2 text-ink">{h.name}</td>
                  {days.map((d) => (
                    <td key={d} className="text-center px-1">
                      <button
                        onClick={() => toggle(h.id, d)}
                        aria-label={`${h.name} ${d}`}
                        className={`w-6 h-6 rounded-md border transition ${
                          isChecked(h.id, d)
                            ? "bg-moss border-moss"
                            : "bg-panel border-line hover:border-soft"
                        }`}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      onClick={() => removeHabit(h.id)}
                      className="text-xs text-soft hover:text-clay px-2"
                      title="Quitar hábito"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
