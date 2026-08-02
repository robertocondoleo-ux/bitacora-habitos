import { Capacitor } from "@capacitor/core";
import { Health } from "@capgo/capacitor-health";
import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/dates";

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export type StepsSyncResult =
  | { ok: true; steps: number }
  | { ok: false; reason: string };

// Pide permiso (si hace falta) y guarda el total de pasos de hoy leído
// desde Health Connect, en la misma tabla que se usa al cargar a mano.
export async function syncTodayStepsFromHealthConnect(
  userId: string
): Promise<StepsSyncResult> {
  if (!isNativeApp()) {
    return { ok: false, reason: "No es la app nativa." };
  }

  const availability = await Health.isAvailable();
  if (!availability.available) {
    return { ok: false, reason: availability.reason || "Health Connect no está disponible en este teléfono." };
  }

  const auth = await Health.requestAuthorization({ read: ["steps"], write: [] });
  if (!auth.readAuthorized?.includes("steps")) {
    return { ok: false, reason: "No diste permiso para leer los pasos." };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { samples } = await Health.readSamples({
    dataType: "steps",
    startDate: startOfDay.toISOString(),
    endDate: new Date().toISOString(),
    limit: 2000,
  });

  const total = samples.reduce((sum, s) => sum + (s.value || 0), 0);

  await supabase
    .from("steps")
    .upsert({ user_id: userId, date: todayISO(), steps: Math.round(total) }, { onConflict: "user_id,date" });

  return { ok: true, steps: Math.round(total) };
}
