"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DIETS, MEALS, DISHES, DietId, MealId } from "@/lib/dietData";
import { Salad, Info } from "lucide-react";

export default function DietSection({ userId }: { userId: string }) {
  const [selected, setSelected] = useState<DietId | null>(null);
  const [meal, setMeal] = useState<MealId | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("diet_preferences")
      .select("selected_diet, selected_meal")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) {
      setSelected((data.selected_diet as DietId) || null);
      setMeal((data.selected_meal as MealId) || null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function persist(newSelected: DietId | null, newMeal: MealId | null) {
    await supabase.from("diet_preferences").upsert(
      { user_id: userId, selected_diet: newSelected, selected_meal: newMeal, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  }

  function chooseDiet(id: DietId) {
    setSelected(id);
    persist(id, meal);
  }
  function chooseMeal(id: MealId) {
    setMeal(id);
    persist(selected, id);
  }

  const diet = DIETS.find((d) => d.id === selected);
  const dishes = diet && meal ? DISHES[diet.id][meal] : null;

  if (loading) {
    return (
      <div className="card p-5">
        <p className="text-sm text-soft">cargando…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-5 border-amber/40 bg-amber/10">
        <div className="flex gap-2.5">
          <Info size={16} className="text-amber shrink-0 mt-0.5" />
          <p className="text-xs text-ink leading-relaxed">
            Información general y educativa, no un plan personalizado. Para ajustar cantidades exactas a tu caso,
            consultá con un nutricionista.
          </p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Salad size={15} className="text-clay" strokeWidth={2} />
          <p className="text-xs uppercase tracking-wide text-soft">Elegí un enfoque</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {DIETS.map((d) => (
            <button
              key={d.id}
              onClick={() => chooseDiet(d.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                selected === d.id ? "border-clay bg-clay/10 text-clay" : "border-line text-soft hover:border-soft"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {diet && (
        <div className="card p-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-moss mb-1">{diet.tag}</p>
          <h3 className="font-display text-xl text-ink mb-2">{diet.name}</h3>
          <p className="text-sm text-soft mb-4">{diet.desc}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-soft mb-1">Distribución de macros</p>
              <p className="text-sm text-ink">{diet.macros}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-soft mb-1">Frecuencia de comidas</p>
              <p className="text-sm text-ink">{diet.freq}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wide text-soft mb-1">Cómo armar el plato / porciones</p>
            <p className="text-sm text-ink">{diet.portions}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-soft mb-1">Alimentos de referencia</p>
            <ul className="text-sm text-ink list-disc pl-4 space-y-0.5">
              {diet.foods.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {diet && (
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-soft mb-1">Ejemplos de platos</p>
          <p className="text-sm text-soft mb-4">
            Elegí una comida del día y te mostramos opciones acordes a {diet.name.toLowerCase()}.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {MEALS.map((m) => (
              <button
                key={m.id}
                onClick={() => chooseMeal(m.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  meal === m.id ? "border-clay bg-clay/10 text-clay" : "border-line text-soft hover:border-soft"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {dishes ? (
            <div className="space-y-2">
              {dishes.map((d) => (
                <div key={d} className="border border-line rounded-xl px-3 py-2.5 bg-paper text-sm text-ink">
                  🍽️ {d}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-soft">Elegí una comida para ver opciones.</p>
          )}
        </div>
      )}
    </div>
  );
}
