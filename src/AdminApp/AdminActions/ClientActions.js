import { db } from "../../dbServer";

// Modified fetchClients to accept optional agentId and isArchived filter
export async function fetchClients(agentId = null, isArchived = false, from = null, to = null) {
  let query = db
    .from("clients_Table")
    .select(
      `
      *,
      employee:employee_Accounts(personnel_Name)
    `
    );

  // Apply agent_Id filter if provided
  if (agentId) {
    query = query.eq("agent_Id", agentId); // Use agent_Id (capital 'I')
  }

  // Apply archive filter
  if (isArchived) {
    query = query.eq("is_archived", true);
  } else {
    query = query.or("is_archived.is.null,is_archived.eq.false");
  }

  if (from && to) {
    query = query.gte("client_Registered", from).lte("client_Registered", to);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching clients:", error.message);
    return [];
  }

  console.log("CLIENTS DATA:", data);
  return data;
}

export async function fetchEmployees() {
  const { data, error } = await db
    .from("employee_Accounts")
    .select("id, personnel_Name");

  if (error) {
    console.error("Error fetching employees:", error);
    return [];
  }

  return data;
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