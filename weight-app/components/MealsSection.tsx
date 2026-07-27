"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO, isoDaysAgo, formatShort } from "@/lib/dates";
import { UtensilsCrossed, Pencil, X, Trash2 } from "lucide-react";

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

  // Popup de detalle / edición
  const [modalMeal, setModalMeal] = useState<Meal | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

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
    setModalMeal(null);
    load();
  }

  function openView(meal: Meal) {
    setModalMeal(meal);
    setEditMode(false);
  }

  function openEdit(meal: Meal) {
    setModalMeal(meal);
    setEditType(meal.meal_type);
    setEditDate(meal.date);
    setEditDescription(meal.description);
    setEditMode(true);
  }

  function closeModal() {
    setModalMeal(null);
    setEditMode(false);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!modalMeal || !editDescription.trim()) return;
    setSavingEdit(true);
    await supabase
      .from("meals")
      .update({ date: editDate, meal_type: editType, description: editDescription.trim() })
      .eq("id", modalMeal.id);
    setSavingEdit(false);
    closeModal();
    load();
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <UtensilsCrossed size={15} className="text-clay" strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide text-soft">Comidas</p>
      </div>

      <form
        onSubmit={handleSave}
        className="grid sm:grid-cols-[auto_auto_1fr_auto] gap-2 mb-4"
      >
        <input
          type="date"
          value={date}
          max={todayISO()}
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
        <button type="submit" disabled={saving} className="btn-primary px-4 text-sm">
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
            <li key={m.id} className="py-2.5 text-sm">
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => openView(m)}
                  className="flex items-start gap-3 min-w-0 text-left flex-1 press"
                >
                  <span className="font-mono text-xs text-soft w-14 shrink-0 pt-0.5">
                    {formatShort(m.date)}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber/20 text-ink shrink-0 inline-block mb-1">
                      {m.meal_type}
                    </span>
                    <p className="text-ink line-clamp-2 leading-snug">{m.description}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <button
                    onClick={() => openEdit(m)}
                    className="text-soft hover:text-clay press"
                    aria-label="Editar comida"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-soft hover:text-clay press"
                    aria-label="Eliminar comida"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Popup de detalle / edición */}
      {modalMeal && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-panel border border-line rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-5">
            {editMode ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs uppercase tracking-wide text-soft">Editar comida</p>
                  <button type="button" onClick={closeModal} className="text-soft hover:text-clay press">
                    <X size={18} />
                  </button>
                </div>
                <div>
                  <label className="text-xs text-soft mb-1 block">Fecha</label>
                  <input
                    type="date"
                    value={editDate}
                    max={todayISO()}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-soft mb-1 block">Comida</label>
                  <select value={editType} onChange={(e) => setEditType(e.target.value)}>
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-soft mb-1 block">¿Qué comiste?</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={savingEdit} className="btn-primary flex-1 py-2 text-sm">
                    {savingEdit ? "Guardando…" : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(modalMeal.id)}
                    className="px-3 rounded-lg border border-line text-clay press"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber/20 text-ink">
                    {modalMeal.meal_type}
                  </span>
                  <button onClick={closeModal} className="text-soft hover:text-clay press">
                    <X size={18} />
                  </button>
                </div>
                <p className="font-mono text-xs text-soft mb-2">{formatShort(modalMeal.date)}</p>
                <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap mb-5">
                  {modalMeal.description}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(modalMeal)}
                    className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1.5"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(modalMeal.id)}
                    className="px-3 rounded-lg border border-line text-clay press"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
