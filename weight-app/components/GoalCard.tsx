"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isoDaysAgo } from "@/lib/dates";

type Weight = { date: string; weight: number };

export default function GoalCard({ userId }: { userId: string }) {
  const [goal, setGoal] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weights, setWeights] = useState<Weight[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [{ data: profile }, { data: w }] = await Promise.all([
      supabase
        .from("profiles")
        .select("goal_weight")
        .eq("id", userId)
        .single(),
      supabase
        .from("weights")
        .select("date, weight")
        .eq("user_id", userId)
        .gte("date", isoDaysAgo(60))
        .order("date", { ascending: true }),
    ]);
    if (profile?.goal_weight) setGoal(String(profile.goal_weight));
    setWeights((w as Weight[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveGoal() {
    setSaving(true);
    const value = goal ? parseFloat(goal) : null;
    await supabase
      .from("profiles")
      .update({ goal_weight: value })
      .eq("id", userId);
    setSaving(false);
    setEditing(false);
  }

  const trend = computeTrend(weights, goal ? parseFloat(goal) : null);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-soft">
            Objetivo de peso
          </p>
          {editing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                step="0.1"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-28"
                autoFocus
              />
              <span className="text-sm text-soft">kg</span>
              <button
                onClick={saveGoal}
                disabled={saving}
                className="text-sm bg-ink text-paper px-3 py-1.5 rounded-lg"
              >
                Guardar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="font-display text-2xl text-ink mt-1"
            >
              {goal ? `${goal} kg` : "Definir objetivo →"}
            </button>
          )}
        </div>

        {!loading && (
          <div
            className={`px-4 py-2 rounded-lg text-sm max-w-xs ${trend.color}`}
          >
            {trend.message}
          </div>
        )}
      </div>
    </div>
  );
}

function computeTrend(weights: Weight[], goal: number | null) {
  if (weights.length < 4) {
    return {
      message:
        "Cargá más registros de peso (al menos 2 semanas) para ver cómo venís.",
      color: "bg-line/60 text-soft",
    };
  }

  const last = weights[weights.length - 1];
  const recentWindow = weights.filter(
    (w) => w.date >= isoDaysAgo(7)
  );
  const priorWindow = weights.filter(
    (w) => w.date >= isoDaysAgo(14) && w.date < isoDaysAgo(7)
  );

  if (recentWindow.length === 0 || priorWindow.length === 0) {
    return {
      message:
        "Todavía no hay suficientes semanas cargadas para comparar la tendencia.",
      color: "bg-line/60 text-soft",
    };
  }

  const avg = (arr: Weight[]) =>
    arr.reduce((s, w) => s + w.weight, 0) / arr.length;

  const recentAvg = avg(recentWindow);
  const priorAvg = avg(priorWindow);
  const delta = recentAvg - priorAvg;

  if (!goal) {
    return {
      message: `Últimos 7 días: ${
        delta > 0 ? "+" : ""
      }${delta.toFixed(1)} kg respecto a la semana anterior. Definí un objetivo para recibir sugerencias.`,
      color: "bg-line/60 text-soft",
    };
  }

  const wantsToLose = goal < last.weight - 0.2;
  const wantsToGain = goal > last.weight + 0.2;
  const wantsToMaintain = !wantsToLose && !wantsToGain;

  if (wantsToMaintain) {
    if (Math.abs(delta) <= 0.4) {
      return {
        message: "Estable y cerca de tu objetivo. Vas bien, seguí así.",
        color: "bg-moss/10 text-moss",
      };
    }
    return {
      message: `Te estás alejando del objetivo (${
        delta > 0 ? "+" : ""
      }${delta.toFixed(1)} kg esta semana). Puede valer la pena ajustar algo.`,
      color: "bg-clay/10 text-clay",
    };
  }

  if (wantsToLose) {
    if (delta < -0.05) {
      return {
        message: `Bajando de a poco (${delta.toFixed(
          1
        )} kg esta semana vs la anterior). Vas en el camino correcto.`,
        color: "bg-moss/10 text-moss",
      };
    }
    return {
      message:
        "El peso no bajó (o subió) esta semana respecto a la anterior. Puede convenir ajustar comidas, pasos o hábitos.",
      color: "bg-clay/10 text-clay",
    };
  }

  // wantsToGain
  if (delta > 0.05) {
    return {
      message: `Subiendo de a poco (${delta > 0 ? "+" : ""}${delta.toFixed(
        1
      )} kg esta semana). Vas bien hacia el objetivo.`,
      color: "bg-moss/10 text-moss",
    };
  }
  return {
    message:
      "El peso no subió esta semana. Si tu objetivo es ganar, revisá ingesta o entrenamiento.",
    color: "bg-clay/10 text-clay",
  };
}
