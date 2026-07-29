"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import {
  LogOut,
  Settings,
  Home,
  Scale,
  Footprints,
  ListChecks,
  UtensilsCrossed,
  Dumbbell,
  FileText,
  Salad,
  Activity,
  UserPlus,
  Users,
  MoreHorizontal,
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
import AssignedTrainingCard from "@/components/AssignedTrainingCard";
import StudiesSection from "@/components/StudiesSection";
import DietSection from "@/components/DietSection";
import BodyCompSection from "@/components/BodyCompSection";
import AddSpecialistSection from "@/components/AddSpecialistSection";
import NutricionistaPatients from "@/components/NutricionistaPatients";
import EntrenadorPatients from "@/components/EntrenadorPatients";
import WhatsNewModal from "@/components/WhatsNewModal";
import AccountSettingsModal from "@/components/AccountSettingsModal";
import ThemeToggle from "@/components/ThemeToggle";
import type { Role } from "@/lib/specialistData";

type MainTab = "inicio" | "peso" | "pasos" | "habitos" | "comidas";
type ExtraTab = "entrenamiento" | "estudios" | "dieta" | "composicion" | "especialista" | "pacientes";
type Tab = MainTab | ExtraTab;

const MAIN_TABS: { id: MainTab; label: string; icon: typeof Home }[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "peso", label: "Peso", icon: Scale },
  { id: "pasos", label: "Pasos", icon: Footprints },
  { id: "habitos", label: "Hábitos", icon: ListChecks },
  { id: "comidas", label: "Comidas", icon: UtensilsCrossed },
];

// Módulos base que ve cualquier cuenta desde el botón "Más".
const BASE_EXTRA_TABS: { id: ExtraTab; label: string; icon: typeof Home }[] = [
  { id: "entrenamiento", label: "Entrenamiento", icon: Dumbbell },
  { id: "estudios", label: "Estudios", icon: FileText },
  { id: "dieta", label: "Dieta", icon: Salad },
  { id: "composicion", label: "Composición corporal", icon: Activity },
];

function extraTabsForRole(role: Role): { id: ExtraTab; label: string; icon: typeof Home }[] {
  if (role === "usuario") {
    return [...BASE_EXTRA_TABS, { id: "especialista", label: "Agregar especialista", icon: UserPlus }];
  }
  return [...BASE_EXTRA_TABS, { id: "pacientes", label: "Ver pacientes", icon: Users }];
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("usuario");
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("inicio");
  const [weightRefresh, setWeightRefresh] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setUser(data.session.user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .maybeSingle();
      setRole((profile?.role as Role) || "usuario");
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function selectExtraTab(id: ExtraTab) {
    setTab(id);
    setMoreOpen(false);
  }

  if (checking || !user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-mono text-sm text-soft">cargando…</p>
      </div>
    );
  }

  const extraTabs = extraTabsForRole(role);
  const isExtraActive = extraTabs.some((t) => t.id === tab);

  return (
    <div className="min-h-screen bg-paper">
      <WhatsNewModal />
      {settingsOpen && (
        <AccountSettingsModal
          userId={user.id}
          currentRole={role}
          onClose={() => setSettingsOpen(false)}
          onRoleChange={(r) => {
            setRole(r);
            setTab("inicio");
          }}
        />
      )}

      <header className="border-b border-line bg-paper/85 backdrop-blur sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-ink text-paper flex items-center justify-center font-display text-lg shrink-0">
              B
            </div>
            <div>
              <h1 className="font-display text-xl text-ink leading-none">Bitácora</h1>
              <p className="text-xs text-soft mt-1 capitalize">
                {user.email} {role !== "usuario" && `· ${role}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => setSettingsOpen(true)} className="text-soft hover:text-clay transition">
              <Settings size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-soft hover:text-clay transition"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 pb-24 space-y-6">
        {tab === "inicio" && <HomeSummary userId={user.id} />}

        {tab === "peso" && (
          <>
            <GoalCard userId={user.id} />
            <WeightSection key={`daily-${weightRefresh}`} userId={user.id} />
            <MonthlyWeightEntry userId={user.id} onSaved={() => setWeightRefresh((k) => k + 1)} />
            <MonthlyWeightSummary key={`summary-${weightRefresh}`} userId={user.id} />
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
            <AssignedTrainingCard userId={user.id} />
            <TrainingPlanCard userId={user.id} />
            <TrainingLogSection userId={user.id} />
          </>
        )}

        {tab === "estudios" && <StudiesSection userId={user.id} />}

        {tab === "dieta" && <DietSection userId={user.id} />}

        {tab === "composicion" && <BodyCompSection userId={user.id} />}

        {tab === "especialista" && <AddSpecialistSection userId={user.id} />}

        {tab === "pacientes" && role === "nutricionista" && <NutricionistaPatients userId={user.id} />}
        {tab === "pacientes" && role === "entrenador" && <EntrenadorPatients userId={user.id} />}
      </main>

      {moreOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute bottom-[84px] left-0 right-0 max-w-lg mx-auto px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card p-2 mb-2">
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-xs uppercase tracking-wide text-soft">Más módulos</p>
                <button onClick={() => setMoreOpen(false)} className="text-soft hover:text-clay">
                  <X size={16} />
                </button>
              </div>
              {extraTabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => selectExtraTab(t.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      active ? "bg-clay/10 text-clay" : "text-ink hover:bg-line/40"
                    }`}
                  >
                    <Icon size={17} strokeWidth={2} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-4 left-4 right-4 z-10">
        <div className="max-w-lg mx-auto glass rounded-full shadow-lg px-1.5 py-1.5 flex items-center justify-between">
          {MAIN_TABS.map((t) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setMoreOpen(false);
                }}
                className={`flex items-center gap-1.5 py-2 rounded-full press transition-all ${
                  active ? "bg-gradient-to-br from-amber to-clay px-3.5 shadow-md" : "px-2.5"
                }`}
              >
                <Icon size={16} strokeWidth={2.2} className={active ? "text-paper" : "text-soft"} />
                {active && <span className="text-[11px] font-semibold text-paper whitespace-nowrap">{t.label}</span>}
              </button>
            );
          })}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex items-center gap-1.5 py-2 rounded-full press transition-all ${
              isExtraActive || moreOpen ? "bg-gradient-to-br from-amber to-clay px-3.5 shadow-md" : "px-2.5"
            }`}
          >
            <MoreHorizontal size={16} strokeWidth={2.2} className={isExtraActive || moreOpen ? "text-paper" : "text-soft"} />
            {(isExtraActive || moreOpen) && <span className="text-[11px] font-semibold text-paper whitespace-nowrap">Más</span>}
          </button>
        </div>
      </nav>
    </div>
  );
}
