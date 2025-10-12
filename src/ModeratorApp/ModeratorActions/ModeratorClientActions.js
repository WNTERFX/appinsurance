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
export async function fetchModeratorClients(agentId, from = null, to = null) {
  if (!agentId) {
    console.error("fetchModeratorClients requires a valid agentId");
    return [];
  }

  let query = db
    .from("clients_Table")
    .select(`
      *,
      employee:employee_Accounts(personnel_Name)
    `)
    .eq("agent_Id", agentId) // only clients assigned to the moderator
    .or("is_archived.is.null,is_archived.eq.false"); // exclude archived clients

  // Optional date range filter
  if (from && to) {
    query = query.gte("client_Registered", from).lte("client_Registered", to);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching moderator clients:", error.message);
    return [];
  }

  console.log("MODERATOR CLIENTS DATA:", data);
  return data;
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

export async function archiveClient(clientUid) {
  const { data, error } = await db
    .from("clients_Table")
    .update({
      is_archived: true,
      archival_date: new Date().toISOString().split("T")[0],
    })
    .eq("uid", clientUid) 
    .select();

  if (error) {
    console.error("Error archiving client:", error.message);
    throw error;
  }

  return data?.[0] || null;
}


