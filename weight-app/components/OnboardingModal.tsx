"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function OnboardingModal({
  userId,
  onDone,
}: {
  userId: string;
  onDone: (requestedNutricionista: boolean) => void;
}) {
  const [saving, setSaving] = useState<"usuario" | "nutricionista" | null>(null);

  async function choose(choice: "usuario" | "nutricionista") {
    setSaving(choice);
    await supabase
      .from("profiles")
      .update({
        onboarded: true,
        role_request: choice === "nutricionista" ? "nutricionista" : null,
      })
      .eq("id", userId);
    setSaving(null);
    onDone(choice === "nutricionista");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-panel border border-line rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
        <p className="font-display font-extrabold text-2xl mb-1">¡Bienvenido a Bitácora! 👋</p>
        <p className="text-sm text-soft mb-6">Contanos cómo la vas a usar</p>

        <button
          onClick={() => choose("usuario")}
          disabled={saving !== null}
          className="w-full text-left p-5 rounded-2xl border-[1.5px] border-amber/40 bg-gradient-to-br from-amber/10 to-transparent mb-3 press disabled:opacity-60"
        >
          <p className="text-3xl mb-2">🙋</p>
          <p className="font-display font-extrabold text-base">Soy usuario</p>
          <p className="text-xs text-soft mt-1 leading-relaxed">
            Quiero registrar mi peso, hábitos, pasos y comidas.
          </p>
        </button>

        <button
          onClick={() => choose("nutricionista")}
          disabled={saving !== null}
          className="w-full text-left p-5 rounded-2xl border-[1.5px] border-moss/40 bg-gradient-to-br from-moss/10 to-transparent press disabled:opacity-60"
        >
          <p className="text-3xl mb-2">🥑</p>
          <p className="font-display font-extrabold text-base">Quiero ser nutricionista</p>
          <p className="text-xs text-soft mt-1 leading-relaxed">
            Voy a acompañar pacientes — esto pide aprobación antes de activarse.
          </p>
        </button>

        {saving && <p className="text-xs text-soft mt-4">Guardando…</p>}
      </div>
    </div>
  );
}
