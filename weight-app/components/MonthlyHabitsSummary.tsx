"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { monthRanges, type MonthRange } from "@/lib/dates";
import { CalendarCheck } from "lucide-react";

type Habit = { id: string; name: string };
type Log = { habit_id: string; date: string };

const MESES_A_MOSTRAR = 6;

export default function MonthlyHabitsSummary({ userId }: { userId: string }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const months = useMemo(() => monthRanges(MESES_A_MOSTRAR), []);

  const load = useCallback(async () => {
    const oldestStart = months[0].startISO;
    const [{ data: h }, { data: l }] = await Promise.all([
      // Todos los hábitos, incluso los que ya no están activos, para no
      // perder el historial de meses anteriores.
      supabase
        .from("habits")
        .select("id, name")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
      supabase
        .from("habit_logs")
        .select("habit_id, date")
        .eq("user_id", userId)
        .eq("checked", true)
        .gte("date", oldestStart),
    ]);
    setHabits((h as Habit[]) || []);
    setLogs((l as Log[]) || []);
    setLoading(false);
  }, [userId, months]);

  useEffect(() => {
    load();
  }, [load]);

  function percentFor(habitId: string, m: MonthRange) {
    const count = logs.filter(
      (l) =>
        l.habit_id === habitId && l.date >= m.startISO && l.date <= m.endISO
    ).length;
    return count / m.totalDays;
  }

  function colorFor(pct: number) {
    if (pct >= 0.75) return "text-moss bg-moss/10";
    if (pct >= 0.5) return "text-amber bg-amber/15";
    return "text-clay bg-clay/10";
  }

  // hábitos que tienen al menos un registro en el rango mostrado, o siguen activos
  const habitsToShow = habits.filter((h) =>
    logs.some((l) => l.habit_id === h.id)
  );

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <CalendarCheck size={15} className="text-clay" strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide text-soft">
          Cumplimiento mensual por hábito
        </p>
      </div>
      <p className="text-xs text-soft mb-4">
        % de días marcados sobre los días transcurridos de cada mes.
      </p>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : habitsToShow.length === 0 ? (
        <p className="text-sm text-soft">
          Todavía no hay suficientes checks para calcular porcentajes
          mensuales.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-normal text-soft pb-2 pr-3">
                  Hábito
                </th>
                {months.map((m) => (
                  <th
                    key={m.key}
                    className="font-normal pb-2 px-1 text-center text-soft"
                  >
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habitsToShow.map((h) => (
                <tr key={h.id} className="border-t border-line">
                  <td className="py-2 pr-3 text-ink whitespace-nowrap">
                    {h.name}
                  </td>
                  {months.map((m) => {
                    const pct = percentFor(h.id, m);
                    return (
                      <td key={m.key} className="text-center px-1 py-2">
                        <span
                          className={`inline-block min-w-[3rem] px-2 py-1 rounded-md font-mono text-xs ${colorFor(
                            pct
                          )}`}
                        >
                          {Math.round(pct * 100)}%
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex gap-4 mt-4 text-xs text-soft">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-moss/40 inline-block" />
              ≥75% excelente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber/40 inline-block" />
              50-74% bien
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-clay/40 inline-block" />
              &lt;50% a mejorar
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
