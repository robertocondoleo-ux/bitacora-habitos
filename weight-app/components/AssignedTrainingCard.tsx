"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DIAS } from "@/lib/trainingPlans";
import { ClipboardCheck } from "lucide-react";

type Assigned = { day_of_week: number; focus: string; exercises: { name: string; target: string }[] };

export default function AssignedTrainingCard({ userId }: { userId: string }) {
  const [days, setDays] = useState<Assigned[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("assigned_training")
      .select("day_of_week, focus, exercises")
      .eq("patient_id", userId);
    setDays((data as Assigned[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || days.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardCheck size={15} className="text-clay" strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide text-soft">Plan asignado por tu entrenador</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {DIAS.map((dayLabel, idx) => {
          const item = days.find((d) => d.day_of_week === idx);
          if (!item || (!item.focus && item.exercises.length === 0)) {
            return (
              <div key={dayLabel} className="rounded-xl p-3 border border-line bg-paper">
                <p className="font-mono text-[10px] text-soft mb-1">{dayLabel.slice(0, 3).toUpperCase()}</p>
                <p className="text-xs font-medium text-ink">Descanso</p>
              </div>
            );
          }
          return (
            <div key={dayLabel} className="rounded-xl p-3 border border-moss bg-moss/10">
              <p className="font-mono text-[10px] text-moss mb-1">{dayLabel.slice(0, 3).toUpperCase()}</p>
              <p className="text-xs font-medium text-ink mb-1">{item.focus || "Ver ejercicios"}</p>
              {item.exercises.length > 0 && (
                <ul className="text-[11px] text-soft space-y-0.5 list-disc pl-3">
                  {item.exercises.map((ex, i) => (
                    <li key={i}>
                      {ex.name} {ex.target && `(${ex.target})`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
