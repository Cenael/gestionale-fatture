import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export interface Fattura {
  id: string;
  numero: string;
  data: string;
  importo: number;
  fornitore_id: string;
  fornitori?: { nome: string };
}

export function useFatture(month: string, searchTerm: string = "", searchType: "numero" | "data" = "numero") {
  const [data, setData] = useState<Fattura[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    setUser(userData.user);

    let query = supabase
      .from("fatture")
      .select("*, fornitori(nome)");

    // Month filter
    if (month && month.trim() !== "") {
      const [year, monthNum] = month.split("-");
      const start = `${year}-${monthNum}-01`;
      const lastDay = new Date(
        parseInt(year),
        parseInt(monthNum),
        0
      ).getDate();
      const end = `${year}-${monthNum}-${String(lastDay).padStart(2, "0")}`;

      query = query.gte("data", start).lte("data", end);
    }

    // Search filter
    if (searchTerm && searchTerm.trim() !== "") {
      const searchValue = `%${searchTerm.toLowerCase()}%`;
      if (searchType === "numero") {
        query = query.ilike("numero", searchValue);
      } else {
        query = query.ilike("data", searchValue);
      }
    }

    const { data: invoices } = await query.order("data", { ascending: false });

    setData(invoices || []);
    setLoading(false);
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;

    await supabase.from("fatture").delete().eq("id", id);
    setData(data.filter((invoice) => invoice.id !== id));
  };

  useEffect(() => {
    let isMounted = true;
    loadData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) {
          setUser(session?.user || null);
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [month, searchTerm, searchType]);

  return { data, loading, user, deleteInvoice, refetch: loadData };
}
