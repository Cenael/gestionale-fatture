"use client";

interface FilterBarProps {
  month: string;
  onMonthChange: (month: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchType: "numero" | "data";
  onSearchTypeChange: (type: "numero" | "data") => void;
  onSearch: () => void;
}

export default function FilterBar({
  month,
  onMonthChange,
  searchTerm,
  onSearchChange,
  searchType,
  onSearchTypeChange,
  onSearch,
}: FilterBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-center w-full">
      {/* Month Filter */}
      <div className="flex gap-3 items-center">
        <label className="font-semibold text-slate-700 whitespace-nowrap">
          {month ? "Filtro mese:" : "Tutte"}
        </label>
        <input
          type="month"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
        />
        {month && (
          <button
          type="button"
            onClick={() => onMonthChange("")}
            className="text-slate-500 hover:text-slate-700 transition-colors text-sm -ml-3"
          >
            ✕
          </button>
        )}
      </div>

      {/* BARRA DI RICERCA CON RADIO BUTTON E BOTTONE */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
        <div className="flex gap-3 whitespace-nowrap">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="searchType"
              value="numero"
              checked={searchType === "numero"}
              onChange={(e) => onSearchTypeChange(e.target.value as "numero" | "data")}
              className="cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-700">Num</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="searchType"
              value="data"
              checked={searchType === "data"}
              onChange={(e) => onSearchTypeChange(e.target.value as "numero" | "data")}
              className="cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-700">Data</span>
          </label>
        </div>
        <input
          type="text"
          placeholder={searchType === "numero" ? "🔍 Numero..." : "🔍 DD/MM/YYYY..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
        />
        <button
  type="button"
  onClick={onSearch}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors text-sm"
        >
          Cerca
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              onSearch();
            }}
            className="text-slate-500 hover:text-slate-700 transition-colors text-sm"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
