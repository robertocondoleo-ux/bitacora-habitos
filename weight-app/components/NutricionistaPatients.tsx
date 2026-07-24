"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SHARABLE_SECTIONS, SectionId } from "@/lib/specialistData";
import { Users, ChefHat, Trash2 } from "lucide-react";

type Patient = { linkId: string; id: string; email: string; display_name: string | null; shared: SectionId[]; status: "pending" | "active" };
type Recipe = { id: string; title: string; description: string | null; created_at: string };

export default function NutricionistaPatients({ userId }: { userId: string }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const [weights, setWeights] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [dietPref, setDietPref] = useState<any>(null);
  const [bodyComp, setBodyComp] = useState<any[]>([]);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

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

  const loadPatientData = useCallback(async (p: Patient) => {
    if (p.shared.includes("peso")) {
      const { data } = await supabase
        .from("weights")
        .select("date, weight")
        .eq("user_id", p.id)
        .order("date", { ascending: false })
        .limit(5);
      setWeights(data || []);
    } else setWeights([]);

    if (p.shared.includes("comidas")) {
      const { data } = await supabase
        .from("meals")
        .select("date, meal_type, description")
        .eq("user_id", p.id)
        .order("date", { ascending: false })
        .limit(5);
      setMeals(data || []);
    } else setMeals([]);

    if (p.shared.includes("dieta")) {
      const { data } = await supabase
        .from("diet_preferences")
        .select("selected_diet, selected_meal")
        .eq("user_id", p.id)
        .maybeSingle();
      setDietPref(data);
    } else setDietPref(null);

    if (p.shared.includes("composicion")) {
      const { data } = await supabase
        .from("body_comp_entries")
        .select("date, peso, grasa, musculo")
        .eq("user_id", p.id)
        .order("date", { ascending: false })
        .limit(5);
      setBodyComp(data || []);
    } else setBodyComp([]);

    const { data: rec } = await supabase
      .from("recipes")
      .select("id, title, description, created_at")
      .eq("author_id", userId)
      .eq("patient_id", p.id)
      .order("created_at", { ascending: false });
    setRecipes((rec as Recipe[]) || []);
  }, [userId]);

  function selectPatient(p: Patient) {
    setSelected(p);
    loadPatientData(p);
  }

  async function addRecipe(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !title.trim()) return;
    setSaving(true);
    await supabase
      .from("recipes")
      .insert({ author_id: userId, patient_id: selected.id, title: title.trim(), description: description.trim() || null });
    setTitle("");
    setDescription("");
    setSaving(false);
    loadPatientData(selected);
  }

  async function removeRecipe(id: string) {
    await supabase.from("recipes").delete().eq("id", id);
    if (selected) loadPatientData(selected);
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
        <>
          <div className="card p-5">
            <p className="text-xs uppercase tracking-wide text-soft mb-1">
              {selected.display_name || selected.email}
            </p>
            <p className="text-[11px] text-soft mb-4">
              Te comparte: {selected.shared.length ? selected.shared.map((s) => SHARABLE_SECTIONS.find((x) => x.id === s)?.label).join(", ") : "nada todavía"}
            </p>

            {selected.shared.includes("peso") && (
              <div className="mb-4">
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

            {selected.shared.includes("composicion") && (
              <div className="mb-4">
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

            {selected.shared.includes("comidas") && (
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wide text-soft mb-1">Últimas comidas</p>
                {meals.length === 0 ? (
                  <p className="text-xs text-soft">Sin registros.</p>
                ) : (
                  <div className="space-y-1">
                    {meals.map((m, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-mono text-xs text-soft">{m.date}</span>{" "}
                        <span className="text-ink">
                          {m.meal_type}: {m.description}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selected.shared.includes("dieta") && (
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

          <form onSubmit={addRecipe} className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ChefHat size={15} className="text-clay" strokeWidth={2} />
              <p className="text-xs uppercase tracking-wide text-soft">Dejar recomendación / receta</p>
            </div>
            <input
              type="text"
              placeholder="Título (ej: Bowl de pollo y quinoa)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-3"
            />
            <textarea
              placeholder="Ingredientes, preparación, o cualquier indicación…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full mb-3 text-sm p-2.5 rounded-lg border border-line bg-panel"
            />
            <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-sm">
              {saving ? "Guardando…" : "Publicar para este paciente"}
            </button>

            {recipes.length > 0 && (
              <div className="mt-5 pt-4 border-t border-line space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-soft mb-2">Ya publicado</p>
                {recipes.map((r) => (
                  <div key={r.id} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-ink">{r.title}</p>
                      {r.description && <p className="text-xs text-soft">{r.description}</p>}
                    </div>
                    <button onClick={() => removeRecipe(r.id)} className="text-soft hover:text-clay shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}
