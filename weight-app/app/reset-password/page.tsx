"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [validLink, setValidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // El link de recuperación deja al usuario con una sesión temporal
    // (Supabase la detecta sola desde el link al cargar la página).
    supabase.auth.getSession().then(({ data }) => {
      setValidLink(!!data.session);
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.replace("/dashboard"), 1500);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-soft">cargando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl text-ink">Bitácora</h1>
          <p className="text-soft text-sm mt-1">Nueva contraseña</p>
        </div>

        <div className="card p-6">
          {!validLink ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-ink">
                Este link ya venció o no es válido. Los links de recuperación duran una hora y solo se pueden usar
                una vez.
              </p>
              <button onClick={() => router.replace("/login")} className="btn-accent w-full py-2.5 mt-2">
                Volver al login
              </button>
            </div>
          ) : done ? (
            <p className="text-sm text-moss text-center">
              Contraseña actualizada. Te estamos llevando a la app…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-soft">Cargá tu contraseña nueva.</p>
              <div>
                <label className="block text-xs text-soft mb-1">Contraseña nueva</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="mínimo 6 caracteres"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-soft mb-1">Repetila</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="repetí la contraseña"
                />
              </div>

              {error && <p className="text-clay text-sm">{error}</p>}

              <button type="submit" disabled={loading} className="btn-accent w-full py-2.5">
                {loading ? "…" : "Guardar contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
