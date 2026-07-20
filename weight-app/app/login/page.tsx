"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(traducirError(error.message));
      } else {
        router.replace("/dashboard");
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(traducirError(error.message));
      } else {
        setInfo(
          "Cuenta creada. Si tu proyecto de Supabase pide confirmación por email, revisá tu bandeja de entrada antes de iniciar sesión."
        );
        setMode("login");
      }
    }
    setLoading(false);
  }

  function traducirError(msg: string) {
    if (msg.includes("Invalid login credentials"))
      return "Email o contraseña incorrectos.";
    if (msg.includes("User already registered"))
      return "Ese email ya tiene una cuenta. Iniciá sesión.";
    if (msg.includes("Password should be"))
      return "La contraseña debe tener al menos 6 caracteres.";
    return msg;
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl text-ink">Bitácora</h1>
          <p className="text-soft text-sm mt-1">
            Peso, hábitos y pasos en un solo lugar.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex mb-6 border border-line rounded-lg overflow-hidden text-sm">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 ${
                mode === "login" ? "bg-ink text-paper" : "bg-panel text-soft"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 ${
                mode === "signup" ? "bg-ink text-paper" : "bg-panel text-soft"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-soft mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vos@email.com"
              />
            </div>
            <div>
              <label className="block text-xs text-soft mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 6 caracteres"
              />
            </div>

            {error && <p className="text-clay text-sm">{error}</p>}
            {info && <p className="text-moss text-sm">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-2.5"
            >
              {loading
                ? "…"
                : mode === "login"
                ? "Entrar"
                : "Crear cuenta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
