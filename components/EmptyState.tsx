"use client";

import { useRouter } from "next/navigation";

interface EmptyStateProps {
  onCreateInvoice?: () => void;
}

export default function EmptyState({ onCreateInvoice }: EmptyStateProps) {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <p className="text-slate-600 text-lg mb-4">
        Nessuna fattura in questo periodo
      </p>
      <button
        onClick={onCreateInvoice || (() => router.push("/nuova-fattura"))}
        className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors"
      >
        Crea la prima fattura
      </button>
    </div>
  );
}
