"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import { todayISO, isoDaysAgo, formatShort } from "@/lib/dates";

type StepEntry = { date: string; steps: number };

export default function StepsSection({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<StepEntry[]>([]);
  const [value, setValue] = useState("");
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("steps")
      .select("date, steps")
      .eq("user_id", userId)
      .gte("date", isoDaysAgo(14))
      .order("date", { ascending: true });
    setEntries((data as StepEntry[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!value) return;
    setSaving(true);
    await supabase
      .from("steps")
      .upsert(
        { user_id: userId, date, steps: parseInt(value, 10) },
        { onConflict: "user_id,date" }
      );
    setValue("");
    setSaving(false);
    load();
  }

  const chartData = entries.map((e) => ({ ...e, label: formatShort(e.date) }));

  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-soft mb-3">Pasos</p>

      <form onSubmit={handleSave} className="flex gap-2 mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-36"
        />
        <input
          type="number"
          placeholder="pasos"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-28"
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-paper px-4 rounded-lg text-sm"
        >
          Guardar
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : chartData.length === 0 ? (
        <p className="text-sm text-soft">Todavía no cargaste pasos.</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#E4DFD3" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                fontSize={11}
                stroke="#8A8577"
                tickLine={false}
              />
              <YAxis fontSize={11} stroke="#8A8577" tickLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  borderColor: "#E4DFD3",
                }}
              />
              <Bar dataKey="steps" fill="#D9A441" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
