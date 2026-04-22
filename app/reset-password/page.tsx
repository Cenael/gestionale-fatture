"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleUpdatePassword() {
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Compila tutti i campi");
      return;
    }

    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage("Password aggiornata! Reindirizzamento...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Nuova password
        </h2>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Nuova password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg"
          />

          <input
            type="password"
            placeholder="Conferma password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg"
          />
        </div>

        {error && (
          <div className="mt-4 text-red-600 text-sm">{error}</div>
        )}

        {message && (
          <div className="mt-4 text-green-600 text-sm">{message}</div>
        )}

        <button
          onClick={handleUpdatePassword}
          disabled={loading}
          className="w-full mt-6 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg"
        >
          {loading ? "Aggiornamento..." : "Aggiorna password"}
        </button>
      </div>
    </div>
  );
}