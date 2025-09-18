import { db } from "../../dbServer";

// Get logged-in moderator (from Supabase auth)
export async function getCurrentUser() {
  const { data, error } = await db.auth.getUser();
  if (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
  return data?.user || null;
}

// Fetch ONLY clients assigned to this moderator
export async function fetchModeratorClients(agentId) {
  const { data, error } = await db
    .from("clients_Table")
    .select(`
      *,
      employee:employee_Accounts(personnel_Name)
    `)
    .eq("agent_Id", agentId) // filter only assigned
    .or("is_archived.is.null,is_archived.eq.false"); // allow null or false

  if (error) {
    console.error("Error fetching moderator clients:", error);
    return [];
  }

  return data || [];
}

// Create new client for this moderator
export async function createModeratorClient(clientData) {
  const { data, error } = await db
    .from("clients_Table")
    .insert([clientData])
    .select();

  if (error) {
    console.error("Supabase error creating moderator client:", error.message || error);
    return null;
  }

  return data?.[0] || null;
}

