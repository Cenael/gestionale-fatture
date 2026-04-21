"use client";

import { useRouter } from "next/navigation";

interface NavbarProps {
  onLogout: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🍺</span>
          <h1 className="text-2xl font-bold text-slate-900">Gestionale Bar</h1>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => router.push("/fornitori")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
          >
            🏢 Fornitori
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
