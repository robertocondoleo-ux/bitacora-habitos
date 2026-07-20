"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { LogOut, Home, Scale, ListChecks, UtensilsCrossed } from "lucide-react";
import HomeSummary from "@/components/HomeSummary";
import GoalCard from "@/components/GoalCard";
import WeightSection from "@/components/WeightSection";
import MonthlyWeightSummary from "@/components/MonthlyWeightSummary";
import StepsSection from "@/components/StepsSection";
import HabitsSection from "@/components/HabitsSection";
import MonthlyHabitsSummary from "@/components/MonthlyHabitsSummary";
import MealsSection from "@/components/MealsSection";

type Tab = "inicio" | "peso" | "habitos" | "comidas";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "peso", label: "Peso", icon: Scale },
  { id: "habitos", label: "Hábitos", icon: ListChecks },
  { id: "comidas", label: "Comidas", icon: UtensilsCrossed },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("inicio");

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

  if (checking || !user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-mono text-sm text-soft">cargando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper/85 backdrop-blur sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-ink text-paper flex items-center justify-center font-display text-lg shrink-0">
              B
            </div>
            <div>
              <h1 className="font-display text-xl text-ink leading-none">
                Bitácora
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

      <main className="max-w-lg mx-auto px-4 pt-5 pb-24 space-y-6">
        {tab === "inicio" && <HomeSummary userId={user.id} />}

        {tab === "peso" && (
          <>
            <GoalCard userId={user.id} />
            <WeightSection userId={user.id} />
            <StepsSection userId={user.id} />
            <MonthlyWeightSummary userId={user.id} />
          </>
        )}

        {tab === "habitos" && (
          <>
            <HabitsSection userId={user.id} />
            <MonthlyHabitsSummary userId={user.id} />
          </>
        )}

        {tab === "comidas" && <MealsSection userId={user.id} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-panel/95 backdrop-blur border-t border-line z-10">
        <div className="max-w-lg mx-auto grid grid-cols-4">
          {TABS.map((t) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex flex-col items-center gap-1 py-2.5"
              >
                <Icon
                  size={19}
                  strokeWidth={2}
                  className={active ? "text-clay" : "text-soft"}
                />
                <span
                  className={`text-[10px] ${
                    active ? "text-clay" : "text-soft"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
