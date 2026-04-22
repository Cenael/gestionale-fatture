"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFatture } from "@/hooks/useInvoice";
import { handleExportPDF, handleExportExcel } from "@/lib/export";
import { groupFatture, calculateTotal } from "@/lib/invoice-utils";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-slate-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Login Richiesto
          </h1>
          <p className="text-slate-600 text-lg mb-8">
            Accedi al tuo account per continuare e gestire le tue fatture.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            Vai al Login
          </a>
        </div>
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