"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SHARABLE_SECTIONS, SectionId } from "@/lib/specialistData";
import { todayISO, weekStart } from "@/lib/dates";
import {
  Users,
  ChefHat,
  Trash2,
  Target,
  Plus,
  Lock,
  FileText,
  ShoppingCart,
  Upload,
  Flame,
} from "lucide-react";

type Patient = {
  linkId: string;
  id: string;
  email: string;
  display_name: string | null;
  shared: SectionId[];
  status: "pending" | "active";
};
type Recipe = {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
};
type Goal = {
  id: string;
  name: string;
  frequency_type: "daily" | "weekly";
  target_count: number | null;
};
type Log = { habit_id: string; date: string; checked: boolean };
type ShoppingItem = { id: string; item: string; checked: boolean; suggested_by: string | null };

const TABS = [
  { id: "metas", label: "Metas", icon: Target },
  { id: "historico", label: "Histórico", icon: Users },
  { id: "notas", label: "Notas", icon: Lock },
  { id: "recetarios", label: "Recetarios", icon: ChefHat },
  { id: "super", label: "Súper", icon: ShoppingCart },
] as const;
type TabId = (typeof TABS)[number]["id"];

function addDays(dateISO: string, n: number): string {
  const d = new Date(dateISO + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function NutricionistaPatients({ userId }: { userId: string }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("metas");
  const [loading, setLoading] = useState(true);

  const loadPatients = useCallback(async () => {
    const { data: linkRows } = await supabase
      .from("specialist_links")
      .select("id, patient_id, shared_sections, status")
      .eq("specialist_id", userId)
      .eq("specialty", "nutricionista");

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

  function selectPatient(p: Patient) {
    setSelected(p);
    setActiveTab("metas");
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
            Todavía nadie se vinculó con vos como nutricionista. Cuando un usuario te agregue desde "Agregar
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

      {selected && (
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-soft mb-1">
            {selected.display_name || selected.email}
          </p>
          <p className="text-[11px] text-soft mb-4">
            Te comparte:{" "}
            {selected.shared.length
              ? selected.shared.map((s) => SHARABLE_SECTIONS.find((x) => x.id === s)?.label).join(", ")
              : "nada todavía"}
          </p>

          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  activeTab === t.id ? "border-clay bg-clay/10 text-clay" : "border-line text-soft"
                }`}
              >
                <t.icon size={13} /> {t.label}
              </button>
            ))}
          </div>

          {activeTab === "metas" && <GoalsTab specialistId={userId} patient={selected} />}
          {activeTab === "historico" && <HistoricoTab patient={selected} />}
          {activeTab === "notas" && <NotesTab specialistId={userId} patientId={selected.id} />}
          {activeTab === "recetarios" && <RecipesTab specialistId={userId} patientId={selected.id} />}
          {activeTab === "super" && <SuperTab specialistId={userId} patient={selected} />}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// METAS: reutiliza la tabla habits, filtrando por assigned_by = vos.
// ---------------------------------------------------------------
function GoalsTab({ specialistId, patient }: { specialistId: string; patient: Patient }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [targetCount, setTargetCount] = useState(3);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const canAssign = patient.shared.includes("habitos");
  const today = todayISO();
  const monday = weekStart(today);

  const load = useCallback(async () => {
    const [{ data: g }, { data: l }] = await Promise.all([
      supabase
        .from("habits")
        .select("id, name, frequency_type, target_count")
        .eq("user_id", patient.id)
        .eq("assigned_by", specialistId)
        .eq("active", true),
      supabase
        .from("habit_logs")
        .select("habit_id, date, checked")
        .eq("user_id", patient.id)
        .gte("date", addDays(today, -60)),
    ]);
    setGoals((g as Goal[]) || []);
    setLogs((l as Log[]) || []);
    setLoading(false);
  }, [patient.id, specialistId, today]);

  useEffect(() => {
    load();
  }, [load]);

  function isChecked(habitId: string, date: string) {
    return logs.some((l) => l.habit_id === habitId && l.date === date && l.checked);
  }

  function streakFor(habitId: string): number {
    let cursor = isChecked(habitId, today) ? today : addDays(today, -1);
    let streak = 0;
    while (isChecked(habitId, cursor)) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  function weekProgressFor(habitId: string): number {
    let count = 0;
    let d = monday;
    while (d <= today) {
      if (isChecked(habitId, d)) count++;
      d = addDays(d, 1);
    }
    return count;
  }

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("habits").insert({
      user_id: patient.id,
      name: name.trim(),
      frequency_type: frequency,
      target_count: frequency === "weekly" ? targetCount : null,
      assigned_by: specialistId,
    });
    setName("");
    setFrequency("daily");
    setTargetCount(3);
    setSaving(false);
    load();
  }

  async function removeGoal(id: string) {
    await supabase.from("habits").update({ active: false }).eq("id", id);
    load();
  }

  if (!canAssign) {
    return (
      <p className="text-sm text-soft">
        {patient.display_name || patient.email} todavía no te comparte "Hábitos" — pedile que lo active desde su
        cuenta para poder ponerle metas.
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={addGoal} className="space-y-2 mb-5">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nueva meta (ej: Tomar 2L de agua)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" disabled={saving} className="btn-primary px-4 text-sm whitespace-nowrap">
            {saving ? "…" : "Asignar"}
          </button>
        </div>
        <div className="flex items-center gap-2 bg-paper/60 rounded-full p-1">
          <button
            type="button"
            onClick={() => setFrequency("daily")}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-full transition ${
              frequency === "daily" ? "bg-panel shadow-sm text-ink" : "text-soft"
            }`}
          >
            Todos los días
          </button>
          <button
            type="button"
            onClick={() => setFrequency("weekly")}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-full transition ${
              frequency === "weekly" ? "bg-panel shadow-sm text-ink" : "text-soft"
            }`}
          >
            X veces por semana
          </button>
        </div>
        {frequency === "weekly" && (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setTargetCount((n) => Math.max(1, n - 1))}
              className="w-7 h-7 rounded-full bg-panel border border-line press text-sm"
            >
              −
            </button>
            <span className="text-xs font-semibold">{targetCount} veces por semana</span>
            <button
              type="button"
              onClick={() => setTargetCount((n) => Math.min(7, n + 1))}
              className="w-7 h-7 rounded-full bg-panel border border-line press text-sm"
            >
              +
            </button>
          </div>
        )}
      </form>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : goals.length === 0 ? (
        <p className="text-sm text-soft">Todavía no le pusiste ninguna meta.</p>
      ) : (
        <div className="space-y-2">
          {goals.map((g) => {
            const isWeekly = g.frequency_type === "weekly";
            const progress = isWeekly ? weekProgressFor(g.id) : streakFor(g.id);
            const target = g.target_count ?? 7;
            const pct = isWeekly ? Math.min(100, Math.round((progress / target) * 100)) : Math.min(100, progress * 10);
            return (
              <div key={g.id} className="p-3 rounded-2xl bg-panel/60 border border-line">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-ink">{g.name}</p>
                  <button onClick={() => removeGoal(g.id)} className="text-soft hover:text-clay shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="h-1.5 bg-line rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-moss to-moss rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-soft mt-1 flex items-center gap-1">
                  {isWeekly ? (
                    `${progress}/${target} esta semana`
                  ) : (
                    <>
                      <Flame size={11} className="text-clay" /> racha de {progress}
                    </>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// HISTÓRICO: peso, composición, comidas y dieta compartidos.
// ---------------------------------------------------------------
function HistoricoTab({ patient }: { patient: Patient }) {
  const [weights, setWeights] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [dietPref, setDietPref] = useState<any>(null);
  const [bodyComp, setBodyComp] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (patient.shared.includes("peso")) {
        const { data } = await supabase
          .from("weights")
          .select("date, weight")
          .eq("user_id", patient.id)
          .order("date", { ascending: false })
          .limit(5);
        setWeights(data || []);
      } else setWeights([]);

      if (patient.shared.includes("comidas")) {
        const { data } = await supabase
          .from("meals")
          .select("date, meal_type, description, photo_url")
          .eq("user_id", patient.id)
          .order("date", { ascending: false })
          .limit(5);
        setMeals(data || []);
      } else setMeals([]);

      if (patient.shared.includes("dieta")) {
        const { data } = await supabase
          .from("diet_preferences")
          .select("selected_diet, selected_meal")
          .eq("user_id", patient.id)
          .maybeSingle();
        setDietPref(data);
      } else setDietPref(null);

      if (patient.shared.includes("composicion")) {
        const { data } = await supabase
          .from("body_comp_entries")
          .select("date, peso, grasa, musculo")
          .eq("user_id", patient.id)
          .order("date", { ascending: false })
          .limit(5);
        setBodyComp(data || []);
      } else setBodyComp([]);

      setLoading(false);
    })();
  }, [patient]);

  if (loading) return <p className="text-sm text-soft">cargando…</p>;

  const nothingShared = !patient.shared.length;

  return (
    <div className="space-y-4">
      {nothingShared && <p className="text-sm text-soft">No te comparte ninguna sección todavía.</p>}

      {patient.shared.includes("peso") && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-soft mb-1">Últimos pesos</p>
          {weights.length === 0 ? (
            <p className="text-xs text-soft">Sin registros.</p>
          ) : (
            <div className="space-y-1">
              {weights.map((w, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="font-mono text-xs text-soft">{w.date}</span>
                  <span className="text-ink">{w.weight} kg</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {patient.shared.includes("composicion") && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-soft mb-1">Composición corporal</p>
          {bodyComp.length === 0 ? (
            <p className="text-xs text-soft">Sin registros.</p>
          ) : (
            <div className="space-y-1">
              {bodyComp.map((b, i) => (
                <div key={i} className="flex justify-between text-sm font-mono text-xs">
                  <span className="text-soft">{b.date}</span>
                  <span className="text-ink">
                    {b.peso ?? "—"}kg · {b.grasa ?? "—"}% grasa · {b.musculo ?? "—"}% músculo
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {patient.shared.includes("comidas") && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-soft mb-1">Últimas comidas</p>
          {meals.length === 0 ? (
            <p className="text-xs text-soft">Sin registros.</p>
          ) : (
            <div className="space-y-2">
              {meals.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {m.photo_url && (
                    <img src={m.photo_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  )}
                  <div>
                    <span className="font-mono text-xs text-soft">{m.date}</span>{" "}
                    <span className="text-ink">
                      {m.meal_type}: {m.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {patient.shared.includes("dieta") && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-soft mb-1">Enfoque de dieta elegido</p>
          <p className="text-sm text-ink">
            {dietPref?.selected_diet
              ? `${dietPref.selected_diet}${dietPref.selected_meal ? " · viendo " + dietPref.selected_meal : ""}`
              : "Todavía no eligió."}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// NOTAS: privadas, el paciente nunca las ve (no hay policy que se lo permita).
// ---------------------------------------------------------------
function NotesTab({ specialistId, patientId }: { specialistId: string; patientId: string }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("specialist_notes")
      .select("note, updated_at")
      .eq("specialist_id", specialistId)
      .eq("patient_id", patientId)
      .maybeSingle()
      .then(({ data }) => {
        setNote(data?.note || "");
        setSavedAt(data?.updated_at || null);
        setLoading(false);
      });
  }, [specialistId, patientId]);

  async function save() {
    setSaving(true);
    await supabase
      .from("specialist_notes")
      .upsert(
        { specialist_id: specialistId, patient_id: patientId, note, updated_at: new Date().toISOString() },
        { onConflict: "specialist_id,patient_id" }
      );
    setSaving(false);
    setSavedAt(new Date().toISOString());
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-purple-500">
        <Lock size={11} /> Solo vos ves esto — el paciente nunca accede a esta pestaña
      </div>
      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : (
        <>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={6}
            placeholder="Notas de consulta, observaciones, recordatorios para vos…"
            className="w-full text-sm p-3 rounded-xl border border-line bg-panel resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <button onClick={save} disabled={saving} className="btn-primary px-4 py-2 text-sm">
              {saving ? "Guardando…" : "Guardar nota"}
            </button>
            {savedAt && <p className="text-[10px] text-soft">Guardado {new Date(savedAt).toLocaleString("es-AR")}</p>}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// RECETARIOS: texto y/o PDF adjunto.
// ---------------------------------------------------------------
function RecipesTab({ specialistId, patientId }: { specialistId: string; patientId: string }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("recipes")
      .select("id, title, description, file_url, file_name, created_at")
      .eq("author_id", specialistId)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    setRecipes((data as Recipe[]) || []);
    setLoading(false);
  }, [specialistId, patientId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addRecipe(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    let file_url: string | null = null;
    let file_name: string | null = null;
    if (file) {
      const path = `${specialistId}/${crypto.randomUUID()}.pdf`;
      const { error } = await supabase.storage.from("recipe-files").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });
      if (!error) {
        file_url = supabase.storage.from("recipe-files").getPublicUrl(path).data.publicUrl;
        file_name = file.name;
      }
    }
    await supabase.from("recipes").insert({
      author_id: specialistId,
      patient_id: patientId,
      title: title.trim(),
      description: description.trim() || null,
      file_url,
      file_name,
    });
    setTitle("");
    setDescription("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaving(false);
    load();
  }

  async function removeRecipe(id: string) {
    await supabase.from("recipes").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <form onSubmit={addRecipe} className="space-y-3 mb-5">
        <input
          type="text"
          placeholder="Título (ej: Plan semana 1)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Ingredientes, preparación, o cualquier indicación… (opcional si adjuntás PDF)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full text-sm p-2.5 rounded-lg border border-line bg-panel resize-none"
        />
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            id="recipe-pdf-input"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label
            htmlFor="recipe-pdf-input"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-line text-soft press cursor-pointer"
          >
            <Upload size={13} /> {file ? file.name : "Adjuntar PDF (opcional)"}
          </label>
          {file && (
            <button type="button" onClick={() => setFile(null)} className="text-xs text-clay">
              Quitar
            </button>
          )}
        </div>
        <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-sm">
          {saving ? "Guardando…" : "Publicar para este paciente"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : recipes.length === 0 ? (
        <p className="text-sm text-soft">Todavía no publicaste nada para este paciente.</p>
      ) : (
        <div className="space-y-2">
          {recipes.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-2 p-3 rounded-xl bg-panel/60 border border-line">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{r.title}</p>
                {r.description && <p className="text-xs text-soft mt-0.5">{r.description}</p>}
                {r.file_url && (
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-clay mt-1"
                  >
                    <FileText size={12} /> {r.file_name || "Ver PDF"}
                  </a>
                )}
              </div>
              <button onClick={() => removeRecipe(r.id)} className="text-soft hover:text-clay shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// SÚPER: ver la lista del paciente + sugerirle ítems.
// ---------------------------------------------------------------
function SuperTab({ specialistId, patient }: { specialistId: string; patient: Patient }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [suggestion, setSuggestion] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const canSee = patient.shared.includes("comidas");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("shopping_list_items")
      .select("id, item, checked, suggested_by")
      .eq("user_id", patient.id)
      .order("created_at", { ascending: true });
    setItems((data as ShoppingItem[]) || []);
    setLoading(false);
  }, [patient.id]);

  useEffect(() => {
    if (canSee) load();
    else setLoading(false);
  }, [canSee, load]);

  async function suggest(e: React.FormEvent) {
    e.preventDefault();
    if (!suggestion.trim()) return;
    setSaving(true);
    await supabase
      .from("shopping_list_items")
      .insert({ user_id: patient.id, item: suggestion.trim(), suggested_by: specialistId });
    setSuggestion("");
    setSaving(false);
    load();
  }

  if (!canSee) {
    return (
      <p className="text-sm text-soft">
        {patient.display_name || patient.email} todavía no te comparte "Comidas" — pedile que lo active para poder
        ver y sugerirle ítems en su lista del súper.
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={suggest} className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder="Sugerir algo (ej: Palta, avena…)"
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
        />
        <button type="submit" disabled={saving} className="btn-primary px-4 text-sm whitespace-nowrap">
          <Plus size={15} />
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-soft">La lista está vacía.</p>
      ) : (
        <div className="space-y-2">
          {items.map((i) => (
            <div
              key={i.id}
              className={`flex items-center gap-3 p-3 rounded-2xl border ${
                i.suggested_by ? "bg-sky/10 border-sky/30" : "bg-panel/60 border-line"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md shrink-0 border-2 flex items-center justify-center text-[10px] ${
                  i.checked ? "bg-gradient-to-br from-moss to-moss border-transparent text-paper" : "border-line"
                }`}
              >
                {i.checked && "✓"}
              </span>
              <p className={`text-sm ${i.checked ? "text-soft line-through" : "text-ink"}`}>{i.item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
