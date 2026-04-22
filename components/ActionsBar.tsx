"use client";

import { useRouter } from "next/navigation";

interface ActionsBarProps {
  onNewInvoice?: () => void;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  showExport: boolean;
}

export default function ActionsBar({
  onNewInvoice,
  onExportPDF,
  onExportExcel,
  showExport,
}: ActionsBarProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
      <div className="flex flex-col sm:flex-row gap-3 items-start w-full sm:w-auto">
        <button
          onClick={onNewInvoice || (() => router.push("/new-invoice"))}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors shadow-md text-sm"
        >
          Nuova Fattura
        </button>
        <button
          onClick={() => router.push("/suppliers")}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition-colors text-sm"
        >
          Fornitori
        </button>
      </div>

      {showExport && (
        <div className="flex gap-4 text-sm">
          <button
            onClick={onExportPDF}
            className="text-slate-600 hover:text-slate-800 font-semibold transition-colors"
          >
            📄 PDF
          </button>
          <span className="text-slate-400">|</span>
          <button
            onClick={onExportExcel}
            className="text-slate-600 hover:text-slate-800 font-semibold transition-colors"
          >
            📊 Excel
          </button>
        </div>
      )}
    </div>
  );
}
