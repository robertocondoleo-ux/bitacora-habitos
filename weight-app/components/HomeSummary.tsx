"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/dates";
import QuickStats from "@/components/QuickStats";
import MoodWaterCard from "@/components/MoodWaterCard";

type HabitToday = { id: string; name: string; checked: boolean };
type NavTarget = "peso" | "pasos" | "habitos";

export default function HomeSummary({
  userId,
  onNavigate,
}: {
  userId: string;
  onNavigate?: (tab: NavTarget) => void;
}) {
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
      <div className="relative rounded-[26px] p-5 flex items-center gap-4 bg-hero border border-clay/20 shadow-lg overflow-hidden">
        <div
          className="absolute w-40 h-40 rounded-full blur-3xl opacity-60 -top-14 -left-10 pointer-events-none"
          style={{ background: "var(--amber)" }}
        />
        <div
          className="absolute w-32 h-32 rounded-full blur-3xl opacity-40 -bottom-10 -right-6 pointer-events-none"
          style={{ background: "var(--moss)" }}
        />
        <svg
          width="84"
          height="84"
          viewBox="0 0 84 84"
          role="img"
          aria-label={`${ring.percent ?? 0} por ciento del camino al objetivo`}
          className="relative shrink-0"
        >
          <circle
            cx="42"
            cy="42"
            r="36"
            fill="none"
            style={{ stroke: "rgba(243,241,231,0.15)" }}
            strokeWidth="8"
          />
          {ring.percent !== null && (
            <circle
              cx="42"
              cy="42"
              r="36"
              fill="none"
              style={{ stroke: "url(#ringGradient)" }}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={226}
              strokeDashoffset={226 - (226 * ring.percent) / 100}
              transform="rotate(-90 42 42)"
            />
          )}
          <defs>
            <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--amber)" />
              <stop offset="100%" stopColor="var(--clay)" />
            </linearGradient>
          </defs>
          <text
            x="42"
            y="38"
            textAnchor="middle"
            style={{ fill: "var(--hero-text)" }}
            fontSize="17"
          >
            {current ? current.toFixed(1) : "—"}
          </text>
          <text x="42" y="53" textAnchor="middle" fill="#9AA38C" fontSize="9">
            kg
          </text>
        </svg>
        <div className="relative">
          <p className="text-xs text-soft m-0">Camino al objetivo</p>
          <p className="font-display font-extrabold text-2xl text-herotext mt-0.5 mb-1.5">
            {ring.percent !== null ? `${ring.percent}%` : "—"}
          </p>
          <p className="text-xs text-amber m-0">{ring.message}</p>
        </div>
      </div>

      <QuickStats userId={userId} onNavigate={onNavigate} />

      <div className="glass-card p-4">
        <p className="text-xs uppercase tracking-wide text-soft mb-3">Hábitos de hoy</p>
        {loading ? (
          <p className="text-sm text-soft">cargando…</p>
        ) : habits.length === 0 ? (
          <p className="text-sm text-soft">
            Todavía no cargaste hábitos. Sumalos en la pestaña "Hábitos".
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {habits.map((h, i) => (
              <span
                key={h.id}
                className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium ${
                  i % 2 === 0 ? "-rotate-[0.5deg]" : "rotate-[0.5deg]"
                } ${
                  h.checked
                    ? "bg-gradient-to-br from-moss to-moss text-paper shadow-sm"
                    : "bg-glass border border-glassborder text-soft"
                }`}
              >
                {h.checked && "✓ "}
                {h.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <MoodWaterCard userId={userId} />
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
