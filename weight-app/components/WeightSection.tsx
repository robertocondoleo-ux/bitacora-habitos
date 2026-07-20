"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import { todayISO, isoDaysAgo, formatShort } from "@/lib/dates";
import { Scale } from "lucide-react";

type Weight = { date: string; weight: number };

export default function WeightSection({ userId }: { userId: string }) {
  const [weights, setWeights] = useState<Weight[]>([]);
  const [value, setValue] = useState("");
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("weights")
      .select("date, weight")
      .eq("user_id", userId)
      .gte("date", isoDaysAgo(90))
      .order("date", { ascending: true });
    setWeights((data as Weight[]) || []);
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
      .from("weights")
      .upsert(
        { user_id: userId, date, weight: parseFloat(value) },
        { onConflict: "user_id,date" }
      );
    setValue("");
    setSaving(false);
    load();
  }

  const chartData = weights.map((w) => ({
    ...w,
    label: formatShort(w.date),
  }));

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Scale size={15} className="text-clay" strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide text-soft">Peso</p>
      </div>

      <form onSubmit={handleSave} className="flex gap-2 mb-4">
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="w-36"
        />
        <input
          type="number"
          step="0.1"
          placeholder="kg"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24"
          required
        />
        <button type="submit" disabled={saving} className="btn-primary px-4 text-sm">
          Guardar
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : chartData.length === 0 ? (
        <p className="text-sm text-soft">
          Todavía no cargaste ningún peso.
        </p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#E4DFD3" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                fontSize={11}
                stroke="#8A8577"
                tickLine={false}
              />
              <YAxis
                domain={["dataMin - 1", "dataMax + 1"]}
                fontSize={11}
                stroke="#8A8577"
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  borderColor: "#E4DFD3",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#B5602F"
                strokeWidth={2}
                dot={{ r: 3, fill: "#B5602F" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
