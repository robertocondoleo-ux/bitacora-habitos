"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { MailCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "recover">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Se activa cuando el registro salió bien y Supabase pide confirmar por
  // email — reemplaza el formulario por una pantalla bien visible.
  const [signupSent, setSignupSent] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  // Flujo de recuperación: solo pide el email. Supabase manda un link que
  // lleva a /reset-password, donde se carga la contraseña nueva.
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      });
      if (error) {
        setError(traducirError(error.message));
      } else {
        setSignupEmail(email);
        setSignupSent(true);
        setEmail("");
        setPassword("");
      }
    }
    setLoading(false);
  }

  async function sendRecoveryLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(recoverEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(traducirError(error.message));
      return;
    }
    setRecoverySent(true);
  }

  function backToLogin() {
    setMode("login");
    setRecoverySent(false);
    setRecoverEmail("");
    setSignupSent(false);
    setSignupEmail("");
    setError(null);
    setInfo(null);
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

  if (signupSent) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-clay/10 text-clay flex items-center justify-center mx-auto mb-5">
            <MailCheck size={28} strokeWidth={1.8} />
          </div>
          <h1 className="font-display text-2xl text-ink mb-2">Confirmá tu email</h1>
          <p className="text-sm text-ink leading-relaxed mb-1">
            Te mandamos un link de confirmación a
          </p>
          <p className="text-sm font-medium text-clay mb-5 break-all">{signupEmail}</p>

          <div className="card p-5 text-left mb-5">
            <p className="text-xs uppercase tracking-wide text-soft mb-2">Para poder entrar</p>
            <ol className="text-sm text-ink space-y-1.5 list-decimal pl-4">
              <li>Abrí ese email (revisá spam si no aparece).</li>
              <li>Tocá el link de confirmación.</li>
              <li>Te va a dejar directo adentro de la app.</li>
            </ol>
          </div>

          <button type="button" onClick={backToLogin} className="w-full text-sm text-soft py-1">
            Ya confirmé, volver a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  if (mode === "recover") {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl text-ink">Bitácora</h1>
            <p className="text-soft text-sm mt-1">Recuperar contraseña</p>
          </div>

          <div className="card p-6">
            {!recoverySent ? (
              <form onSubmit={sendRecoveryLink} className="space-y-4">
                <p className="text-sm text-soft">
                  Escribí el email con el que te registraste. Te mandamos un link para poner una contraseña nueva.
                </p>
                <div>
                  <label className="block text-xs text-soft mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={recoverEmail}
                    onChange={(e) => setRecoverEmail(e.target.value)}
                    placeholder="vos@email.com"
                  />
                </div>

                {error && <p className="text-clay text-sm">{error}</p>}

                <button type="submit" disabled={loading} className="btn-accent w-full py-2.5">
                  {loading ? "…" : "Enviar link"}
                </button>
                <button type="button" onClick={backToLogin} className="w-full text-sm text-soft py-1">
                  Volver a iniciar sesión
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-sm text-ink">
                  Si <strong>{recoverEmail}</strong> tiene una cuenta, te llegó un email con un link. Tocalo para
                  cargar tu contraseña nueva.
                </p>
                <p className="text-xs text-soft">
                  Puede tardar un minuto y a veces cae en spam. Si no llega, pedí uno nuevo.
                </p>
                <button
                  type="button"
                  onClick={() => setRecoverySent(false)}
                  className="w-full text-sm text-soft py-1"
                >
                  Pedir un link nuevo
                </button>
                <button type="button" onClick={backToLogin} className="w-full text-sm text-soft py-1">
                  Volver a iniciar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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

            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("recover")}
                className="w-full text-sm text-soft py-1"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
