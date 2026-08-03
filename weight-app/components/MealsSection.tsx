"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO, isoDaysAgo, formatShort } from "@/lib/dates";
import { UtensilsCrossed, Pencil, X, Trash2, Plus, Coffee, Soup, Moon, Apple, Cookie, Camera, Image as ImageIcon } from "lucide-react";

type Meal = {
  id: string;
  date: string;
  meal_type: string;
  description: string;
  photo_url: string | null;
};

async function uploadMealPhoto(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("meal-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return null;
  const { data } = supabase.storage.from("meal-photos").getPublicUrl(path);
  return data.publicUrl;
}

const TIPOS = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Snack"];
const TIPO_ICON: Record<string, any> = {
  Desayuno: Coffee,
  Almuerzo: Soup,
  Merienda: Cookie,
  Cena: Moon,
  Snack: Apple,
};

const DIAS_CORTOS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MESES_LARGOS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS_LARGOS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function formatLong(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${DIAS_LARGOS[d.getDay()]} ${d.getDate()} de ${MESES_LARGOS[d.getMonth()]}`;
}

function lastNDays(n: number) {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function MealsSection({ userId }: { userId: string }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [date, setDate] = useState(todayISO());
  const [mealType, setMealType] = useState(TIPOS[0]);
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const descRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"lista" | "dia">("lista");
  const [selectedDate, setSelectedDate] = useState(todayISO());

  // Popup de detalle / edición
  const [modalMeal, setModalMeal] = useState<Meal | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("meals")
      .select("id, date, meal_type, description, photo_url")
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

  function pickPhoto(file: File | null) {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSaving(true);
    let photo_url: string | null = null;
    if (photoFile) {
      setUploadingPhoto(true);
      photo_url = await uploadMealPhoto(userId, photoFile);
      setUploadingPhoto(false);
    }
    await supabase.from("meals").insert({
      user_id: userId,
      date,
      meal_type: mealType,
      description: description.trim(),
      photo_url,
    });
    setDescription("");
    pickPhoto(null);
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
    setEditPhotoFile(null);
    setEditPhotoPreview(meal.photo_url);
    setEditMode(true);
  }

  function closeModal() {
    setModalMeal(null);
    setEditMode(false);
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
  }

  function pickEditPhoto(file: File | null) {
    setEditPhotoFile(file);
    setEditPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!modalMeal || !editDescription.trim()) return;
    setSavingEdit(true);
    let photo_url = modalMeal.photo_url;
    if (editPhotoFile) {
      photo_url = await uploadMealPhoto(userId, editPhotoFile);
    } else if (editPhotoPreview === null) {
      photo_url = null;
    }
    await supabase
      .from("meals")
      .update({ date: editDate, meal_type: editType, description: editDescription.trim(), photo_url })
      .eq("id", modalMeal.id);
    setSavingEdit(false);
    closeModal();
    load();
  }

  function quickAdd(forDate: string, forType: string) {
    setDate(forDate);
    setMealType(forType);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => descRef.current?.focus(), 300);
  }

  const dayStripDates = lastNDays(7);
  const dayMeals = meals.filter((m) => m.date === selectedDate);
  const mealsByType: Record<string, Meal> = {};
  dayMeals.forEach((m) => (mealsByType[m.meal_type] = m));

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <UtensilsCrossed size={15} className="text-clay" strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide text-soft">Comidas</p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSave}
        className="grid sm:grid-cols-[auto_auto_1fr_auto_auto] gap-2 mb-2"
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
          ref={descRef}
          type="text"
          placeholder="¿Qué comiste?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => pickPhoto(e.target.files?.[0] || null)}
        />
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="w-10 h-10 rounded-lg border border-line bg-panel flex items-center justify-center press shrink-0"
          aria-label="Agregar foto"
          title="Agregar foto"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Camera size={16} className="text-soft" strokeWidth={2} />
          )}
        </button>
        <button type="submit" disabled={saving || uploadingPhoto} className="btn-primary px-4 text-sm">
          {uploadingPhoto ? "Subiendo foto…" : "Agregar"}
        </button>
      </form>
      <div className="mb-4">
        {photoPreview && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-soft">Foto lista para subir</span>
            <button type="button" onClick={() => pickPhoto(null)} className="text-xs text-clay press">
              Quitar
            </button>
          </div>
        )}
      </div>

      {/* Selector Lista / Por día */}
      <div className="flex bg-paper border border-line rounded-xl p-1 mb-4">
        <button
          onClick={() => setMode("lista")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition press ${
            mode === "lista" ? "bg-clay text-paper" : "text-soft"
          }`}
        >
          Lista
        </button>
        <button
          onClick={() => setMode("dia")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition press ${
            mode === "dia" ? "bg-clay text-paper" : "text-soft"
          }`}
        >
          Por día
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : mode === "lista" ? (
        meals.length === 0 ? (
          <p className="text-sm text-soft">Todavía no registraste comidas esta semana.</p>
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
                    {m.photo_url && (
                      <img
                        src={m.photo_url}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    )}
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
        )
      ) : (
        <div>
          {/* Tira de días */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 mb-4 -mx-1 px-1">
            {dayStripDates.map((iso) => {
              const d = new Date(iso + "T00:00:00");
              const has = meals.some((m) => m.date === iso);
              const active = iso === selectedDate;
              return (
                <button
                  key={iso}
                  onClick={() => setSelectedDate(iso)}
                  className={`shrink-0 w-12 py-2 rounded-xl border text-center press ${
                    active ? "bg-clay border-clay" : "border-line bg-paper"
                  }`}
                >
                  <p className={`font-mono text-[9px] uppercase ${active ? "text-paper" : "text-soft"}`}>
                    {DIAS_CORTOS[d.getDay()]}
                  </p>
                  <p className={`font-display text-base ${active ? "text-paper" : "text-ink"}`}>{d.getDate()}</p>
                  <span
                    className={`block w-1 h-1 rounded-full mx-auto mt-1 ${
                      has ? (active ? "bg-paper" : "bg-moss") : "invisible"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Diario del día */}
          <p className="font-display text-lg text-ink mb-0.5">{formatLong(selectedDate)}</p>
          <p className="text-xs text-soft mb-3">
            {dayMeals.length} de {TIPOS.length} comidas registradas
          </p>

          <div className="divide-y divide-line">
            {TIPOS.map((t) => {
              const m = mealsByType[t];
              const Icon = TIPO_ICON[t];
              return (
                <div key={t} className="flex items-start gap-3 py-3">
                  {m?.photo_url ? (
                    <img src={m.photo_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-paper border border-line flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-soft" strokeWidth={2} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-soft mb-0.5">{t}</p>
                    {m ? (
                      <button onClick={() => openView(m)} className="text-sm text-ink text-left leading-snug press">
                        {m.description}
                      </button>
                    ) : (
                      <button
                        onClick={() => quickAdd(selectedDate, t)}
                        className="flex items-center gap-1.5 text-sm text-soft italic press"
                      >
                        <Plus size={13} className="shrink-0" /> Sin registrar — tocá para cargar
                      </button>
                    )}
                  </div>
                  {m && (
                    <button
                      onClick={() => openEdit(m)}
                      className="text-soft hover:text-clay press shrink-0 mt-0.5"
                      aria-label="Editar comida"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
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
                <div>
                  <label className="text-xs text-soft mb-1 block">Foto</label>
                  <div className="flex items-center gap-2">
                    {editPhotoPreview ? (
                      <img src={editPhotoPreview} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-paper border border-line flex items-center justify-center">
                        <ImageIcon size={16} className="text-soft" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      id="edit-photo-input"
                      onChange={(e) => pickEditPhoto(e.target.files?.[0] || null)}
                    />
                    <label
                      htmlFor="edit-photo-input"
                      className="text-xs px-3 py-1.5 rounded-lg border border-line text-soft press cursor-pointer"
                    >
                      Cambiar
                    </label>
                    {editPhotoPreview && (
                      <button
                        type="button"
                        onClick={() => pickEditPhoto(null)}
                        className="text-xs text-clay press"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
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
                {modalMeal.photo_url && (
                  <img
                    src={modalMeal.photo_url}
                    alt=""
                    className="w-full max-h-64 object-cover rounded-xl mb-3"
                  />
                )}
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
