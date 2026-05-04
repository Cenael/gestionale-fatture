"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFatture } from "@/hooks/useFatture";
import { handleExportPDF, handleExportExcel } from "@/lib/export";
import { groupFatture, calculateTotal } from "@/lib/fatture-utils";
import Navbar from "@/components/Navbar";
import SupplierCard from "@/components/SupplierCard";
import ActionsBar from "@/components/ActionsBar";
import FilterBar from "@/components/FilterBar";
import KPICards from "@/components/KPICards";
import EmptyState from "@/components/EmptyState";

export default function Home() {
  const router = useRouter();

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [openSupplier, setOpenSupplier] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"numero" | "data">("numero");
  const [activeSearch, setActiveSearch] = useState("");

  const { data, loading, user, deleteInvoice } = useFatture(month, activeSearch, searchType);

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
  const orderedSuppliers = groupFatture(data);
  const totalAmount = calculateTotal(data);
  const invoiceCount = data.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ACTIONS E EXPORT */}
        <div className="mb-8 flex flex-col gap-4">
          <ActionsBar
            onExportPDF={() => handleExportPDF(data, month, orderedSuppliers)}
            onExportExcel={() => handleExportExcel(data, month, orderedSuppliers)}
            showExport={data.length > 0}
          />

          {/* FILTRI */}
          <FilterBar
            month={month}
            onMonthChange={setMonth}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchType={searchType}
            onSearchTypeChange={setSearchType}
            onSearch={() => setActiveSearch(searchTerm)}
          />
        </div>

        {/* KPI CARDS */}
        <KPICards
          invoiceCount={invoiceCount}
          totalAmount={totalAmount}
          supplierCount={orderedSuppliers.length}
        />

        {/* HEADER FORNITORI */}
        <div className="flex justify-between items-center px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <span>Nome fornitore</span>
          <span>Totale importo fornitore</span>
        </div>

        {/* LISTA FORNITORI COLLAPSIBILE */}
        {data.length > 0 ? (
          <div className="space-y-4">
            {orderedSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.nome}
                nome={supplier.nome}
                fatture={supplier.fatture}
                total={supplier.total}
                isOpen={openSupplier === supplier.nome}
                onToggle={() =>
                  setOpenSupplier(
                    openSupplier === supplier.nome ? null : supplier.nome,
                  )
                }
                onDeleteInvoice={deleteInvoice}
                month={month}
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