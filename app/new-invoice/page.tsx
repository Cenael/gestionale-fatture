"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function NewInvoice() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState("");
  const [form, setForm] = useState({
    numero: "",
    data: "",
    importo: "",
    fornitore_id: "",
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    const { data } = await supabase.from("fornitori").select("*").order("nome");
    setSuppliers(data as any || []);
  }

  async function handleAddSupplier() {
    if (!newSupplier.trim()) return;

    const { data, error } = await supabase
      .from("fornitori")
      .insert([{ nome: newSupplier }])
      .select();

    if (error) {
      setError("Errore nell'aggiunta del fornitore: " + error.message);
    } else if (data) {
      setSuppliers([...suppliers, data[0]]);
      setForm({ ...form, fornitore_id: data[0].id });
      setNewSupplier("");
      setShowNewSupplier(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.fornitore_id) {
      setError("Seleziona un fornitore");
      setLoading(false);
      return;
    }

    if (!form.numero || !form.data || !form.importo) {
      setError("Compila tutti i campi");
      setLoading(false);
      return;
    }

    // Validate DD/MM/YYYY format
    const dataRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = form.data.match(dataRegex);
    
    if (!match) {
      setError("Formato data non valido. Usa DD/MM/YYYY");
      setLoading(false);
      return;
    }

    // Convert DD/MM/YYYY to YYYY-MM-DD for database
    const [, day, month, year] = match;
    const dataDB = `${year}-${month}-${day}`;

    const invoiceData = {
      numero: form.numero.trim(),
      data: dataDB,  // Save as YYYY-MM-DD
      importo: parseFloat(form.importo),
      fornitore_id: form.fornitore_id,
    };

    console.log("Salvando fattura:", invoiceData);

    const { data, error } = await supabase.from("fatture").insert([invoiceData]).select();
    
    if (error) {
      console.error("Errore nel salvataggio:", error);
      setError("Errore nel salvataggio: " + error.message);
      setLoading(false);
    } else {
      console.log("Fattura salvata:", data);
      // Torna al dashboard senza refresh
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Nuova Fattura</h1>
            <p className="text-slate-600 text-sm">Aggiungi una nuova fattura fornitore</p>
          </div>
          <a
            href="/"
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            ← Indietro
          </a>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Numero Fattura
              </label>
              <input
                type="text"
                placeholder="es. FAT-001"
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Data Fattura
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={form.data}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Accetta solo numeri e /
                    value = value.replace(/[^\d/]/g, '');
                    // Formatta automaticamente DD/MM/YYYY
                    if (value.length === 2 && !value.includes('/')) {
                      value = value + '/';
                    } else if (value.length === 5 && (value.match(/\//g) || []).length === 1) {
                      value = value + '/';
                    }
                    // Max 10 caratteri (DD/MM/YYYY)
                    if (value.length <= 10) {
                      setForm({ ...form, data: value });
                    }
                  }}
                  maxLength={10}
                  className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                  required
                />
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) {
                      // Convert YYYY-MM-DD to DD/MM/YYYY
                      const [year, month, day] = e.target.value.split('-');
                      setForm({ ...form, data: `${day}/${month}/${year}` });
                    }
                  }}
                  className="absolute right-0 top-0 w-10 h-10 opacity-0 cursor-pointer"
                  title="Seleziona data dal calendario"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  📅
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Formato: GG/MM/AAAA (es: 02/04/2026)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Importo (€)
            </label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={form.importo}
              onChange={(e) => setForm({ ...form, importo: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fornitore
            </label>
            <div className="flex gap-2">
              <select
                value={form.fornitore_id}
                onChange={(e) =>
                  setForm({ ...form, fornitore_id: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              >
                <option value="">Seleziona fornitore</option>
                {suppliers.map((supplier: any) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewSupplier(!showNewSupplier)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-lg transition"
              >
                + Nuovo
              </button>
            </div>
          </div>

          {showNewSupplier && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nome Fornitore
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome fornitore"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
                <button
                  type="button"
                  onClick={handleAddSupplier}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                >
                  Aggiungi
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Salvataggio..." : "Salva Fattura"}
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition text-center"
            >
              Annulla
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}


