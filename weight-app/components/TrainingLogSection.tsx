"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/dates";
import { ClipboardList, Plus, Trash2 } from "lucide-react";

type SetRow = { reps: string; weight: string };
type LogEntry = {
  id: string;
  date: string;
  exercise_name: string;
  sets: SetRow[];
};

export default function TrainingLogSection({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(todayISO());
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState<SetRow[]>([{ reps: "", weight: "" }]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("training_logs")
      .select("id, date, exercise_name, sets")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    setLogs((data as LogEntry[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  function addSetRow() {
    setSets((s) => [...s, { reps: "", weight: "" }]);
  }
  function removeSetRow(i: number) {
    setSets((s) => s.filter((_, idx) => idx !== i));
  }
  function updateSet(i: number, field: "reps" | "weight", value: string) {
    setSets((s) => s.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  async function logExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!exerciseName.trim()) return;
    setSaving(true);
    const cleanSets = sets.filter((s) => s.reps || s.weight);
    await supabase.from("training_logs").insert({
      user_id: userId,
      date,
      exercise_name: exerciseName.trim(),
      sets: cleanSets,
    });
    setExerciseName("");
    setSets([{ reps: "", weight: "" }]);
    setSaving(false);
    load();
  }

  async function removeLog(id: string) {
    await supabase.from("training_logs").delete().eq("id", id);
    load();
  }

  // agrupar por fecha para el histórico
  const byDate = logs.reduce<Record<string, LogEntry[]>>((acc, l) => {
    (acc[l.date] ||= []).push(l);
    return acc;
  }, {});
  const dates = Object.keys(byDate).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList size={15} className="text-clay" strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide text-soft">
          Registrar ejercicio
        </p>
      </div>

      <form onSubmit={logExercise} className="space-y-3 mb-5">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Ej: Sentadilla"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {sets.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="font-mono text-xs text-soft w-4">{i + 1}.</span>
              <input
                type="text"
                placeholder="Reps"
                value={s.reps}
                onChange={(e) => updateSet(i, "reps", e.target.value)}
              />
              <input
                type="text"
                placeholder="Peso (kg)"
                value={s.weight}
                onChange={(e) => updateSet(i, "weight", e.target.value)}
              />
              {sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSetRow(i)}
                  className="text-soft hover:text-clay px-1"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={addSetRow}
            className="flex items-center gap-1 text-xs text-soft border border-line rounded-lg px-3 py-1.5 hover:border-clay hover:text-clay transition"
          >
            <Plus size={13} /> Agregar serie
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-4 py-1.5 text-xs"
          >
            {saving ? "Guardando…" : "Guardar ejercicio"}
          </button>
        </div>
      </form>

      <div className="pt-4 border-t border-line">
        <p className="text-xs uppercase tracking-wide text-soft mb-3">
          Histórico
        </p>
        {loading ? (
          <p className="text-sm text-soft">cargando…</p>
        ) : dates.length === 0 ? (
          <p className="text-sm text-soft">
            Todavía no registraste ningún entrenamiento.
          </p>
        ) : (
          <div className="space-y-4">
            {dates.map((d) => (
              <div key={d} className="border-l-2 border-moss pl-3">
                <p className="font-mono text-xs text-ink mb-1">{d}</p>
                {byDate[d].map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between py-1 text-sm"
                  >
                    <span>
                      <strong className="text-ink">{ex.exercise_name}</strong>{" "}
                      <span className="font-mono text-xs text-soft">
                        ·{" "}
                        {ex.sets
                          .map((s) => `${s.reps || "?"}x${s.weight || "?"}kg`)
                          .join(" / ")}
                      </span>
                    </span>
                    <button
                      onClick={() => removeLog(ex.id)}
                      className="text-soft hover:text-clay px-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
