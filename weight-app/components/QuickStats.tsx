"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/dates";
import { Scale, TrendingDown, Footprints, CheckCircle2, ChevronRight } from "lucide-react";

type NavTarget = "peso" | "pasos" | "habitos";

export default function QuickStats({
  userId,
  onNavigate,
}: {
  userId: string;
  onNavigate?: (tab: NavTarget) => void;
}) {
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
      iconBg: "bg-gradient-to-br from-amber to-clay",
      rotate: "-rotate-[0.6deg]",
      target: "peso" as NavTarget,
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
      iconBg: "bg-gradient-to-br from-moss to-moss",
      rotate: "rotate-[0.6deg]",
      target: "peso" as NavTarget,
    },
    {
      icon: Footprints,
      label: "Pasos hoy",
      value: stepsToday !== null ? stepsToday.toLocaleString("es-AR") : "—",
      iconBg: "bg-gradient-to-br from-sky to-sky2",
      rotate: "-rotate-[0.4deg]",
      target: "pasos" as NavTarget,
    },
    {
      icon: CheckCircle2,
      label: "Hábitos hoy",
      value: habitsTotal > 0 ? `${habitsDone}/${habitsTotal}` : "—",
      iconBg: "bg-gradient-to-br from-amber to-clay",
      rotate: "rotate-[0.4deg]",
      target: "habitos" as NavTarget,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {stats.map((s) => (
        <button
          key={s.label}
          onClick={() => onNavigate?.(s.target)}
          className={`stat-chip ${s.rotate} press text-left ${onNavigate ? "cursor-pointer" : ""}`}
        >
          <div className={`stat-chip-icon ${s.iconBg}`}>
            <s.icon size={15} strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wide text-soft mb-0.5 truncate">{s.label}</p>
            <p className={`font-mono font-semibold text-[15px] ${s.valueColor || "text-ink"}`}>
              {s.value}
            </p>
          </div>
          {onNavigate && <ChevronRight size={14} className="text-soft shrink-0" />}
        </button>
      ))}
    </div>
  );
}
