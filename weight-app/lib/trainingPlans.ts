export type GoalId = "fuerza" | "hipertrofia" | "grasa" | "cardio" | "movilidad";

export const GOALS: { id: GoalId; label: string }[] = [
  { id: "fuerza", label: "Fuerza" },
  { id: "hipertrofia", label: "Hipertrofia (ganar músculo)" },
  { id: "grasa", label: "Perder grasa" },
  { id: "cardio", label: "Resistencia / cardio" },
  { id: "movilidad", label: "Movilidad y salud general" },
];

type Focus = { focus: string; exercises: string[] };

const POOLS: Record<GoalId, Focus[]> = {
  fuerza: [
    { focus: "Sentadilla + press banca", exercises: ["Sentadilla con barra 4x6", "Press de banca 4x6", "Zancadas con mancuernas 3x10", "Fondos en paralelas 3x8"] },
    { focus: "Peso muerto + press militar", exercises: ["Peso muerto 4x5", "Press militar de pie 4x6", "Remo con barra 3x8", "Curl de bíceps 3x10"] },
    { focus: "Remo + dominadas", exercises: ["Dominadas (o jaladera) 4x6", "Remo con mancuerna 4x8", "Peso muerto rumano 3x8", "Face pull 3x12"] },
  ],
  hipertrofia: [
    { focus: "Empuje (pecho/hombro/tríceps)", exercises: ["Press de banca 4x10", "Press inclinado con mancuernas 3x12", "Elevaciones laterales 3x15", "Extensión de tríceps en polea 3x12"] },
    { focus: "Tracción (espalda/bíceps)", exercises: ["Jaladera al pecho 4x10", "Remo sentado en polea 3x12", "Curl de bíceps con barra 3x12", "Face pull 3x15"] },
    { focus: "Piernas", exercises: ["Sentadilla 4x10", "Prensa 3x12", "Curl femoral 3x12", "Elevación de talones (gemelos) 4x15"] },
    { focus: "Full body", exercises: ["Sentadilla 3x10", "Press de banca 3x10", "Remo con barra 3x10", "Plancha 3x30seg"] },
  ],
  grasa: [
    { focus: "Full body + cardio", exercises: ["Circuito: sentadilla, press, remo (3 vueltas)", "Cardio continuo 15-20 min", "Plancha 3x30seg"] },
    { focus: "Circuito metabólico", exercises: ["Burpees 4x12", "Kettlebell swing 4x15", "Mountain climbers 4x20", "Saltos al cajón 3x10"] },
    { focus: "Piernas + core", exercises: ["Sentadilla goblet 4x12", "Zancadas 3x12 c/pierna", "Puente de glúteo 3x15", "Abdominales 3x20"] },
    { focus: "Cardio + movilidad", exercises: ["Cardio en cinta/bici 25-30 min", "Movilidad de cadera y hombros 10 min", "Estiramiento general"] },
  ],
  cardio: [
    { focus: "Cardio continuo (zona 2)", exercises: ["Trote suave o bici 30-40 min a ritmo conversable"] },
    { focus: "Intervalos (HIIT)", exercises: ["8-10 series de 30seg fuerte / 90seg suave (bici, trote o remo)"] },
    { focus: "Cardio + core", exercises: ["Cardio moderado 20 min", "Plancha 3x30seg", "Abdominales bicicleta 3x20"] },
    { focus: "Cardio suave / recuperación", exercises: ["Caminata rápida 30-40 min", "Estiramiento general 10 min"] },
  ],
  movilidad: [
    { focus: "Movilidad + fuerza liviana", exercises: ["Sentadilla con peso corporal 3x15", "Rotaciones de cadera y hombro", "Banda elástica remo 3x15"] },
    { focus: "Caminata / cardio suave", exercises: ["Caminata 30-45 min a paso firme"] },
    { focus: "Movilidad + core", exercises: ["Gato-camello, rotaciones torácicas", "Plancha 3x20seg", "Bird-dog 3x10 c/lado"] },
  ],
};

export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const PATTERNS: Record<number, number[]> = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export type PlanDay = { dayIdx: number; dayLabel: string; focus: string; exercises: string[] };

export function buildCombinedPlan(goals: GoalId[], days: number): PlanDay[] {
  const g = goals.length ? goals : (["hipertrofia"] as GoalId[]);
  const focuses: Focus[] = [];
  for (let i = 0; i < days; i++) {
    const goal = g[i % g.length];
    const pool = POOLS[goal];
    const idx = Math.floor(i / g.length) % pool.length;
    focuses.push(pool[idx]);
  }
  const pattern = PATTERNS[days] || PATTERNS[3];
  return pattern.map((dayIdx, i) => ({
    dayIdx,
    dayLabel: DIAS[dayIdx],
    focus: focuses[i].focus,
    exercises: focuses[i].exercises,
  }));
}
