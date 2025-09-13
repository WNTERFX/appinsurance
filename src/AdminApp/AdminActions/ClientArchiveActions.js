import { db } from "../../dbServer";

/**
 * Fetch all archived clients
 */
export async function fetchArchivedClients() {
  const { data, error } = await db
    .from("clients_Table")
    .select(`
      *,
      employee:employee_Accounts(personnel_Name)
    `)
    .eq("is_archived", true)          // must be archived
    .not("archival_date", "is", null) // must have archival date
    .order("client_Registered", { ascending: false });

  if (error) {
    console.error("Error fetching archived clients:", error.message);
    return [];
  }

  return data || [];
}


export async function getArchivedClientById(clientUid) {
  const { data, error } = await db
    .from("clients_Table")
    .select(`
      *,
      employee:employee_Accounts(personnel_Name)
    `)
    .eq("uid", clientUid)
    .eq("is_archived", true)          // must be archived
    .not("archival_date", "is", null) // must have archival date
    .single();

  if (error) {
    console.error("Error fetching archived client:", error.message);
    return null;
  }

  return data;
}


export async function unarchiveClient(clientUid) {
  const { data, error } = await db
    .from("clients_Table")
    .update({
      is_archived: false,
      archival_date: null,
    })
    .eq("uid", clientUid)
    .select();

  if (error) {
    console.error("Error unarchiving client:", error.message);
    throw error;
  }

  return data?.[0] || null;
}
