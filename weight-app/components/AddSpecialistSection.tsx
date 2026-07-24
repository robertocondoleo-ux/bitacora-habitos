"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SHARABLE_SECTIONS, SectionId } from "@/lib/specialistData";
import { UserPlus, Search, Share2, Construction, Check } from "lucide-react";

type Specialty = "nutricionista" | "entrenador";

type SpecialistProfile = { id: string; email: string; display_name: string | null };

type Link = {
  id: string;
  specialist_id: string;
  specialty: Specialty;
  shared_sections: SectionId[];
  status: "pending" | "active";
  specialistEmail?: string;
  specialistName?: string | null;
};

export default function AddSpecialistSection({ userId }: { userId: string }) {
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [specialists, setSpecialists] = useState<SpecialistProfile[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    const { data } = await supabase
      .from("specialist_links")
      .select("id, specialist_id, specialty, shared_sections, status")
      .eq("patient_id", userId);

    const rows = (data as any[]) || [];
    if (rows.length === 0) {
      setLinks([]);
      setLoading(false);
      return;
    }
    const ids = rows.map((r) => r.specialist_id);
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .in("id", ids);
    const byId: Record<string, SpecialistProfile> = {};
    (profs || []).forEach((p: any) => (byId[p.id] = p));

    setLinks(
      rows.map((r) => ({
        ...r,
        specialistEmail: byId[r.specialist_id]?.email,
        specialistName: byId[r.specialist_id]?.display_name,
      }))
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  async function searchSpecialists(sp: Specialty) {
    setSpecialty(sp);
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .eq("role", sp)
      .neq("id", userId);
    setSpecialists((data as SpecialistProfile[]) || []);
    setSearching(false);
  }

  async function linkSpecialist(specialistId: string) {
    if (!specialty) return;
    setLinking(specialistId);
    await supabase.from("specialist_links").upsert(
      { patient_id: userId, specialist_id: specialistId, specialty, shared_sections: [], status: "pending" },
      { onConflict: "patient_id,specialist_id" }
    );
    setLinking(null);
    setSpecialty(null);
    setSpecialists([]);
    loadLinks();
  }

  async function toggleSection(link: Link, section: SectionId) {
    const has = link.shared_sections.includes(section);
    const newSections = has
      ? link.shared_sections.filter((s) => s !== section)
      : [...link.shared_sections, section];
    setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, shared_sections: newSections } : l)));
    await supabase.from("specialist_links").update({ shared_sections: newSections }).eq("id", link.id);
  }

  async function removeLink(id: string) {
    await supabase.from("specialist_links").delete().eq("id", id);
    loadLinks();
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={15} className="text-clay" strokeWidth={2} />
          <p className="text-xs uppercase tracking-wide text-soft">Agregar especialista</p>
        </div>

        <p className="text-xs text-soft mb-2">1. Elegí la especialidad</p>
        <div className="flex gap-2 mb-4">
          {(["nutricionista", "entrenador"] as Specialty[]).map((sp) => (
            <button
              key={sp}
              onClick={() => searchSpecialists(sp)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition capitalize ${
                specialty === sp ? "border-clay bg-clay/10 text-clay" : "border-line text-soft hover:border-soft"
              }`}
            >
              {sp}
            </button>
          ))}
        </div>

        {specialty && (
          <div className="mb-2">
            <p className="text-xs text-soft mb-2 flex items-center gap-1.5">
              <Search size={12} /> 2. Elegí a quién vincularte
            </p>
            {searching ? (
              <p className="text-xs text-soft">buscando…</p>
            ) : specialists.length === 0 ? (
              <p className="text-xs text-soft">
                Todavía no hay ninguna cuenta registrada como {specialty}.
              </p>
            ) : (
              <div className="space-y-2">
                {specialists.map((s) => {
                  const already = links.find((l) => l.specialist_id === s.id);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between border border-line rounded-xl px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm text-ink">{s.display_name || s.email}</p>
                        <p className="text-[11px] text-soft">{s.email}</p>
                      </div>
                      {already ? (
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            already.status === "active" ? "text-moss" : "text-amber"
                          }`}
                        >
                          <Check size={13} /> {already.status === "active" ? "vinculado" : "pendiente de aceptar"}
                        </span>
                      ) : (
                        <button
                          onClick={() => linkSpecialist(s.id)}
                          disabled={linking === s.id}
                          className="btn-primary px-3 py-1.5 text-xs"
                        >
                          {linking === s.id ? "…" : "Vincular"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Share2 size={15} className="text-clay" strokeWidth={2} />
          <p className="text-xs uppercase tracking-wide text-soft">Compartir contenido</p>
        </div>
        {loading ? (
          <p className="text-xs text-soft">cargando…</p>
        ) : links.length === 0 ? (
          <p className="text-xs text-soft">
            Todavía no te vinculaste con ningún especialista. Cuando lo hagas, acá vas a poder elegir qué secciones
            le mostrás a cada uno.
          </p>
        ) : (
          <div className="space-y-5">
            {links.map((link) => (
              <div key={link.id} className="border border-line rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {link.specialistName || link.specialistEmail}
                    </p>
                    <p className="text-[11px] text-soft capitalize flex items-center gap-1.5">
                      {link.specialty}
                      <span className={link.status === "active" ? "text-moss" : "text-amber"}>
                        · {link.status === "active" ? "vinculado" : "esperando que acepte"}
                      </span>
                    </p>
                  </div>
                  <button onClick={() => removeLink(link.id)} className="text-xs text-clay">
                    Quitar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SHARABLE_SECTIONS.map((sec) => {
                    const active = link.shared_sections.includes(sec.id);
                    return (
                      <button
                        key={sec.id}
                        onClick={() => toggleSection(link, sec.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                          active ? "border-moss bg-moss/10 text-moss" : "border-line text-soft"
                        }`}
                      >
                        {sec.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4 border-amber/40 bg-amber/10">
        <div className="flex gap-2.5">
          <Construction size={16} className="text-amber shrink-0 mt-0.5" />
          <p className="text-xs text-ink leading-relaxed">
            Cuando elegís un especialista, el vínculo queda <strong>pendiente</strong> hasta que él lo acepte de su
            lado. Recién ahí empieza a ver las secciones que le compartas. Por ahora no le llega ninguna notificación
            automática — tenés que avisarle vos que le mandaste la solicitud.
          </p>
        </div>
      </div>
    </div>
  );
}
