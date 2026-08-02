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
    <div className="card p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber to-clay flex items-center justify-center shrink-0">
          <Target size={17} className="text-paper" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-soft font-bold">Meta diaria</p>
          {editing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                step="500"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-24"
                autoFocus
                placeholder="pasos"
              />
              <button onClick={saveGoal} disabled={saving} className="btn-primary text-xs px-3 py-1.5">
                Guardar
              </button>
            </div>
          ) : (
            <p className="font-display font-extrabold text-lg truncate">
              {goal ? `${parseInt(goal, 10).toLocaleString("es-AR")} pasos 🎯` : "Sin definir"}
            </p>
          )}
        </div>
      </div>

      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-sky to-sky2 flex items-center justify-center shrink-0 press"
          aria-label="Editar meta"
        >
          <Pencil size={14} className="text-paper" strokeWidth={2.2} />
        </button>
      )}

      {!loading && average !== null && (
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wide text-soft font-bold">Promedio</p>
          <p className="font-mono font-semibold text-sm">{average.toLocaleString("es-AR")}</p>
        </div>
      )}
    </div>
  );
}
