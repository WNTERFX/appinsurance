import { db } from "../../dbServer";

export async function fetchClients() {
  const { data, error } = await db
    .from("clients_Table")
    .select(`
      *,
      employee:employee_Accounts(personnel_Name)
    `)
     .or("is_archived.is.null,is_archived.eq.false"); // allow false or null
  
  
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
