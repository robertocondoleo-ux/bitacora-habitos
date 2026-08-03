"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/dates";

const MOODS = [
  { value: 1, emoji: "😞", label: "Mal" },
  { value: 2, emoji: "😐", label: "Meh" },
  { value: 3, emoji: "🙂", label: "Bien" },
  { value: 4, emoji: "😄", label: "Genial" },
  { value: 5, emoji: "🤩", label: "Increíble" },
];

export default function MoodWaterCard({ userId }: { userId: string }) {
  const [mood, setMood] = useState<number | null>(null);
  const [water, setWater] = useState(0);
  const [loading, setLoading] = useState(true);
  const today = todayISO();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("daily_wellbeing")
      .select("mood, water_glasses")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();
    setMood(data?.mood ?? null);
    setWater(data?.water_glasses ?? 0);
    setLoading(false);
  }, [userId, today]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(next: { mood?: number | null; water?: number }) {
    const nextMood = next.mood !== undefined ? next.mood : mood;
    const nextWater = next.water !== undefined ? next.water : water;
    if (next.mood !== undefined) setMood(next.mood);
    if (next.water !== undefined) setWater(next.water);
    await supabase
      .from("daily_wellbeing")
      .upsert(
        { user_id: userId, date: today, mood: nextMood, water_glasses: nextWater },
        { onConflict: "user_id,date" }
      );
  }

  if (loading) return null;

  return (
    <div className="card p-4 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-soft mb-3">¿Cómo te sentís hoy?</p>
        <div className="flex justify-between gap-1.5">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => save({ mood: m.value })}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl text-xl press transition-all ${
                mood === m.value
                  ? "bg-gradient-to-br from-pink-400 to-purple-600 scale-110 -translate-y-1 shadow-lg"
                  : "bg-paper/60 border border-line"
              }`}
            >
              <span>{m.emoji}</span>
              <span className={`text-[9px] font-semibold ${mood === m.value ? "text-paper" : "text-soft"}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-soft mb-1">💧 Agua de hoy</p>
        <p className="text-[11px] text-soft mb-2">Tocá un vaso cada vez que tomas agua</p>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => save({ water: n })}
              className="text-3xl transition-all press"
              style={{
                filter: n <= water ? "none" : "grayscale(1)",
                opacity: n <= water ? 1 : 0.35,
                transform: n <= water ? "scale(1.12)" : "scale(1)",
              }}
              aria-label={`${n} vasos`}
            >
              🥛
            </button>
          ))}
          <button
            onClick={() => save({ water: Math.max(water, 5) + 1 })}
            className="w-8 h-8 rounded-full bg-paper/60 border border-line text-soft text-sm font-bold press shrink-0"
            aria-label="Sumar más de 5 vasos"
          >
            +
          </button>
        </div>
        <p className="text-center text-xs font-bold text-sky mt-2">Cantidad de vasos de agua: {water}</p>
      </div>
    </div>
  );
}
