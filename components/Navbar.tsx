"use client";

import { useRouter } from "next/navigation";

interface NavbarProps {
  onLogout: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">🍺</span>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900">Gestionale Bar</h1>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 rounded-md transition-colors text-sm font-medium hover:shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
