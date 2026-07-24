"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/dates";
import { LAB_FIELDS, LAB_GROUPS, extractValue, extractPdfText } from "@/lib/labFields";
import { AlertTriangle, FileText, TrendingUp, TrendingDown, Minus, Trash2, Upload } from "lucide-react";

type StudyEntry = { id: string; date: string; values: Record<string, number> };

export default function StudiesSection({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<StudyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayISO());
  const [values, setValues] = useState<Record<string, string>>({});
  const [pdfStatus, setPdfStatus] = useState<{ type: "ok" | "error"; msg: string } | null>(null);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("study_entries")
      .select("id, date, values")
      .eq("user_id", userId)
      .order("date", { ascending: true });
    setEntries((data as StudyEntry[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReading(true);
    setPdfStatus({ type: "ok", msg: "Leyendo PDF…" });
    try {
      const text = await extractPdfText(file);
      let found = 0;
      const newValues = { ...values };
      LAB_FIELDS.forEach((f) => {
        const v = extractValue(text, f);
        if (v) {
          newValues[f.key] = v;
          found++;
        }
      });
      setValues(newValues);
      setPdfStatus(
        found > 0
          ? { type: "ok", msg: `Detectamos ${found} valor(es) automáticamente. Revisalos abajo antes de guardar.` }
          : { type: "error", msg: "No pudimos detectar valores automáticamente en este PDF. Cargalos a mano abajo." }
      );
    } catch (err) {
      setPdfStatus({ type: "error", msg: "No pudimos leer este PDF. Cargá los valores a mano abajo." });
    }
    setReading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function addStudy(e: React.FormEvent) {
    e.preventDefault();
    const clean: Record<string, number> = {};
    Object.entries(values).forEach(([k, v]) => {
      if (v !== "" && v != null) clean[k] = parseFloat(v);
    });
    if (Object.keys(clean).length === 0) return;
    setSaving(true);
    await supabase.from("study_entries").insert({ user_id: userId, date, values: clean });
    setValues({});
    setPdfStatus(null);
    setSaving(false);
    load();
  }

  async function removeStudy(id: string) {
    await supabase.from("study_entries").delete().eq("id", id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="card p-5 border-clay/30 bg-clay/5">
        <div className="flex gap-2.5">
          <AlertTriangle size={17} className="text-clay shrink-0 mt-0.5" />
          <p className="text-xs text-ink leading-relaxed">
            Esto es solo un organizador de datos personales. Las señales de "alto/bajo" comparan tu valor contra un
            rango de referencia general orientativo —{" "}
            <strong>no es una interpretación clínica ni un diagnóstico</strong>, y los rangos reales pueden variar
            según el laboratorio y tu situación particular. Llevá siempre estos resultados a tu médico de cabecera
            para que los interprete.
          </p>
        </div>
      </div>

      <form onSubmit={addStudy} className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={15} className="text-clay" strokeWidth={2} />
          <p className="text-xs uppercase tracking-wide text-soft">Cargar nuevo estudio</p>
        </div>

        <label className="text-xs text-soft mb-2 block">PDF del estudio</label>
        <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-line rounded-xl p-5 text-center text-xs text-soft cursor-pointer hover:border-clay/50 transition mb-2">
          <Upload size={18} className="text-soft" />
          {reading ? "Leyendo…" : "Tocá para elegir el PDF de tu análisis"}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
          />
        </label>
        {pdfStatus && (
          <p className={`text-xs mb-3 ${pdfStatus.type === "ok" ? "text-moss" : "text-clay"}`}>{pdfStatus.msg}</p>
        )}

        <label className="text-xs text-soft mb-2 block mt-3">Fecha del estudio</label>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="max-w-[160px] mb-4"
        />

        <label className="text-xs text-soft mb-2 block">Valores (autocompletados si se detectaron — revisalos)</label>
        {LAB_GROUPS.map((group) => (
          <div key={group} className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-moss mb-2">{group}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LAB_FIELDS.filter((f) => f.group === group).map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] text-soft block mb-1">
                    {f.label} ({f.unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={values[f.key] || ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-sm mt-2">
          {saving ? "Guardando…" : "Guardar estudio"}
        </button>
      </form>

      <div className="card p-5">
        <p className="text-xs uppercase tracking-wide text-soft mb-3">Histórico y comparación</p>
        {loading ? (
          <p className="text-sm text-soft">cargando…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-soft">Todavía no cargaste ningún estudio.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left font-normal text-soft pb-2 pr-3 font-mono text-xs">Valor</th>
                  {entries.map((s) => (
                    <th key={s.id} className="text-left font-normal text-soft pb-2 pr-3 font-mono text-xs">
                      {s.date}{" "}
                      <button onClick={() => removeStudy(s.id)} className="text-soft hover:text-clay align-middle">
                        <Trash2 size={11} className="inline" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LAB_GROUPS.map((group) => {
                  const fields = LAB_FIELDS.filter(
                    (f) => f.group === group && entries.some((s) => s.values[f.key] != null)
                  );
                  if (fields.length === 0) return null;
                  return (
                    <React.Fragment key={group}>
                      <tr>
                        <td
                          colSpan={entries.length + 1}
                          className="font-mono text-[10px] uppercase tracking-wide text-moss pt-4 pb-1 border-b border-line"
                        >
                          {group}
                        </td>
                      </tr>
                      {fields.map((f) => (
                        <tr key={f.key} className="border-b border-line">
                          <td className="py-2 pr-3 text-ink font-medium">
                            {f.label} <span className="text-soft font-normal">({f.unit})</span>
                          </td>
                          {entries.map((s, i) => {
                            const val = s.values[f.key];
                            if (val == null) return <td key={s.id} className="text-line py-2 pr-3">—</td>;
                            let flag: "alto" | "bajo" | "normal" = "normal";
                            if (f.min != null && val < f.min) flag = "bajo";
                            if (f.max != null && val > f.max) flag = "alto";
                            const prev = i > 0 ? entries[i - 1].values[f.key] : null;
                            const color = flag === "alto" ? "text-clay" : flag === "bajo" ? "text-amber" : "text-moss";
                            return (
                              <td key={s.id} className={`py-2 pr-3 font-mono font-semibold ${color}`}>
                                <span className="inline-flex items-center gap-1">
                                  {val}
                                  {prev != null && val > prev && <TrendingUp size={12} />}
                                  {prev != null && val < prev && <TrendingDown size={12} />}
                                  {prev != null && val === prev && <Minus size={12} />}
                                  {flag !== "normal" && (
                                    <span className="text-[9px] uppercase font-mono">{flag}</span>
                                  )}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

