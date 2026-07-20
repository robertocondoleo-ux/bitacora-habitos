"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Target, Pencil } from "lucide-react";

export default function StepsGoalCard({ userId }: { userId: string }) {
  const [goal, setGoal] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [{ data: profile }, { data: steps }] = await Promise.all([
      supabase
        .from("profiles")
        .select("steps_goal")
        .eq("id", userId)
        .single(),
      supabase.from("steps").select("steps").eq("user_id", userId),
    ]);
    if (profile?.steps_goal) setGoal(String(profile.steps_goal));
    if (steps && steps.length > 0) {
      const avg =
        steps.reduce((sum, s) => sum + s.steps, 0) / steps.length;
      setAverage(Math.round(avg));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveGoal() {
    setSaving(true);
    const value = goal ? parseInt(goal, 10) : null;
    await supabase
      .from("profiles")
      .update({ steps_goal: value })
      .eq("id", userId);
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className="card p-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target size={15} className="text-clay" strokeWidth={2} />
            <p className="text-xs uppercase tracking-wide text-soft">
              Objetivo diario
            </p>
          </div>
          {editing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                step="500"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-28"
                autoFocus
                placeholder="pasos"
              />
              <button
                onClick={saveGoal}
                disabled={saving}
                className="btn-primary text-sm px-3 py-1.5"
              >
                Guardar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="group flex items-center gap-1.5 mt-1"
            >
              <span className="font-display text-2xl text-ink">
                {goal ? `${parseInt(goal, 10).toLocaleString("es-AR")} pasos` : "Definir →"}
              </span>
              <Pencil
                size={13}
                className="text-soft opacity-0 group-hover:opacity-100 transition"
              />
            </button>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-soft">
            Promedio diario
          </p>
          <p className="font-display text-2xl text-ink mt-1">
            {loading
              ? "…"
              : average !== null
              ? `${average.toLocaleString("es-AR")} pasos`
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
