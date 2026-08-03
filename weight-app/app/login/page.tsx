"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { MailCheck } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

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

  async function handleGoogleLogin() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed top-4 right-4 z-20"><ThemeToggle /></div>
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed top-4 right-4 z-20"><ThemeToggle /></div>
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
    <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed top-4 right-4 z-20"><ThemeToggle /></div>
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

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-soft">o</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 rounded-lg border border-line bg-panel text-ink text-sm font-medium flex items-center justify-center gap-2.5 press"
          >
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.5 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
            </svg>
            Continuar con Google
          </button>
        </div>
      </div>
    </div>
  );
}
