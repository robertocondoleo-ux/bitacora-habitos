"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/dates";
import { Activity, Trash2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Entry = {
  id: string;
  date: string;
  peso: number | null;
  grasa: number | null;
  musculo: number | null;
  cintura: number | null;
  cadera: number | null;
  brazo: number | null;
  pierna: number | null;
};

const FIELDS: { key: keyof Omit<Entry, "id" | "date">; label: string; unit: string }[] = [
  { key: "peso", label: "Peso", unit: "kg" },
  { key: "grasa", label: "% Grasa corporal", unit: "%" },
  { key: "musculo", label: "% Masa muscular", unit: "%" },
  { key: "cintura", label: "Cintura", unit: "cm" },
  { key: "cadera", label: "Cadera", unit: "cm" },
  { key: "brazo", label: "Brazo", unit: "cm" },
  { key: "pierna", label: "Pierna", unit: "cm" },
];

export default function BodyCompSection({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ date: todayISO() });

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("body_comp_entries")
      .select("id, date, peso, grasa, musculo, cintura, cadera, brazo, pierna")
      .eq("user_id", userId)
      .order("date", { ascending: true });
    setEntries((data as Entry[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    const row: Record<string, any> = { user_id: userId, date: form.date || todayISO() };
    let any = false;
    FIELDS.forEach((f) => {
      if (form[f.key] !== undefined && form[f.key] !== "") {
        row[f.key] = parseFloat(form[f.key]);
        any = true;
      }
    });
    if (!any) return;
    setSaving(true);
    await supabase.from("body_comp_entries").insert(row);
    setForm({ date: todayISO() });
    setSaving(false);
    load();
  }

  async function removeEntry(id: string) {
    await supabase.from("body_comp_entries").delete().eq("id", id);
    load();
  }

  const chartData = entries.map((e) => ({ date: e.date, Peso: e.peso, Grasa: e.grasa, Músculo: e.musculo }));

  return (
    <div className="space-y-6">
      <form onSubmit={addEntry} className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={15} className="text-clay" strokeWidth={2} />
          <p className="text-xs uppercase tracking-wide text-soft">Nueva medición</p>
        </div>

        <label className="text-xs text-soft mb-1 block">Fecha</label>
        <input
          type="date"
          value={form.date}
          max={todayISO()}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          className="max-w-[160px] mb-4"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="text-[10px] text-soft block mb-1">
                {f.label} ({f.unit})
              </label>
              <input
                type="number"
                step="any"
                value={form[f.key] || ""}
                onChange={(e) => setForm((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-sm">
          {saving ? "Guardando…" : "Guardar medición"}
        </button>
      </form>

      {entries.length > 1 && (
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-soft mb-3">Evolución</p>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#E4DFD3" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8A8577" }} />
                <YAxis tick={{ fontSize: 10, fill: "#8A8577" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E4DFD3" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Peso" stroke="#1C2321" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="Grasa" stroke="#B5602F" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="Músculo" stroke="#4B5E4A" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card p-5">
        <p className="text-xs uppercase tracking-wide text-soft mb-3">Histórico</p>
        {loading ? (
          <p className="text-sm text-soft">cargando…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-soft">Todavía no cargaste ninguna medición.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left font-normal text-soft pb-2 pr-2 font-mono text-xs">Fecha</th>
                  {FIELDS.map((f) => (
                    <th key={f.key} className="text-left font-normal text-soft pb-2 pr-2 font-mono text-xs">
                      {f.label}
                    </th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[...entries].reverse().map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="py-2 pr-2 font-mono text-xs text-ink">{row.date}</td>
                    {FIELDS.map((f) => (
                      <td key={f.key} className="py-2 pr-2 font-mono text-xs text-ink">
                        {row[f.key] != null ? row[f.key] : <span className="text-line">—</span>}
                      </td>
                    ))}
                    <td>
                      <button onClick={() => removeEntry(row.id)} className="text-soft hover:text-clay px-1">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
