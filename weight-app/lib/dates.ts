export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Lunes de la semana de una fecha dada (ISO string)
export function weekStart(dateISO: string): string {
  const d = new Date(dateISO + "T00:00:00");
  const day = d.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function formatShort(dateISO: string): string {
  const d = new Date(dateISO + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export type MonthRange = {
  key: string; // "2026-07"
  label: string; // "Julio"
  startISO: string;
  endISO: string; // hoy, si es el mes en curso
  totalDays: number; // dias transcurridos (o del mes completo si ya paso)
};

// Devuelve los ultimos `n` meses (incluyendo el actual), con el rango de
// dias real a considerar para calcular porcentajes (el mes en curso solo
// cuenta hasta hoy, no hasta fin de mes).
export function monthRanges(n: number): MonthRange[] {
  const today = new Date();
  const todayISOStr = today.toISOString().slice(0, 10);
  const result: MonthRange[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const first = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const last = new Date(
      today.getFullYear(),
      today.getMonth() - i + 1,
      0
    );
    const startISO = first.toISOString().slice(0, 10);
    const naturalEndISO = last.toISOString().slice(0, 10);
    const endISO = naturalEndISO > todayISOStr ? todayISOStr : naturalEndISO;
    const totalDays =
      Math.round(
        (new Date(endISO + "T00:00:00").getTime() -
          new Date(startISO + "T00:00:00").getTime()) /
          86400000
      ) + 1;

    result.push({
      key: `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
      label: capitalize(
        first.toLocaleDateString("es-AR", { month: "long" })
      ),
      startISO,
      endISO,
      totalDays,
    });
  }
  return result;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
