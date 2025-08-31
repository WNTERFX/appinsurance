import { db } from "../../dbServer";

export async function fetchClients() {
  const { data, error } = await db
    .from("ClientPolicy_Table")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error.message);
    return [];
  }
  return data;
}
