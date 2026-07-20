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
        Promedio de cada mes, cuánto cambió respecto al anterior, y cuánto
        llevás acumulado desde tu peso inicial
        {startingWeight ? ` (${startingWeight} kg)` : ""}.
      </p>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : months.length === 0 ? (
        <p className="text-sm text-soft">
          Todavía no hay suficientes registros de peso.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-soft">
                <th className="font-normal pb-2 pr-3">Mes</th>
                <th className="font-normal pb-2 pr-3">Promedio</th>
                <th className="font-normal pb-2 pr-3">Vs. mes anterior</th>
                <th className="font-normal pb-2">Desde el inicio</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.key} className="border-t border-line">
                  <td className="py-2.5 pr-3 text-ink whitespace-nowrap">
                    {m.label}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-ink">
                    {m.avg.toFixed(1)} kg
                  </td>
                  <td className="py-2.5 pr-3 font-mono">
                    {m.changeVsPrev === null ? (
                      <span className="text-soft">—</span>
                    ) : (
                      <span className={deltaColor(m.changeVsPrev)}>
                        {m.changeVsPrev > 0 ? "+" : ""}
                        {m.changeVsPrev.toFixed(1)} kg
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 font-mono">
                    <span className={deltaColor(m.changeSinceStart)}>
                      {m.changeSinceStart > 0 ? "+" : ""}
                      {m.changeSinceStart.toFixed(1)} kg
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !startingWeight && months.length > 0 && (
        <p className="text-xs text-soft mt-3">
          Cargá tu peso inicial arriba, en la tarjeta de objetivo, para que
          "Desde el inicio" se calcule desde ese valor en vez del primer
          registro.
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
    const key = w.date.slice(0, 7); // "YYYY-MM"
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
