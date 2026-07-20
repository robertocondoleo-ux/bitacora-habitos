"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isoDaysAgo } from "@/lib/dates";
import { Target, Flag, Pencil } from "lucide-react";

type Weight = { date: string; weight: number };

export default function GoalCard({ userId }: { userId: string }) {
  const [goal, setGoal] = useState<string>("");
  const [starting, setStarting] = useState<string>("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [editingStart, setEditingStart] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weights, setWeights] = useState<Weight[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [{ data: profile }, { data: w }] = await Promise.all([
      supabase
        .from("profiles")
        .select("goal_weight, starting_weight")
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
    if (profile?.starting_weight)
      setStarting(String(profile.starting_weight));
    setWeights((w as Weight[]) || []);
    setLoading(false);
    // Si es un usuario nuevo sin peso inicial cargado, abrimos el campo
    // directamente para invitarlo a completarlo.
    if (!profile?.starting_weight) setEditingStart(true);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveField(field: "goal_weight" | "starting_weight", raw: string) {
    setSaving(true);
    const value = raw ? parseFloat(raw) : null;
    await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", userId);
    setSaving(false);
  }

  const trend = computeTrend(weights, goal ? parseFloat(goal) : null);

  return (
    <div className="card p-5">
      <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-4">
        {/* Peso inicial */}
        <div>
          <div className="flex items-center gap-2">
            <Flag size={15} className="text-clay" strokeWidth={2} />
            <p className="text-xs uppercase tracking-wide text-soft">
              Peso inicial
            </p>
          </div>
          {editingStart ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                step="0.1"
                value={starting}
                onChange={(e) => setStarting(e.target.value)}
                className="w-24"
                autoFocus
                placeholder="kg"
              />
              <button
                onClick={async () => {
                  await saveField("starting_weight", starting);
                  setEditingStart(false);
                }}
                disabled={saving}
                className="btn-primary text-sm px-3 py-1.5"
              >
                Guardar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingStart(true)}
              className="group flex items-center gap-1.5 mt-1"
            >
              <span className="font-display text-2xl text-ink">
                {starting ? `${starting} kg` : "Cargar →"}
              </span>
              <Pencil
                size={13}
                className="text-soft opacity-0 group-hover:opacity-100 transition"
              />
            </button>
          )}
        </div>

        {/* Objetivo */}
        <div>
          <div className="flex items-center gap-2">
            <Target size={15} className="text-clay" strokeWidth={2} />
            <p className="text-xs uppercase tracking-wide text-soft">
              Objetivo
            </p>
          </div>
          {editingGoal ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                step="0.1"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-24"
                autoFocus
                placeholder="kg"
              />
              <button
                onClick={async () => {
                  await saveField("goal_weight", goal);
                  setEditingGoal(false);
                }}
                disabled={saving}
                className="btn-primary text-sm px-3 py-1.5"
              >
                Guardar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingGoal(true)}
              className="group flex items-center gap-1.5 mt-1"
            >
              <span className="font-display text-2xl text-ink">
                {goal ? `${goal} kg` : "Definir →"}
              </span>
              <Pencil
                size={13}
                className="text-soft opacity-0 group-hover:opacity-100 transition"
              />
            </button>
          )}
        </div>

        {!loading && (
          <div
            className={`px-4 py-2 rounded-xl text-sm max-w-xs self-center ${trend.color}`}
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
