import { db } from "../../dbServer";


export async function recentClientTable() {

const { data, error } = await db
    .from("clients_Table")
    .select(`
      uid,
      first_Name,
      middle_Name,
      family_Name,
      client_Registered,
      employee_Accounts:agent_Id (
        personnel_Name
      )
    `)
    .or("is_archived.is.null,is_archived.eq.false")
    .order("client_Registered", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching clients:", error.message);
    return [];
  }

  return data.map((client) => ({
    uid: client.uid,
    fullName: `${client.first_Name || ""} ${client.middle_Name || ""} ${
      client.family_Name || ""
    }`.trim(),
    agent_Name: client.employee_Accounts?.personnel_Name || "N/A",
    client_Registered: new Date(client.client_Registered).toLocaleDateString(),
  }));
    
}

export async function fetchRecentPolicy() {


  const {data, error} = await db 
    .from("policy_Table")
    .select(`
      *,
      clients_Table(
        first_Name,
        middle_Name,
        family_Name,
        prefix,
        suffix
    )`)
    .or("is_archived.is.null,is_archived.eq.false")
    .is("archival_date", null)
    .order("created_at", { ascending: false })
    .limit(20);

    if (error) {
    console.error("Error fetching policy:", error.message);
    return [];
  }
  return data;

}

export async function getClientCount() {
  const { count, error } = await db
    .from("clients_Table")
    .select("uid", { count: "exact", head: true }) // only count, no rows
    .or("is_archived.is.null,is_archived.eq.false");

  if (error) {
    console.error("Error counting clients:", error.message);
    return 0;
  }

  return count;
}