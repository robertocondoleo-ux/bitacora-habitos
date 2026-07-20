"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import GoalCard from "@/components/GoalCard";
import WeightSection from "@/components/WeightSection";
import HabitsSection from "@/components/HabitsSection";
import StepsSection from "@/components/StepsSection";
import MealsSection from "@/components/MealsSection";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

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
    <div className="min-h-screen bg-paper pb-16">
      <header className="border-b border-line bg-paper/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-ink leading-none">
              Bitácora
            </h1>
            <p className="text-xs text-soft mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-soft hover:text-clay transition"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        <GoalCard userId={user.id} />

        <div className="grid md:grid-cols-2 gap-6">
          <WeightSection userId={user.id} />
          <StepsSection userId={user.id} />
        </div>

        <HabitsSection userId={user.id} />

        <MealsSection userId={user.id} />
      </main>
    </div>
  );
}
