"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/dates";
import { Scale, TrendingDown, Footprints, CheckCircle2 } from "lucide-react";

export default function QuickStats({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [totalChange, setTotalChange] = useState<number | null>(null);
  const [stepsToday, setStepsToday] = useState<number | null>(null);
  const [habitsDone, setHabitsDone] = useState(0);
  const [habitsTotal, setHabitsTotal] = useState(0);

  const load = useCallback(async () => {
    const today = todayISO();

    const [{ data: weights }, { data: steps }, { data: habits }, { data: logs }, { data: profile }] =
      await Promise.all([
        supabase
          .from("weights")
          .select("date, weight")
          .eq("user_id", userId)
          .order("date", { ascending: true }),
        supabase
          .from("steps")
          .select("steps")
          .eq("user_id", userId)
          .eq("date", today)
          .maybeSingle(),
        supabase
          .from("habits")
          .select("id")
          .eq("user_id", userId)
          .eq("active", true),
        supabase
          .from("habit_logs")
          .select("habit_id")
          .eq("user_id", userId)
          .eq("date", today)
          .eq("checked", true),
        supabase
          .from("profiles")
          .select("starting_weight")
          .eq("id", userId)
          .single(),
      ]);

    if (weights && weights.length > 0) {
      const latest = weights[weights.length - 1].weight;
      const baseline = profile?.starting_weight ?? weights[0].weight;
      setCurrentWeight(latest);
      setTotalChange(latest - baseline);
    }
    setStepsToday(steps ? (steps as { steps: number }).steps : null);
    setHabitsTotal((habits || []).length);
    setHabitsDone((logs || []).length);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return null;

  const stats = [
    {
      icon: Scale,
      label: "Peso actual",
      value: currentWeight ? `${currentWeight.toFixed(1)} kg` : "—",
    },
    {
      icon: TrendingDown,
      label: "Cambio total",
      value:
        totalChange === null
          ? "—"
          : `${totalChange > 0 ? "+" : ""}${totalChange.toFixed(1)} kg`,
      valueColor:
        totalChange !== null && totalChange < 0
          ? "text-moss"
          : totalChange !== null && totalChange > 0
          ? "text-clay"
          : "text-ink",
    },
    {
      icon: Footprints,
      label: "Pasos hoy",
      value: stepsToday !== null ? stepsToday.toLocaleString("es-AR") : "—",
    },
    {
      icon: CheckCircle2,
      label: "Hábitos hoy",
      value: habitsTotal > 0 ? `${habitsDone}/${habitsTotal}` : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="stat-card p-4">
          <s.icon size={16} className="text-clay mb-2" strokeWidth={2} />
          <p className="text-xs text-soft mb-0.5">{s.label}</p>
          <p
            className={`font-display text-xl ${s.valueColor || "text-ink"}`}
          >
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
