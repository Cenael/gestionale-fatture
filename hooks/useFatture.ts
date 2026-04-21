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

export function useFatture(mese: string, searchTerm: string = "", searchType: "numero" | "data" = "numero") {
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

    // Filtro per mese se specificato
    if (mese && mese.trim() !== "") {
      const [anno, mese_num] = mese.split("-");
      const start = `${anno}-${mese_num}-01`;
      const ultimoGiorno = new Date(
        parseInt(anno),
        parseInt(mese_num),
        0
      ).getDate();
      const end = `${anno}-${mese_num}-${String(ultimoGiorno).padStart(2, "0")}`;

      query = query.gte("data", start).lte("data", end);
    }

    // Filtro per ricerca basato sul tipo selezionato
    if (searchTerm && searchTerm.trim() !== "") {
      const searchValue = `%${searchTerm.toLowerCase()}%`;
      if (searchType === "numero") {
        query = query.ilike("numero", searchValue);
      } else {
        query = query.ilike("data", searchValue);
      }
    }

    const { data: fatture } = await query.order("data", { ascending: false });

    setData(fatture || []);
    setLoading(false);
  };

  const deleteFattura = async (id: string) => {
    if (!confirm("Eliminare questa fattura?")) return;

    await supabase.from("fatture").delete().eq("id", id);
    setData(data.filter((f) => f.id !== id));
  };

  useEffect(() => {
    let isMounted = true;
    loadData();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) {
          setUser(session?.user || null);
        }
      }
    );

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [mese, searchTerm, searchType]);

  return { data, loading, user, deleteFattura, refetch: loadData };
}
