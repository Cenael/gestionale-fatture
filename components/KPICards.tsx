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
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm px-5 py-4 border-l-4 border-sky-500 flex justify-between items-center h-16">
        <p className="text-slate-700 text-sm font-semibold">FATTURE</p>
        <p className="text-xl font-bold text-sky-500">{numFatture}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm px-5 py-4 border-l-4 border-green-500 flex justify-between items-center h-16">
        <p className="text-slate-700 text-sm font-semibold">
          TOTALE IMPORTO FATTURE
        </p>
        <p className="text-base font-bold text-green-500">
          € {totaleGenerale.toFixed(2)}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm px-5 py-4 border-l-4 border-purple-500 flex justify-between items-center h-16">
        <p className="text-slate-700 text-sm font-semibold">
          FORNITORI
        </p>
        <p className="text-xl font-bold text-purple-500">
          {numFornitori}
        </p>
      </div>
    </div>
  );
}
