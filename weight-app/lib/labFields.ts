export type LabField = {
  key: string;
  label: string;
  unit: string;
  min: number | null;
  max: number | null;
  group: string;
  labelRe: RegExp;
  unitRe: RegExp;
};

export const LAB_GROUPS = [
  "Metabolismo",
  "Lípidos",
  "Hemograma",
  "Hepatograma",
  "Tiroides",
  "Renal y otros",
];

export const LAB_FIELDS: LabField[] = [
  { key: "glucosa", label: "Glucemia (glucosa)", unit: "mg/dL", min: 70, max: 100, group: "Metabolismo", labelRe: /glucemia/i, unitRe: /mg\/dL/i },
  { key: "insulina", label: "Insulina basal", unit: "µUI/mL", min: 2.6, max: 24.6, group: "Metabolismo", labelRe: /insulina/i, unitRe: /µUI\/mL/i },
  { key: "hba1c", label: "Hemoglobina glicosilada (HbA1c)", unit: "%", min: null, max: 5.7, group: "Metabolismo", labelRe: /hemoglobina\s*glicosilada/i, unitRe: /%/ },

  { key: "colesterolTotal", label: "Colesterol total", unit: "mg/dL", min: null, max: 200, group: "Lípidos", labelRe: /colesterol\s*total/i, unitRe: /mg\/dL/i },
  { key: "hdl", label: "Colesterol HDL", unit: "mg/dL", min: 40, max: null, group: "Lípidos", labelRe: /colesterol\s*hdl/i, unitRe: /mg\/dL/i },
  { key: "ldl", label: "Colesterol LDL", unit: "mg/dL", min: null, max: 130, group: "Lípidos", labelRe: /colesterol\s*ldl/i, unitRe: /mg\/dL/i },
  { key: "trigliceridos", label: "Triglicéridos", unit: "mg/dL", min: null, max: 150, group: "Lípidos", labelRe: /triglic\w*/i, unitRe: /mg\/dL/i },

  { key: "hemoglobina", label: "Hemoglobina", unit: "g/dL", min: 12, max: 17, group: "Hemograma", labelRe: /hemoglobina(?!\s*glicosilada)/i, unitRe: /g\/dL/i },
  { key: "hematocrito", label: "Hematocrito", unit: "%", min: 36, max: 50, group: "Hemograma", labelRe: /hematocrito/i, unitRe: /%/ },
  { key: "leucocitos", label: "Leucocitos", unit: "/mm3", min: 4500, max: 11000, group: "Hemograma", labelRe: /\bleucocitos\b/i, unitRe: /\/mm3/i },
  { key: "plaquetas", label: "Plaquetas", unit: "/mm3", min: 150000, max: 450000, group: "Hemograma", labelRe: /plaquetas/i, unitRe: /\/mm3/i },

  { key: "tgo", label: "TGO", unit: "UI/L", min: null, max: 40, group: "Hepatograma", labelRe: /\btgo\b/i, unitRe: /UI\/L/i },
  { key: "tgp", label: "TGP", unit: "UI/L", min: null, max: 41, group: "Hepatograma", labelRe: /\btgp\b/i, unitRe: /UI\/L/i },
  { key: "bilirrubinaTotal", label: "Bilirrubina total", unit: "mg/dL", min: null, max: 1.2, group: "Hepatograma", labelRe: /bilirrubina\s*total/i, unitRe: /mg\/dL/i },
  { key: "fosfatasaAlcalina", label: "Fosfatasa alcalina", unit: "UI/L", min: 40, max: 130, group: "Hepatograma", labelRe: /fosfatasa\s*alcalina/i, unitRe: /UI\/L/i },
  { key: "proteinasTotales", label: "Proteínas totales", unit: "g/dL", min: 6.4, max: 8.3, group: "Hepatograma", labelRe: /prote[ií]nas\s*totales/i, unitRe: /g\/dL/i },

  { key: "tsh", label: "TSH (tirotrofina)", unit: "µUI/mL", min: 0.4, max: 4.2, group: "Tiroides", labelRe: /tirotrofina|\btsh\b/i, unitRe: /µUI\/mL/i },
  { key: "t4", label: "Tiroxina (T4)", unit: "µg/dL", min: 5.1, max: 14.1, group: "Tiroides", labelRe: /tiroxina/i, unitRe: /µg\/dL/i },

  { key: "creatinina", label: "Creatinina", unit: "mg/dL", min: 0.7, max: 1.3, group: "Renal y otros", labelRe: /creatinina/i, unitRe: /mg\/dL/i },
  { key: "urea", label: "Urea", unit: "mg/dL", min: null, max: 50, group: "Renal y otros", labelRe: /urea/i, unitRe: /mg\/dL/i },
  { key: "acidoUrico", label: "Ácido úrico", unit: "mg/dL", min: 3.4, max: 7.0, group: "Renal y otros", labelRe: /[aá]cido\s*[uú]rico/i, unitRe: /mg\/dL/i },
  { key: "ferritina", label: "Ferritina", unit: "ng/mL", min: 24, max: 336, group: "Renal y otros", labelRe: /ferritina/i, unitRe: /ng\/mL/i },
  { key: "vitaminaD", label: "Vitamina D", unit: "ng/mL", min: 30, max: 100, group: "Renal y otros", labelRe: /vitamina\s*d/i, unitRe: /ng\/mL/i },
];

export function extractValue(text: string, field: LabField): string | null {
  const m = field.labelRe.exec(text);
  if (!m) return null;
  const searchText = text.slice(m.index + m[0].length, m.index + m[0].length + 400);
  const valRe = new RegExp("(\\d+(?:[.,]\\d+)?)\\s*" + field.unitRe.source, "i");
  const vm = valRe.exec(searchText);
  return vm ? vm[1].replace(",", ".") : null;
}

// Extrae el texto completo de un PDF en el navegador usando pdfjs-dist
// (el worker se sirve desde cdnjs para no complicar el bundling de Next).
export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let fullText = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    fullText += content.items.map((it: any) => ("str" in it ? it.str : "")).join(" ") + "\n";
  }
  return fullText;
}
