"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/dates";
import QuickStats from "@/components/QuickStats";

type HabitToday = { id: string; name: string; checked: boolean };

export default function HomeSummary({ userId }: { userId: string }) {
  const [current, setCurrent] = useState<number | null>(null);
  const [starting, setStarting] = useState<number | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [habits, setHabits] = useState<HabitToday[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const today = todayISO();
    const [{ data: profile }, { data: weights }, { data: activeHabits }, { data: logs }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("starting_weight, goal_weight")
          .eq("id", userId)
          .single(),
        supabase
          .from("weights")
          .select("weight")
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .limit(1),
        supabase
          .from("habits")
          .select("id, name")
          .eq("user_id", userId)
          .eq("active", true)
          .order("created_at", { ascending: true }),
        supabase
          .from("habit_logs")
          .select("habit_id")
          .eq("user_id", userId)
          .eq("date", today)
          .eq("checked", true),
      ]);

    setStarting(profile?.starting_weight ?? null);
    setGoal(profile?.goal_weight ?? null);
    setCurrent(weights && weights.length > 0 ? weights[0].weight : null);

    const checkedIds = new Set((logs || []).map((l) => l.habit_id));
    setHabits(
      (activeHabits || []).map((h) => ({
        id: h.id,
        name: h.name,
        checked: checkedIds.has(h.id),
      }))
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const ring = computeRing(current, starting, goal);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 flex items-center gap-4 bg-ink">
        <svg
          width="84"
          height="84"
          viewBox="0 0 84 84"
          role="img"
          aria-label={`${ring.percent ?? 0} por ciento del camino al objetivo`}
        >
          <circle
            cx="42"
            cy="42"
            r="36"
            fill="none"
            stroke="rgba(246,243,236,0.15)"
            strokeWidth="8"
          />
          {ring.percent !== null && (
            <circle
              cx="42"
              cy="42"
              r="36"
              fill="none"
              stroke="#D9A441"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={226}
              strokeDashoffset={226 - (226 * ring.percent) / 100}
              transform="rotate(-90 42 42)"
            />
          )}
          <text
            x="42"
            y="38"
            textAnchor="middle"
            fill="#F6F3EC"
            fontSize="17"
          >
            {current ? current.toFixed(1) : "—"}
          </text>
          <text x="42" y="53" textAnchor="middle" fill="#8A8577" fontSize="9">
            kg
          </text>
        </svg>
        <div>
          <p className="text-xs text-soft m-0">Camino al objetivo</p>
          <p className="font-display text-2xl text-paper mt-0.5 mb-1.5">
            {ring.percent !== null ? `${ring.percent}%` : "—"}
          </p>
          <p className="text-xs text-amber m-0">{ring.message}</p>
        </div>
      </div>

      <QuickStats userId={userId} />

      <div className="card p-4">
        <p className="text-xs text-soft mb-3">Hábitos de hoy</p>
        {loading ? (
          <p className="text-sm text-soft">cargando…</p>
        ) : habits.length === 0 ? (
          <p className="text-sm text-soft">
            Todavía no cargaste hábitos. Sumalos en la pestaña "Hábitos".
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {habits.map((h) => (
              <span
                key={h.id}
                className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                  h.checked
                    ? "bg-moss text-paper"
                    : "bg-paper text-soft border border-line"
                }`}
              >
                {h.checked && "✓ "}
                {h.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function computeRing(
  current: number | null,
  starting: number | null,
  goal: number | null
) {
  if (current === null) {
    return { percent: null, message: "Cargá tu peso de hoy para empezar." };
  }
  if (starting === null || goal === null || starting === goal) {
    return {
      percent: null,
      message: "Definí peso inicial y objetivo en la pestaña Peso.",
    };
  }

  const total = starting - goal;
  const progress = starting - current;
  const raw = (progress / total) * 100;
  const percent = Math.max(0, Math.min(100, Math.round(raw)));

  const remaining = Math.abs(current - goal);
  const message =
    remaining < 0.1
      ? "¡Llegaste a tu objetivo!"
      : `Faltan ${remaining.toFixed(1)} kg`;

  return { percent, message };
}
