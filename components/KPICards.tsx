"use client";

interface KPICardsProps {
  numFatture: number;
  totaleGenerale: number;
  numFornitori: number;
}

export default function KPICards({
  numFatture,
  totaleGenerale,
  numFornitori,
}: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm px-4 sm:px-5 py-4 border-l-4 border-sky-500 flex flex-col sm:flex-row justify-between sm:items-center h-auto sm:h-16 gap-2 sm:gap-0">
        <p className="text-slate-700 text-sm font-semibold">FATTURE</p>
        <p className="text-xl font-bold text-sky-500">{numFatture}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm px-4 sm:px-5 py-4 border-l-4 border-green-500 flex flex-col sm:flex-row justify-between sm:items-center h-auto sm:h-16 gap-2 sm:gap-0">
        <p className="text-slate-700 text-sm font-semibold">
          TOTALE IMPORTO FATTURE
        </p>
        <p className="text-base font-bold text-green-500">
          € {totaleGenerale.toFixed(2)}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm px-4 sm:px-5 py-4 border-l-4 border-slate-300 flex flex-col sm:flex-row justify-between sm:items-center h-auto sm:h-16 gap-2 sm:gap-0">
        <p className="text-slate-700 text-sm font-semibold">
          FORNITORI
        </p>
        <p className="text-xl font-bold text-slate-700">
          {numFornitori}
        </p>
      </div>
    </div>
  );
}
