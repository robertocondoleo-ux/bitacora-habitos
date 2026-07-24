"use client";

import { useEffect, useState } from "react";
import { Sparkles, Dumbbell, FileText, Salad, Activity, MoreHorizontal, X } from "lucide-react";

// Si en el futuro agregás más novedades para anunciar, cambiá este string
// (ej. a "2026-09") — al ser distinto del guardado en localStorage, el
// popup vuelve a aparecer una vez más para todos los usuarios.
const WHATS_NEW_VERSION = "2026-07-modulos-salud";
const STORAGE_KEY = "bitacora_whatsnew_seen";

const ITEMS = [
  {
    icon: MoreHorizontal,
    title: 'Nuevo botón "Más"',
    desc: 'Abajo a la derecha de la barra de navegación. Desde ahí entrás a los 4 módulos nuevos.',
  },
  {
    icon: Dumbbell,
    title: "Entrenamiento",
    desc: "Elegí tus objetivos (se pueden combinar) y días disponibles: te armamos una distribución semanal con ejercicios. Registrá series y repeticiones con histórico.",
  },
  {
    icon: FileText,
    title: "Estudios",
    desc: "Cargá tus análisis de sangre — probamos leer los valores automáticamente desde el PDF — y compará resultados a lo largo del tiempo.",
  },
  {
    icon: Salad,
    title: "Dieta",
    desc: "Enfoques alimentarios (déficit, keto, ayuno intermitente) con ejemplos de platos según la comida del día.",
  },
  {
    icon: Activity,
    title: "Composición corporal",
    desc: "Seguimiento de peso, % grasa y % músculo con gráfico de evolución.",
  },
];

export default function WhatsNewModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== WHATS_NEW_VERSION) setOpen(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, WHATS_NEW_VERSION);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-panel border border-line rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-clay" />
            <p className="text-xs uppercase tracking-wide text-soft">Novedades</p>
          </div>
          <button onClick={dismiss} className="text-soft hover:text-clay">
            <X size={18} />
          </button>
        </div>
        <h2 className="font-display text-2xl text-ink mb-4">Bitácora sumó salud completa</h2>

        <div className="space-y-4 mb-6">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-clay/10 text-clay flex items-center justify-center shrink-0">
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs text-soft leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={dismiss} className="btn-primary w-full py-2.5 text-sm">
          Entendido
        </button>
      </div>
    </div>
  );
}
