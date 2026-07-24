"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Role } from "@/lib/specialistData";
import { Settings, X } from "lucide-react";

const ROLES: { id: Role; label: string; desc: string }[] = [
  { id: "usuario", label: "Usuario", desc: "Seguimiento personal, podés vincularte con un especialista." },
  { id: "nutricionista", label: "Nutricionista", desc: "Ves pacientes que se vinculen con vos y les dejás recomendaciones." },
  { id: "entrenador", label: "Entrenador", desc: "Ves pacientes que se vinculen con vos y les asignás entrenamiento." },
];

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name || ""));
  }, [userId]);

  async function save() {
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ role, display_name: displayName.trim() || null })
      .eq("id", userId);
    setSaving(false);
    onRoleChange(role);
    onClose();
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

        <label className="text-xs text-soft mb-1 block">Nombre para mostrar (opcional)</label>
        <input
          type="text"
          placeholder="Ej: Roberto Condoleo"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mb-5"
        />

        <label className="text-xs text-soft mb-2 block">Tipo de cuenta</label>
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
