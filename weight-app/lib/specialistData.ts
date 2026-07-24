export type Role = "usuario" | "nutricionista" | "entrenador";

export const SPECIALTIES: { id: "nutricionista" | "entrenador"; label: string }[] = [
  { id: "nutricionista", label: "Nutricionista" },
  { id: "entrenador", label: "Entrenador" },
];

// Todas las secciones que un usuario puede elegir compartir con su
// especialista. Las 4 primeras son los módulos de salud; las últimas 4 son
// los datos originales de la app (peso, pasos, hábitos, comidas).
export type SectionId =
  | "peso"
  | "pasos"
  | "habitos"
  | "comidas"
  | "entrenamiento"
  | "estudios"
  | "dieta"
  | "composicion";

export const SHARABLE_SECTIONS: { id: SectionId; label: string }[] = [
  { id: "peso", label: "Peso" },
  { id: "pasos", label: "Pasos" },
  { id: "habitos", label: "Hábitos" },
  { id: "comidas", label: "Comidas" },
  { id: "entrenamiento", label: "Entrenamiento" },
  { id: "estudios", label: "Estudios" },
  { id: "dieta", label: "Dieta" },
  { id: "composicion", label: "Composición corporal" },
];

export const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
