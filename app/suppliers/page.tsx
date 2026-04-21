"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function Suppliers() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newSupplier, setNewSupplier] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }
    setUser(userData.user);
    fetchSuppliers();
  }

  async function fetchSuppliers() {
    const { data } = await supabase
      .from("fornitori")
      .select("*")
      .order("nome");
    setSuppliers(data as any || []);
    setLoading(false);
  }

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
      setError("Errore nell'aggiunta del fornitore: " + dbError.message);
      setIsAdding(false);
    } else if (data) {
      setSuppliers([...suppliers, data[0]].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNewSupplier("");
      setIsAdding(false);
    }
  }

  async function handleDeleteSupplier(id: string, supplierName: string) {
    // Check if supplier has associated invoices
    const { data: associatedInvoices, error: checkError } = await supabase
      .from("fatture")
      .select("id", { count: "exact" })
      .eq("fornitore_id", id);

    if (checkError) {
      setError("Errore nel controllo delle fatture: " + checkError.message);
      return;
    }

    if (associatedInvoices && associatedInvoices.length > 0) {
      setError(
        `Non puoi eliminare "${supplierName}" perché ha ${associatedInvoices.length} ${associatedInvoices.length !== 1 ? "fatture" : "fattura"} associata${associatedInvoices.length !== 1 ? "e" : ""}. Elimina prima le fatture.`
      );
      return;
    }

    if (
      !confirm(
        `Sei sicuro di voler eliminare "${supplierName}"? Questa azione non può essere annullata.`
      )
    ) {
      return;
    }

    const { error: dbError } = await supabase
      .from("fornitori")
      .delete()
      .eq("id", id);

    if (dbError) {
      setError("Errore nell'eliminazione: " + dbError.message);
    } else {
      setSuppliers(suppliers.filter((s) => s.id !== id));
      setError("");
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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gestisci Fornitori
            </h1>
            <p className="text-slate-600 text-sm">
              Aggiungi, modifica o elimina i tuoi fornitori
            </p>
          </div>
          <a
            href="/"
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            ← Indietro
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Form Nuovo Fornitore */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            Aggiungi Nuovo Fornitore
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleAddSupplier} className="flex gap-4">
            <input
              type="text"
              placeholder="Nome fornitore"
              value={newSupplier}
              onChange={(e) => setNewSupplier(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition"
            >
              {isAdding ? "Aggiungendo..." : "Aggiungi"}
            </button>
          </form>
        </div>

        {/* Suppliers List */}
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              {suppliers.length} {suppliers.length !== 1 ? "Fornitori" : "Fornitore"}
            </h2>
          </div>

          {suppliers.length === 0 ? (
            <div className="px-8 py-12 text-center">
              <p className="text-slate-600 text-lg mb-4">Nessun fornitore aggiunto</p>
              <p className="text-slate-500">
                Aggiungi il tuo primo fornitore usando il modulo sopra
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="px-8 py-4 hover:bg-slate-50 transition flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {supplier.nome}
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      handleDeleteSupplier(supplier.id, supplier.nome)
                    }
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition"
                  >
                    Elimina
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
