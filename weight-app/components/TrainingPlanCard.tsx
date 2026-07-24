"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dumbbell } from "lucide-react";
import { GOALS, GoalId, DIAS, buildCombinedPlan, PlanDay } from "@/lib/trainingPlans";

export default function TrainingPlanCard({ userId }: { userId: string }) {
  const [goals, setGoals] = useState<GoalId[]>([]);
  const [days, setDays] = useState(3);
  const [plan, setPlan] = useState<PlanDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("training_profile")
      .select("goals, days_per_week")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      const g = (data.goals as GoalId[]) || [];
      const d = data.days_per_week || 3;
      setGoals(g);
      setDays(d);
      if (g.length) setPlan(buildCombinedPlan(g, d));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleGoal(id: GoalId) {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  async function generatePlan() {
    setSaving(true);
    const newPlan = buildCombinedPlan(goals, days);
    setPlan(newPlan);
    await supabase.from("training_profile").upsert(
      { user_id: userId, goals, days_per_week: days, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="card p-5">
        <p className="text-sm text-soft">cargando…</p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell size={15} className="text-clay" strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide text-soft">
          Tu plan de entrenamiento
        </p>
      </div>

      <p className="text-xs text-soft mb-2">Objetivos (elegí uno o varios)</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {GOALS.map((g) => {
          const active = goals.includes(g.id);
          return (
            <button
              key={g.id}
              onClick={() => toggleGoal(g.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                active
                  ? "border-clay bg-clay/10 text-clay"
                  : "border-line text-soft hover:border-soft"
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-soft mb-2">Días disponibles por semana</p>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            key={n}
            onClick={() => setDays(n)}
            className={`w-8 h-8 rounded-full text-xs font-medium border transition ${
              days === n
                ? "border-clay bg-clay/10 text-clay"
                : "border-line text-soft hover:border-soft"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <button
        onClick={generatePlan}
        disabled={saving}
        className="btn-primary px-4 py-2 text-sm w-full sm:w-auto"
      >
        {saving ? "Guardando…" : "Generar distribución semanal"}
      </button>

      {plan && (
        <div className="mt-5 pt-5 border-t border-line">
          <p className="text-xs uppercase tracking-wide text-soft mb-3">
            Tu semana sugerida
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DIAS.map((dayLabel, idx) => {
              const item = plan.find((p) => p.dayIdx === idx);
              return (
                <div
                  key={dayLabel}
                  className={`rounded-xl p-3 border ${
                    item ? "border-moss bg-moss/10" : "border-line bg-paper"
                  }`}
                >
                  <p
                    className={`font-mono text-[10px] mb-1 ${
                      item ? "text-moss" : "text-soft"
                    }`}
                  >
                    {dayLabel.slice(0, 3).toUpperCase()}
                  </p>
                  <p className="text-xs font-medium text-ink mb-1">
                    {item ? item.focus : "Descanso"}
                  </p>
                  {item && (
                    <ul className="text-[11px] text-soft space-y-0.5 list-disc pl-3">
                      {item.exercises.map((ex) => (
                        <li key={ex}>{ex}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
