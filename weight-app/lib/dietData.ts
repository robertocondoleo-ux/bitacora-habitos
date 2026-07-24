export type DietId = "deficit" | "keto" | "ayuno";

export type Diet = {
  id: DietId;
  name: string;
  tag: string;
  desc: string;
  macros: string;
  freq: string;
  portions: string;
  foods: string[];
};

export const DIETS: Diet[] = [
  {
    id: "deficit",
    name: "Déficit calórico",
    tag: "Pérdida de grasa gradual",
    desc: "Comés un poco menos de lo que gastás por día, manteniendo proteína alta para cuidar el músculo.",
    macros: "Proteína ~30% · Carbohidratos ~40% · Grasas ~30%",
    freq: "4 comidas al día, cada 3-4 horas",
    portions: "Plato con la mitad de vegetales, un cuarto de proteína, un cuarto de carbohidrato complejo.",
    foods: ["Pechuga de pollo, pescado, huevo", "Legumbres", "Vegetales de todo tipo", "Arroz integral, batata, avena", "Frutas enteras (no jugos)"],
  },
  {
    id: "keto",
    name: "Keto (cetogénica)",
    tag: "Muy baja en carbohidratos",
    desc: "Reducís drásticamente los carbohidratos para que el cuerpo use grasa como combustible principal.",
    macros: "Grasas ~70% · Proteína ~25% · Carbohidratos ~5%",
    freq: "3 comidas al día, sin necesidad de snacks frecuentes",
    portions: "Proteína + grasa saludable como base, vegetales de hoja verde sin límite, carbohidratos casi ausentes.",
    foods: ["Carnes, pescados, huevos", "Palta, aceite de oliva, frutos secos", "Vegetales de hoja verde", "Quesos curados", "Evitar: pan, pastas, azúcar, la mayoría de las frutas"],
  },
  {
    id: "ayuno",
    name: "Ayuno intermitente",
    tag: "Ventanas de alimentación",
    desc: "Concentrás las comidas en una ventana horaria (por ejemplo 8 horas) y ayunás el resto del día.",
    macros: "Sin restricción de macros fija, se adapta al objetivo",
    freq: "2-3 comidas dentro de una ventana de 8 horas (ej. 12:00 a 20:00)",
    portions: "Comidas algo más grandes al estar concentradas en menos horas; priorizar proteína y fibra para saciedad.",
    foods: ["Proteínas magras", "Vegetales con fibra", "Grasas saludables", "Carbohidratos complejos alrededor del entrenamiento"],
  },
];

export type MealId = "desayuno" | "almuerzo" | "merienda" | "cena";

export const MEALS: { id: MealId; label: string }[] = [
  { id: "desayuno", label: "Desayuno" },
  { id: "almuerzo", label: "Almuerzo" },
  { id: "merienda", label: "Merienda" },
  { id: "cena", label: "Cena" },
];

export const DISHES: Record<DietId, Record<MealId, string[]>> = {
  deficit: {
    desayuno: ["Yogur natural con avena y frutos rojos", "Tostadas integrales con huevo revuelto", "Licuado de proteína con banana"],
    almuerzo: ["Pechuga de pollo a la plancha con ensalada y batata al horno", "Salmón con vegetales salteados", "Wok de tofu y vegetales con arroz integral"],
    merienda: ["Fruta + puñado de almendras", "Yogur descremado con canela"],
    cena: ["Ensalada de atún con vegetales", "Omelette de claras con espinaca", "Sopa de vegetales con pollo desmenuzado"],
  },
  keto: {
    desayuno: ["Huevos revueltos con palta y panceta", "Omelette de queso y espinaca", "Yogur griego entero con nueces"],
    almuerzo: ["Salmón con espárragos salteados en manteca", "Ensalada césar con pollo (sin croutons)", "Milanesa de carne con puré de coliflor"],
    merienda: ["Puñado de nueces o almendras", "Bastones de queso"],
    cena: ["Bife con ensalada verde y aceite de oliva", "Pollo al horno con brócoli gratinado", "Tortilla de vegetales con queso"],
  },
  ayuno: {
    desayuno: ["Fuera de ventana — solo infusión sin calorías"],
    almuerzo: ["Bowl grande con proteína, vegetales y carbohidrato complejo (primera comida del día)", "Ensalada completa con pollo, quinoa y palta"],
    merienda: ["Fruta + frutos secos (si entra en la ventana)"],
    cena: ["Última comida de la ventana: proteína + vegetales + grasa saludable", "Salteado de carne y vegetales con arroz"],
  },
};
