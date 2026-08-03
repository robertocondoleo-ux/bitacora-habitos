"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Role } from "@/lib/specialistData";
import { Settings, X, Check, UserX } from "lucide-react";

const ROLES: { id: Role; label: string; desc: string }[] = [
  { id: "usuario", label: "Usuario", desc: "Seguimiento personal, podés vincularte con un especialista." },
  { id: "nutricionista", label: "Nutricionista", desc: "Ves pacientes que se vinculen con vos y les dejás recomendaciones. Pide aprobación." },
  { id: "entrenador", label: "Entrenador", desc: "Ves pacientes que se vinculen con vos y les asignás entrenamiento." },
];

type PendingRequest = { id: string; email: string; display_name: string | null };

export default function AccountSettingsModal({
  userId,
  currentRole,
  onClose,
  onRoleChange,
}: {
  userId: string;
  currentRole: Role;
  onClose: () => void;
  onRoleChange: (r: Role) => void;
}) {
  const [role, setRole] = useState<Role>(currentRole);
  const [displayName, setDisplayName] = useState("");
  const [roleRequest, setRoleRequest] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [saving, setSaving] = useState(false);

  const loadPending = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .eq("role_request", "nutricionista");
    setPending((data as PendingRequest[]) || []);
  }, []);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("display_name, role_request, is_admin")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setDisplayName(data?.display_name || "");
        setRoleRequest(data?.role_request || null);
        setIsAdmin(!!data?.is_admin);
        if (data?.is_admin) loadPending();
      });
  }, [userId, loadPending]);

  async function save() {
    setSaving(true);
    const wantsNutriApproval = role === "nutricionista" && currentRole !== "nutricionista";
    await supabase
      .from("profiles")
      .update({
        // Si pide ser nutricionista y todavía no lo es, no se activa solo:
        // queda como "usuario" con una solicitud pendiente de aprobación.
        role: wantsNutriApproval ? "usuario" : role,
        role_request: wantsNutriApproval ? "nutricionista" : null,
        display_name: displayName.trim() || null,
      })
      .eq("id", userId);
    setSaving(false);
    onRoleChange(wantsNutriApproval ? "usuario" : role);
    onClose();
  }

  async function approve(patientProfileId: string) {
    await supabase
      .from("profiles")
      .update({ role: "nutricionista", role_request: null })
      .eq("id", patientProfileId);
    loadPending();
  }

  async function reject(patientProfileId: string) {
    await supabase.from("profiles").update({ role_request: null }).eq("id", patientProfileId);
    loadPending();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-panel border border-line rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-clay" />
            <p className="text-xs uppercase tracking-wide text-soft">Mi cuenta</p>
          </div>
          <button onClick={onClose} className="text-soft hover:text-clay">
            <X size={18} />
          </button>
        </div>

        {isAdmin && (
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-soft mb-2">
              Solicitudes pendientes ({pending.length})
            </p>
            {pending.length === 0 ? (
              <p className="text-xs text-soft">Nadie está esperando aprobación.</p>
            ) : (
              <div className="space-y-2">
                {pending.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-moss/10 border border-moss/25"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {(p.display_name || p.email)?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink truncate">{p.display_name || p.email}</p>
                      <p className="text-[11px] text-soft">quiere ser nutricionista</p>
                    </div>
                    <button
                      onClick={() => approve(p.id)}
                      className="w-8 h-8 rounded-full bg-moss text-paper flex items-center justify-center press shrink-0"
                      aria-label="Aprobar"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => reject(p.id)}
                      className="w-8 h-8 rounded-full border border-line text-soft flex items-center justify-center press shrink-0"
                      aria-label="Rechazar"
                    >
                      <UserX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <label className="text-xs text-soft mb-1 block">Nombre para mostrar (opcional)</label>
        <input
          type="text"
          placeholder="Ej: Roberto Condoleo"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mb-5"
        />

        <label className="text-xs text-soft mb-2 block">Tipo de cuenta</label>
        {roleRequest === "nutricionista" && currentRole !== "nutricionista" && (
          <p className="text-xs text-amber mb-2">
            Tu solicitud para ser nutricionista está pendiente de aprobación.
          </p>
        )}
        <div className="space-y-2 mb-6">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`w-full text-left border rounded-xl px-3.5 py-3 transition ${
                role === r.id ? "border-clay bg-clay/10" : "border-line"
              }`}
            >
              <p className={`text-sm font-medium ${role === r.id ? "text-clay" : "text-ink"}`}>{r.label}</p>
              <p className="text-xs text-soft mt-0.5">{r.desc}</p>
            </button>
          ))}
        </div>

        <button onClick={save} disabled={saving} className="btn-primary w-full py-2.5 text-sm">
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}
