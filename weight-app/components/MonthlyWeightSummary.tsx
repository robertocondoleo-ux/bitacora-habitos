"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Scale } from "lucide-react";

type Weight = { date: string; weight: number };
type MonthStat = {
  key: string;
  label: string;
  avg: number;
  changeVsPrev: number | null;
  changeSinceStart: number;
};

export default function MonthlyWeightSummary({ userId }: { userId: string }) {
  const [weights, setWeights] = useState<Weight[]>([]);
  const [startingWeight, setStartingWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [{ data: profile }, { data: w }] = await Promise.all([
      supabase
        .from("profiles")
        .select("starting_weight")
        .eq("id", userId)
        .single(),
      supabase
        .from("weights")
        .select("date, weight")
        .eq("user_id", userId)
        .order("date", { ascending: true }),
    ]);
    setStartingWeight(profile?.starting_weight ?? null);
    setWeights((w as Weight[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const months = buildMonthStats(weights, startingWeight);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Scale size={15} className="text-clay" strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide text-soft">
          Peso por mes
        </p>
      </div>
      <p className="text-xs text-soft mb-4">
        Promedio de cada mes y cuánto llevás acumulado desde tu peso inicial
        {startingWeight ? ` (${startingWeight} kg)` : ""}.
      </p>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : months.length === 0 ? (
        <p className="text-sm text-soft">
          Todavía no hay suficientes registros de peso.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {months.map((m) => (
            <div
              key={m.key}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{m.label}</p>
                {m.changeVsPrev !== null && (
                  <p className={`text-xs mt-0.5 ${deltaColor(m.changeVsPrev)}`}>
                    {m.changeVsPrev > 0 ? "+" : ""}
                    {m.changeVsPrev.toFixed(1)} kg vs. mes anterior
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-sm text-ink">
                  {m.avg.toFixed(1)} kg
                </p>
                <p className={`text-xs mt-0.5 ${deltaColor(m.changeSinceStart)}`}>
                  {m.changeSinceStart > 0 ? "+" : ""}
                  {m.changeSinceStart.toFixed(1)} kg desde el inicio
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !startingWeight && months.length > 0 && (
        <p className="text-xs text-soft mt-3">
          Cargá tu peso inicial en la tarjeta de objetivo para que "desde el
          inicio" se calcule desde ese valor en vez del primer registro.
        </p>
      )}
    </div>
  );
}

function deltaColor(delta: number) {
  if (delta < -0.05) return "text-moss";
  if (delta > 0.05) return "text-clay";
  return "text-soft";
}

function buildMonthStats(
  weights: Weight[],
  startingWeight: number | null
): MonthStat[] {
  if (weights.length === 0) return [];

  const byMonth = new Map<string, number[]>();
  for (const w of weights) {
    const key = w.date.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(w.weight);
  }

  const keys = Array.from(byMonth.keys()).sort();
  const baseline = startingWeight ?? average(byMonth.get(keys[0])!);

  let prevAvg: number | null = null;
  const stats: MonthStat[] = keys.map((key) => {
    const avg = average(byMonth.get(key)!);
    const changeVsPrev = prevAvg === null ? null : avg - prevAvg;
    prevAvg = avg;
    return {
      key,
      label: monthLabel(key),
      avg,
      changeVsPrev,
      changeSinceStart: avg - baseline,
    };
  });

  return stats;
}

function average(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  const label = d.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
