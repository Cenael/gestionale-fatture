"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Link from "next/link"; // ✅ Import corretto

export default function Suppliers() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newSupplier, setNewSupplier] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // ✅ Usiamo useCallback per fetchSuppliers così non viene ricreata a ogni render
  const fetchSuppliers = useCallback(async () => {
    const { data, error: dbError } = await supabase
      .from("fornitori")
      .select("*")
      .order("nome");
    
    if (dbError) {
      setError("Errore nel caricamento: " + dbError.message);
    } else {
      setSuppliers(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        // ✅ replace evita di incastrare l'utente nella cronologia
        router.replace("/login");
        return;
      }
      await fetchSuppliers();
    }
    init();
  }, [router, fetchSuppliers]);

  async function handleAddSupplier(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newSupplier.trim()) {
      setError("Inserisci il nome del fornitore");
      return;
    }

    setIsAdding(true);
    const { data, error: dbError } = await supabase
      .from("fornitori")
      .insert([{ nome: newSupplier.trim() }])
      .select();

    if (dbError) {
      setError("Errore nell'aggiunta: " + dbError.message);
      setIsAdding(false);
    } else if (data) {
      setSuppliers((prev) => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNewSupplier("");
      setIsAdding(false);
    }
  }

  async function handleDeleteSupplier(id: string, supplierName: string) {
    const { data: invoices } = await supabase
      .from("fatture")
      .select("id")
      .eq("fornitore_id", id);

    if (invoices && invoices.length > 0) {
      setError(`Impossibile eliminare: ci sono ${invoices.length} fatture collegate.`);
      return;
    }

    if (!confirm(`Eliminare definitivamente "${supplierName}"?`)) return;

    const { error: dbError } = await supabase.from("fornitori").delete().eq("id", id);

    if (dbError) {
      setError("Errore eliminazione: " + dbError.message);
    } else {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      setError("");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestisci Fornitori</h1>
            <p className="text-slate-600 text-sm">Anagrafica fornitori</p>
          </div>
          {/* ✅ ORA È UN COMPONENTE Link CON L MAIUSCOLA */}
          <Link
            href="/"
            className="text-slate-600 hover:text-sky-600 font-medium transition-colors"
          >
            ← Indietro
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Aggiungi Nuovo</h2>
          <form onSubmit={handleAddSupplier} className="flex gap-4">
            <input
              type="text"
              placeholder="Nome fornitore"
              value={newSupplier}
              onChange={(e) => setNewSupplier(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:bg-slate-400"
            >
              {isAdding ? "..." : "Aggiungi"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              {suppliers.length} {suppliers.length === 1 ? "Fornitore" : "Fornitori"}
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
            {suppliers.map((s) => (
              <div key={s.id} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                <span className="font-semibold text-slate-900">{s.nome}</span>
                <button
                  onClick={() => handleDeleteSupplier(s.id, s.nome)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Elimina
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}