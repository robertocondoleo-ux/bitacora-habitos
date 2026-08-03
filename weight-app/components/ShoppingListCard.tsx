"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";

type Item = { id: string; item: string; checked: boolean; suggested_by: string | null };

export default function ShoppingListCard({ userId }: { userId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("shopping_list_items")
      .select("id, item, checked, suggested_by")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    setItems((data as Item[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    await supabase.from("shopping_list_items").insert({ user_id: userId, item: newItem.trim() });
    setNewItem("");
    load();
  }

  async function toggle(id: string, checked: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !checked } : i)));
    await supabase.from("shopping_list_items").update({ checked: !checked }).eq("id", id);
  }

  async function remove(id: string) {
    await supabase.from("shopping_list_items").delete().eq("id", id);
    load();
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart size={15} className="text-clay" strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide text-soft">Lista del súper</p>
      </div>

      <form onSubmit={addItem} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Ej: Avena, yogur, palta…"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button type="submit" className="btn-primary px-4 text-sm">
          <Plus size={15} />
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-soft">cargando…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-soft">Lista vacía. Sumá lo que te falta comprar.</p>
      ) : (
        <div className="space-y-2">
          {items.map((i) => (
            <div
              key={i.id}
              className={`flex items-center gap-3 p-3 rounded-2xl border ${
                i.suggested_by
                  ? "bg-sky/10 border-sky/30"
                  : "bg-panel/60 border-line"
              }`}
            >
              <button
                onClick={() => toggle(i.id, i.checked)}
                aria-label={`Marcar ${i.item}`}
                className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center border-2 transition-all press ${
                  i.checked ? "bg-gradient-to-br from-moss to-moss border-transparent text-paper" : "border-line"
                }`}
              >
                {i.checked && "✓"}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${i.checked ? "text-soft line-through" : "text-ink"}`}>{i.item}</p>
                {i.suggested_by && (
                  <p className="text-[10px] font-semibold text-sky">💡 Sugerido por tu nutricionista</p>
                )}
              </div>
              <button onClick={() => remove(i.id)} className="text-soft hover:text-clay shrink-0" aria-label="Quitar">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
