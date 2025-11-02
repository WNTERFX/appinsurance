import { useState, useEffect } from "react";
import { db } from "../../dbServer";

const STORAGE_KEY = "selectedPartner";

export function usePartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ""
  );

  async function fetchPartners() {
    const { data, error } = await db
      .from("insurance_Partners")
      .select("insurance_Name")
      .order("insurance_Name", { ascending: true });

    console.log("Fetched partners:", data, "Error:", error);

    if (error) {
      console.error("Error fetching partners:", error.message);
    } else {
      setPartners(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPartners();
  }, []);

  // whenever selection changes, persist it
  const selectPartner = (partnerName) => {
    setSelected(partnerName);
    localStorage.setItem(STORAGE_KEY, partnerName);
  };

  return { partners, loading, selected, selectPartner };
}