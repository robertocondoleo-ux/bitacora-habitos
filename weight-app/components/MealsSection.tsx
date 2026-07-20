"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO, isoDaysAgo, formatShort } from "@/lib/dates";

type Meal = {
  id: string;
  date: string;
  meal_type: string;
  description: string;
};

const TIPOS = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Snack"];

export default function MealsSection({ userId }: { userId: string }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [date, setDate] = useState(todayISO());
  const [mealType, setMealType] = useState(TIPOS[0]);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("meals")
      .select("id, date, meal_type, description")
      .eq("user_id", userId)
      .gte("date", isoDaysAgo(7))
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    setMeals((data as Meal[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSaving(true);
    await supabase.from("meals").insert({
      user_id: userId,
      date,
      meal_type: mealType,
      description: description.trim(),
    });
    setDescription("");
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    await supabase.from("meals").delete().eq("id", id);
    load();
  }

  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-soft mb-3">
        Comidas
      </p>

      <form
        onSubmit={handleSave}
        className="grid sm:grid-cols-[auto_auto_1fr_auto] gap-2 mb-4"
      >
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="sm:w-36"
        />
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="sm:w-32"
        >
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="¿Qué comiste?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-paper px-4 rounded-lg text-sm"
        >
          Agregar
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : meals.length === 0 ? (
        <p className="text-sm text-soft">
          Todavía no registraste comidas esta semana.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {meals.map((m) => (
            <li
              key={m.id}
              className="py-2 flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="font-mono text-xs text-soft w-14 shrink-0">
                  {formatShort(m.date)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber/20 text-ink shrink-0">
                  {m.meal_type}
                </span>
                <span className="text-ink truncate">{m.description}</span>
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                className="text-xs text-soft hover:text-clay shrink-0"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
