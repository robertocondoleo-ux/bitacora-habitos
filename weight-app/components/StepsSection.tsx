"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO, isoDaysAgo, weekStart } from "@/lib/dates";
import { Footprints, Watch, Loader2 } from "lucide-react";
import { isNativeApp, syncTodayStepsFromHealthConnect } from "@/lib/health";

type StepEntry = { date: string; steps: number };

const WEEKDAY_LETTERS = ["L", "M", "M", "J", "V", "S", "D"];
// Solo colores ya definidos en tailwind.config.ts (nada de tonos nuevos).
const BAR_COLORS = [
  "from-sky to-sky2",
  "from-moss to-moss",
  "from-sky to-sky2",
  "from-moss to-moss",
  "from-clay to-amber",
  "from-sky to-sky2",
  "from-amber to-clay",
];

export default function StepsSection({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<StepEntry[]>([]);
  const [goal, setGoal] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const nativeApp = isNativeApp();

  const today = todayISO();
  const monday = useMemo(() => weekStart(today), [today]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(monday, i)),
    [monday]
  );

  const load = useCallback(async () => {
    const [{ data }, { data: profile }] = await Promise.all([
      supabase
        .from("steps")
        .select("date, steps")
        .eq("user_id", userId)
        .gte("date", isoDaysAgo(14))
        .order("date", { ascending: true }),
      supabase
        .from("profiles")
        .select("steps_goal")
        .eq("id", userId)
        .single(),
    ]);
    setEntries((data as StepEntry[]) || []);
    setGoal(profile?.steps_goal ?? null);
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

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    const result = await syncTodayStepsFromHealthConnect(userId);
    setSyncing(false);
    if (result.ok) {
      setSyncMsg(`¡Listo! ${result.steps.toLocaleString("es-AR")} pasos sincronizados 🎉`);
      load();
    } else {
      setSyncMsg(result.reason);
    }
  }

  function stepsFor(d: string): number {
    return entries.find((e) => e.date === d)?.steps ?? 0;
  }

  const todaySteps = stepsFor(today);
  const pct = goal ? Math.max(4, Math.min(100, Math.round((todaySteps / goal) * 100))) : 0;
  const remaining = goal ? Math.max(0, goal - todaySteps) : null;
  const maxWeek = Math.max(1, ...weekDays.map(stepsFor), goal ?? 0);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Footprints size={15} className="text-clay" strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide text-soft">Pasos</p>
      </div>

      {loading ? (
        <p className="text-sm text-soft mt-3">cargando…</p>
      ) : (
        <>
          <p className="text-center font-display font-black text-xl mt-3">¡A caminar! 🚶</p>
          <p className="text-center text-xs text-soft mb-4">
            {goal
              ? remaining === 0
                ? "¡Llegaste a tu meta de hoy! 🎉"
                : `Te faltan ${remaining!.toLocaleString("es-AR")} pasos para la meta`
              : "Definí una meta diaria abajo para arrancar"}
          </p>

          {goal !== null && (
            <div className="relative h-14 mb-4">
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-line rounded-full -translate-y-1/2" />
              <div
                className="absolute top-1/2 left-0 h-1.5 rounded-full -translate-y-1/2 bg-gradient-to-r from-clay to-amber transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
              <span
                className="absolute top-1/2 text-2xl -translate-x-1/2 -translate-y-[58%] transition-all duration-700"
                style={{ left: `${pct}%` }}
              >
                🏃
              </span>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-lg">🏁</span>
            </div>
          )}

          <div className="text-center mb-4">
            <p className="font-mono font-bold text-4xl bg-gradient-to-br from-amber to-clay bg-clip-text text-transparent">
              {todaySteps.toLocaleString("es-AR")}
            </p>
            <p className="text-xs font-bold text-soft mt-0.5">pasos hoy</p>
          </div>

          <p className="text-[11px] uppercase tracking-wide text-soft mb-2">Esta semana</p>
          <div className="flex items-end gap-2 h-24 mb-5">
            {weekDays.map((d, i) => {
              const s = stepsFor(d);
              const h = Math.max(6, Math.round((s / maxWeek) * 100));
              const hit = goal !== null && s >= goal && s > 0;
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="relative w-full flex items-end h-full">
                    {hit && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs">⭐</span>
                    )}
                    <div
                      className={`w-full rounded-t-lg rounded-b-md bg-gradient-to-t ${BAR_COLORS[i]} transition-all duration-700`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-soft">{WEEKDAY_LETTERS[i]}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {nativeApp && (
        <div className="mb-4">
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-paper bg-gradient-to-br from-sky to-sky2 press disabled:opacity-60"
          >
            {syncing ? <Loader2 size={15} className="animate-spin" /> : <Watch size={15} />}
            {syncing ? "Sincronizando…" : "Sincronizar pasos del teléfono"}
          </button>
          {syncMsg && <p className="text-xs text-soft text-center mt-2">{syncMsg}</p>}
        </div>
      )}

      <form onSubmit={handleSave} className="flex gap-2">
        <input
          type="date"
          value={date}
          max={todayISO()}
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
        <button type="submit" disabled={saving} className="btn-accent px-4 text-sm whitespace-nowrap">
          Guardar
        </button>
      </form>
    </div>
  );
}

function addDays(dateISO: string, n: number): string {
  const d = new Date(dateISO + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
