"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import {
  LogOut,
  Home,
  Scale,
  Footprints,
  ListChecks,
  UtensilsCrossed,
  Dumbbell,
  Menu,
  X,
} from "lucide-react";
import HomeSummary from "@/components/HomeSummary";
import GoalCard from "@/components/GoalCard";
import WeightSection from "@/components/WeightSection";
import MonthlyWeightEntry from "@/components/MonthlyWeightEntry";
import MonthlyWeightSummary from "@/components/MonthlyWeightSummary";
import StepsGoalCard from "@/components/StepsGoalCard";
import StepsSection from "@/components/StepsSection";
import HabitsSection from "@/components/HabitsSection";
import MonthlyHabitsSummary from "@/components/MonthlyHabitsSummary";
import MealsSection from "@/components/MealsSection";
import TrainingPlanCard from "@/components/TrainingPlanCard";
import TrainingLogSection from "@/components/TrainingLogSection";

// Para sumar un módulo nuevo (Estudios, Dieta, Composición corporal): agregar
// un id acá y una entrada en TABS más abajo. El menú se arma solo.
type Tab = "inicio" | "peso" | "pasos" | "habitos" | "comidas" | "entrenamiento";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "peso", label: "Peso", icon: Scale },
  { id: "pasos", label: "Pasos", icon: Footprints },
  { id: "habitos", label: "Hábitos", icon: ListChecks },
  { id: "comidas", label: "Comidas", icon: UtensilsCrossed },
  { id: "entrenamiento", label: "Entrenamiento", icon: Dumbbell },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("inicio");
  const [weightRefresh, setWeightRefresh] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        setUser(data.session.user);
        setChecking(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.replace("/login");
      }
    );
    return () => listener.subscription.unsubscribe();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function selectTab(id: Tab) {
    setTab(id);
    setMenuOpen(false);
  }

  if (checking || !user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-mono text-sm text-soft">cargando…</p>
      </div>
    );
  }

  const activeLabel = TABS.find((t) => t.id === tab)?.label ?? "";

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper/85 backdrop-blur sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="w-9 h-9 rounded-xl bg-ink text-paper flex items-center justify-center shrink-0"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="font-display text-xl text-ink leading-none">
                {activeLabel}
              </h1>
              <p className="text-xs text-soft mt-1">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-soft hover:text-clay transition"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Overlay + panel del menú hamburguesa */}
      {menuOpen && (
        <div className="fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 bottom-0 w-72 max-w-[80vw] bg-panel border-r border-line shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ink text-paper flex items-center justify-center font-display text-sm">
                  B
                </div>
                <span className="font-display text-lg text-ink">Bitácora</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="text-soft hover:text-clay"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {TABS.map((t) => {
                const active = tab === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTab(t.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      active
                        ? "bg-clay/10 text-clay"
                        : "text-ink hover:bg-line/40"
                    }`}
                  >
                    <Icon size={17} strokeWidth={2} />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-6">
        {tab === "inicio" && <HomeSummary userId={user.id} />}

        {tab === "peso" && (
          <>
            <GoalCard userId={user.id} />
            <WeightSection key={`daily-${weightRefresh}`} userId={user.id} />
            <MonthlyWeightEntry
              userId={user.id}
              onSaved={() => setWeightRefresh((k) => k + 1)}
            />
            <MonthlyWeightSummary
              key={`summary-${weightRefresh}`}
              userId={user.id}
            />
          </>
        )}

        {tab === "pasos" && (
          <>
            <StepsGoalCard userId={user.id} />
            <StepsSection userId={user.id} />
          </>
        )}

        {tab === "habitos" && (
          <>
            <HabitsSection userId={user.id} />
            <MonthlyHabitsSummary userId={user.id} />
          </>
        )}

        {tab === "comidas" && <MealsSection userId={user.id} />}

        {tab === "entrenamiento" && (
          <>
            <TrainingPlanCard userId={user.id} />
            <TrainingLogSection userId={user.id} />
          </>
        )}
      </main>
    </div>
  );
}
