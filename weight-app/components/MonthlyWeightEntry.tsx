"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CalendarPlus } from "lucide-react";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function years() {
  const current = new Date().getFullYear();
  const list: number[] = [];
  for (let y = current; y >= current - 6; y--) list.push(y);
  return list;
}

export default function MonthlyWeightEntry({
  userId,
  onSaved,
}: {
  userId: string;
  onSaved: () => void;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!value) return;
    setSaving(true);
    const date = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    await supabase
      .from("weights")
      .upsert(
        { user_id: userId, date, weight: parseFloat(value) },
        { onConflict: "user_id,date" }
      );
    setValue("");
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
    onSaved();
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <CalendarPlus size={15} className="text-clay" strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide text-soft">
          Cargar peso de un mes
        </p>
      </div>
      <p className="text-xs text-soft mb-3">
        Para completar meses viejos sin tener que cargar día por día. Se usa
        para el promedio de ese mes en la lista de abajo.
      </p>

      <form onSubmit={handleSave} className="flex flex-wrap gap-2 items-center">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          className="w-36"
        >
          {MESES.map((m, i) => (
            <option key={m} value={i}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          className="w-24"
        >
          {years().map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.1"
          placeholder="kg"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20"
          required
        />
        <button type="submit" disabled={saving} className="btn-primary px-4 text-sm">
          Guardar
        </button>
        {savedMsg && <span className="text-xs text-moss">Guardado ✓</span>}
      </form>
    </div>
  );
}
