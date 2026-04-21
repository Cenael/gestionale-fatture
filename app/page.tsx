"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFatture } from "@/hooks/useFatture";
import { handleExportPDF, handleExportExcel } from "@/lib/export";
import { filterFatture, groupFatture, calculateTotal } from "@/lib/fatture-utils";
import Navbar from "@/components/Navbar";
import FornitoreCard from "@/components/FornitoreCard";
import ActionsBar from "@/components/ActionsBar";
import FilterBar from "@/components/FilterBar";
import KPICards from "@/components/KPICards";
import EmptyState from "@/components/EmptyState";

export default function Home() {
  const router = useRouter();

  const [mese, setMese] = useState(new Date().toISOString().slice(0, 7));
  const [openFornitore, setOpenFornitore] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"numero" | "data">("numero");

  const { data, loading, user, deleteFattura } = useFatture(mese);

  async function handleLogout() {
    const { supabase } = await import("@/lib/supabase-client");
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <div className="p-6">Caricamento...</div>;

  if (!user) {
    return (
      <div className="p-6">
        <h1>Login richiesto</h1>
        <a href="/login">Vai al login</a>
      </div>
    );
  }

  // Utilizza le funzioni utility per filtraggio e grouping
  const filteredData = filterFatture(data, searchTerm, searchType);
  const fornitori_ordinati = groupFatture(filteredData);
  const totaleGenerale = calculateTotal(filteredData);
  const numFatture = filteredData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ACTIONS E EXPORT */}
        <div className="mb-8 flex flex-col gap-4">
          <ActionsBar
            onExportPDF={() => handleExportPDF(filteredData, mese, fornitori_ordinati)}
            onExportExcel={() => handleExportExcel(filteredData, mese, fornitori_ordinati)}
            showExport={filteredData.length > 0}
          />

          {/* FILTRI */}
          <FilterBar
            mese={mese}
            onMeseChange={setMese}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchType={searchType}
            onSearchTypeChange={setSearchType}
          />
        </div>

        {/* KPI CARDS */}
        <KPICards
          numFatture={numFatture}
          totaleGenerale={totaleGenerale}
          numFornitori={fornitori_ordinati.length}
        />

        {/* HEADER FORNITORI */}
        <div className="flex justify-between items-center px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <span>Nome fornitore</span>
          <span>Totale importo fornitore</span>
        </div>

        {/* LISTA FORNITORI COLLAPSIBILE */}
        {filteredData.length > 0 ? (
          <div className="space-y-4">
            {fornitori_ordinati.map((fornitore) => (
              <FornitoreCard
                key={fornitore.nome}
                nome={fornitore.nome}
                fatture={fornitore.fatture}
                totale={fornitore.totale}
                isOpen={openFornitore === fornitore.nome}
                onToggle={() =>
                  setOpenFornitore(
                    openFornitore === fornitore.nome ? null : fornitore.nome,
                  )
                }
                onDeleteFattura={deleteFattura}
                mese={mese}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}