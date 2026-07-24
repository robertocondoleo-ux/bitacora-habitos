"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DIAS, ALL_EXERCISES } from "@/lib/trainingPlans";
import { Users, Dumbbell, Plus, Trash2 } from "lucide-react";

type Patient = { linkId: string; id: string; email: string; display_name: string | null; shared: string[]; status: "pending" | "active" };
type ExerciseAssign = { name: string; target: string };
type DayPlan = { dayOfWeek: number; focus: string; exercises: ExerciseAssign[] };

function emptyWeek(): DayPlan[] {
  return DIAS.map((_, i) => ({ dayOfWeek: i, focus: "", exercises: [] }));
}

export default function EntrenadorPatients({ userId }: { userId: string }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [week, setWeek] = useState<DayPlan[]>(emptyWeek());
  const [trainingLogs, setTrainingLogs] = useState<any[]>([]);
  const [openDay, setOpenDay] = useState<number | null>(null);

  const loadPatients = useCallback(async () => {
    const { data: linkRows } = await supabase
      .from("specialist_links")
      .select("id, patient_id, shared_sections, status")
      .eq("specialist_id", userId)
      .eq("specialty", "entrenador");

    const rows = (linkRows as any[]) || [];
    if (rows.length === 0) {
      setPatients([]);
      setLoading(false);
      return;
    }
    const ids = rows.map((r) => r.patient_id);
    const { data: profs } = await supabase.from("profiles").select("id, email, display_name").in("id", ids);
    const byId: Record<string, any> = {};
    (profs || []).forEach((p: any) => (byId[p.id] = p));

    setPatients(
      rows.map((r) => ({
        linkId: r.id,
        id: r.patient_id,
        email: byId[r.patient_id]?.email,
        display_name: byId[r.patient_id]?.display_name,
        shared: r.shared_sections || [],
        status: r.status,
      }))
    );
    setLoading(false);
  }, [userId]);

  async function acceptPatient(linkId: string) {
    await supabase.from("specialist_links").update({ status: "active" }).eq("id", linkId);
    loadPatients();
  }

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  async function selectPatient(p: Patient) {
    setSelected(p);
    setOpenDay(null);

    const { data: assigned } = await supabase
      .from("assigned_training")
      .select("day_of_week, focus, exercises")
      .eq("trainer_id", userId)
      .eq("patient_id", p.id);

    const base = emptyWeek();
    (assigned || []).forEach((a: any) => {
      base[a.day_of_week] = { dayOfWeek: a.day_of_week, focus: a.focus || "", exercises: a.exercises || [] };
    });
    setWeek(base);

    if (p.shared.includes("entrenamiento")) {
      const { data: logs } = await supabase
        .from("training_logs")
        .select("date, exercise_name, sets")
        .eq("user_id", p.id)
        .order("date", { ascending: false })
        .limit(8);
      setTrainingLogs(logs || []);
    } else {
      setTrainingLogs([]);
    }
  }

  function updateFocus(dayIdx: number, value: string) {
    setWeek((w) => w.map((d) => (d.dayOfWeek === dayIdx ? { ...d, focus: value } : d)));
  }
  function addExercise(dayIdx: number) {
    setWeek((w) =>
      w.map((d) => (d.dayOfWeek === dayIdx ? { ...d, exercises: [...d.exercises, { name: "", target: "" }] } : d))
    );
  }
  function updateExercise(dayIdx: number, exIdx: number, field: "name" | "target", value: string) {
    setWeek((w) =>
      w.map((d) =>
        d.dayOfWeek === dayIdx
          ? { ...d, exercises: d.exercises.map((e, i) => (i === exIdx ? { ...e, [field]: value } : e)) }
          : d
      )
    );
  }
  function removeExercise(dayIdx: number, exIdx: number) {
    setWeek((w) =>
      w.map((d) => (d.dayOfWeek === dayIdx ? { ...d, exercises: d.exercises.filter((_, i) => i !== exIdx) } : d))
    );
  }

  async function saveDay(dayIdx: number) {
    if (!selected) return;
    const day = week[dayIdx];
    setSaving(true);
    await supabase.from("assigned_training").upsert(
      {
        trainer_id: userId,
        patient_id: selected.id,
        day_of_week: dayIdx,
        focus: day.focus,
        exercises: day.exercises.filter((e) => e.name.trim()),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "trainer_id,patient_id,day_of_week" }
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
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={15} className="text-clay" strokeWidth={2} />
          <p className="text-xs uppercase tracking-wide text-soft">Tus pacientes</p>
        </div>
        {patients.length === 0 ? (
          <p className="text-sm text-soft">
            Todavía nadie se vinculó con vos como entrenador. Cuando un usuario te agregue desde "Agregar
            especialista", va a aparecer acá.
          </p>
        ) : (
          <div className="space-y-4">
            {patients.some((p) => p.status === "pending") && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-amber mb-2">Solicitudes pendientes</p>
                <div className="space-y-2">
                  {patients
                    .filter((p) => p.status === "pending")
                    .map((p) => (
                      <div
                        key={p.linkId}
                        className="flex items-center justify-between border border-amber/40 bg-amber/10 rounded-xl px-3 py-2.5"
                      >
                        <p className="text-sm text-ink">{p.display_name || p.email}</p>
                        <button onClick={() => acceptPatient(p.linkId)} className="btn-primary px-3 py-1.5 text-xs">
                          Aceptar
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {patients.some((p) => p.status === "active") && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-soft mb-2">Pacientes</p>
                <div className="flex flex-wrap gap-2">
                  {patients
                    .filter((p) => p.status === "active")
                    .map((p) => (
                      <button
                        key={p.linkId}
                        onClick={() => selectPatient(p)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                          selected?.id === p.id
                            ? "border-clay bg-clay/10 text-clay"
                            : "border-line text-soft hover:border-soft"
                        }`}
                      >
                        {p.display_name || p.email}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selected && selected.shared.includes("entrenamiento") && trainingLogs.length > 0 && (
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-soft mb-3">
            Entrenamientos que registró {selected.display_name || selected.email}
          </p>
          <div className="space-y-1.5">
            {trainingLogs.map((l, i) => (
              <div key={i} className="text-sm">
                <span className="font-mono text-xs text-soft">{l.date}</span>{" "}
                <span className="text-ink">{l.exercise_name}</span>{" "}
                <span className="font-mono text-xs text-soft">
                  · {(l.sets || []).map((s: any) => `${s.reps || "?"}x${s.weight || "?"}kg`).join(" / ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell size={15} className="text-clay" strokeWidth={2} />
            <p className="text-xs uppercase tracking-wide text-soft">
              Asignar plan a {selected.display_name || selected.email}
            </p>
          </div>

          <div className="space-y-2">
            {week.map((day) => (
              <div key={day.dayOfWeek} className="border border-line rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenDay(openDay === day.dayOfWeek ? null : day.dayOfWeek)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-left"
                >
                  <span className="text-sm font-medium text-ink">{DIAS[day.dayOfWeek]}</span>
                  <span className="text-xs text-soft">
                    {day.focus || (day.exercises.length ? `${day.exercises.length} ejercicio(s)` : "Sin asignar")}
                  </span>
                </button>

                {openDay === day.dayOfWeek && (
                  <div className="p-3.5 pt-0 space-y-3">
                    <input
                      type="text"
                      placeholder="Foco del día (ej: Empuje, Piernas, Descanso)"
                      value={day.focus}
                      onChange={(e) => updateFocus(day.dayOfWeek, e.target.value)}
                    />

                    <div className="space-y-2">
                      {day.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            list="exercise-suggestions"
                            placeholder="Ejercicio"
                            value={ex.name}
                            onChange={(e) => updateExercise(day.dayOfWeek, i, "name", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Series x reps"
                            value={ex.target}
                            onChange={(e) => updateExercise(day.dayOfWeek, i, "target", e.target.value)}
                            className="w-28"
                          />
                          <button
                            onClick={() => removeExercise(day.dayOfWeek, i)}
                            className="text-soft hover:text-clay px-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addExercise(day.dayOfWeek)}
                        className="flex items-center gap-1 text-xs text-soft border border-line rounded-lg px-3 py-1.5 hover:border-clay hover:text-clay transition"
                      >
                        <Plus size={13} /> Agregar ejercicio
                      </button>
                      <button
                        onClick={() => saveDay(day.dayOfWeek)}
                        disabled={saving}
                        className="btn-primary px-3 py-1.5 text-xs"
                      >
                        {saving ? "Guardando…" : "Guardar día"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <datalist id="exercise-suggestions">
            {ALL_EXERCISES.map((ex) => (
              <option key={ex} value={ex} />
            ))}
          </datalist>
        </div>
      )}
    </div>
  );
}
