"use client";

import { useRouter } from "next/navigation";
import {
  handleExportPDFFornitore,
  handleExportExcelFornitore,
} from "@/lib/export";

export interface Fattura {
  id: string;
  numero: string;
  data: string;
  importo: number;
}

export interface FornitoreCardProps {
  nome: string;
  fatture: Fattura[];
  totale: number;
  isOpen: boolean;
  onToggle: () => void;
  onDeleteFattura: (id: string) => void;
  mese: string;
}

export default function FornitoreCard({
  nome,
  fatture,
  totale,
  isOpen,
  onToggle,
  onDeleteFattura,
  mese,
}: FornitoreCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* HEADER FORNITORE - CLICCABILE */}
      <div
        onClick={onToggle}
        className="cursor-pointer p-4 md:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-colors border-l-4 border-sky-500"
      >
        <div>
          <h3 className="font-bold text-base sm:text-lg text-slate-900">{nome}</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            {fatture.length} fattur{fatture.length !== 1 ? "e" : "a"}
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="text-right">
            <p className="text-lg sm:text-2xl font-bold text-green-600">
              € {totale.toFixed(2)}
            </p>
          </div>
          <span
            className="text-2xl transition-transform"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {/* DETTAGLI FATTURE - COLLAPSIBILE */}
      {isOpen && (
        <div className="border-t border-slate-200 p-6">
          {/* HEADER TABELLA */}
          <div className="grid grid-cols-12 gap-3 mb-3 pb-3 border-b border-slate-300">
            <div className="col-span-3">
              <p className="text-xs font-semibold text-slate-700 uppercase">
                Num Fattura
              </p>
            </div>
            <div className="col-span-3 flex justify-center">
              <p className="text-xs font-semibold text-slate-700 uppercase">
                Data
              </p>
            </div>
            <div className="col-span-3 flex justify-end">
              <p className="text-xs font-semibold text-slate-700 uppercase">
                Importo
              </p>
            </div>
            <div className="col-span-3" />
          </div>

          {/* RIGHE FATTURE */}
          <div className="space-y-2">
            {fatture.map((f: Fattura) => (
              <div
                key={f.id}
                className="grid grid-cols-12 gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors items-center"
              >
                <div className="col-span-3">
                  <p className="font-semibold text-slate-900">{f.numero}</p>
                </div>
                <div className="col-span-3 flex justify-center">
                  <p className="text-sm text-slate-600">
                    {new Date(f.data).toLocaleDateString("it-IT")}
                  </p>
                </div>
                <div className="col-span-3 flex justify-end">
                  <p className="font-bold text-green-600">
                    € {Number(f.importo).toFixed(2)}
                  </p>
                </div>
                <div className="col-span-3 flex gap-3 justify-end">
                  <button
                    onClick={() => router.push(`/modifica-fattura/${f.id}`)}
                    className="px-2 py-1 text-slate-500 hover:text-slate-700 transition-colors text-sm"
                    title="Modifica"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteFattura(f.id)}
                    className="px-2 py-1 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                    title="Elimina"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* EXPORT SINGOLO FORNITORE */}
          <div className="border-t border-slate-200 pt-4 flex gap-4 text-sm">
            <button
              onClick={() => handleExportPDFFornitore(nome, fatture, mese)}
              className="text-slate-600 hover:text-slate-800 font-semibold transition-colors"
            >
              📄 PDF
            </button>
            <span className="text-slate-400">|</span>
            <button
              onClick={() => handleExportExcelFornitore(nome, fatture, mese)}
              className="text-slate-600 hover:text-slate-800 font-semibold transition-colors"
            >
              📊 Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
