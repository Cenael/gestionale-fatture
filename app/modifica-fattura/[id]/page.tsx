"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter, useParams } from "next/navigation";

export default function ModificaFattura() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [fornitori, setFornitori] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    numero: "",
    data: "",
    importo: "",
    fornitore_id: "",
  });

  useEffect(() => {
    fetchFornitori();
    fetchFattura();
  }, [id]);

  async function fetchFornitori() {
    const { data } = await supabase.from("fornitori").select("*").order("nome");
    setFornitori(data as any || []);
  }

  async function fetchFattura() {
    const { data, error: fetchError } = await supabase
      .from("fatture")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      setError("Errore nel caricamento della fattura: " + fetchError.message);
      setLoading(false);
      return;
    }

    if (data) {
      // Converti data YYYY-MM-DD a DD/MM/YYYY
      const [anno, mese, giorno] = data.data.split("-");
      const dataFormattata = `${giorno}/${mese}/${anno}`;

      setForm({
        numero: data.numero,
        data: dataFormattata,
        importo: data.importo.toString(),
        fornitore_id: data.fornitore_id,
      });
    }

    setLoading(false);
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

    // Valida formato DD/MM/YYYY
    const dataRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = form.data.match(dataRegex);

    if (!match) {
      setError("Formato data non valido. Usa DD/MM/YYYY");
      setLoading(false);
      return;
    }

    // Converti DD/MM/YYYY a YYYY-MM-DD per il DB
    const [, giorno, mese, anno] = match;
    const dataDB = `${anno}-${mese}-${giorno}`;

    const fatturaData = {
      numero: form.numero.trim(),
      data: dataDB,
      importo: parseFloat(form.importo),
      fornitore_id: form.fornitore_id,
    };

    console.log("Aggiornando fattura:", fatturaData);

    const { error: updateError } = await supabase
      .from("fatture")
      .update(fatturaData)
      .eq("id", id);

    if (updateError) {
      console.error("Errore nell'aggiornamento:", updateError);
      setError("Errore nell'aggiornamento: " + updateError.message);
      setLoading(false);
    } else {
      console.log("Fattura aggiornata");
      // Torna al dashboard senza refresh
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600"></div>
          <p className="mt-4 text-slate-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Modifica Fattura</h1>
            <p className="text-slate-600 text-sm">Modifica i dati della fattura</p>
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
                    value = value.replace(/[^\d/]/g, "");
                    // Formatta automaticamente DD/MM/YYYY
                    if (value.length === 2 && !value.includes("/")) {
                      value = value + "/";
                    } else if (value.length === 5 && (value.match(/\//g) || []).length === 1) {
                      value = value + "/";
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
                      // Converti YYYY-MM-DD a DD/MM/YYYY
                      const [anno, mese, giorno] = e.target.value.split("-");
                      setForm({ ...form, data: `${giorno}/${mese}/${anno}` });
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
            <select
              value={form.fornitore_id}
              onChange={(e) => setForm({ ...form, fornitore_id: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            >
              <option value="">Seleziona fornitore</option>
              {fornitori.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Salvataggio..." : "Salva Modifiche"}
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
