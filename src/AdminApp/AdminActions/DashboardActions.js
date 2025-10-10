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

//  Count all active (non-archived) policies
export async function getActivePolicyCount() {
  try {
    const { count, error } = await db
      .from("policy_Table")
      .select("id", { count: "exact", head: true })
      // ensure "not archived" first then filter active => (is_archived IS NULL OR is_archived = false) AND policy_is_active = true
      .or("is_archived.is.null,is_archived.eq.false")
      .eq("policy_is_active", true);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error("Error counting active policies:", err.message);
    return 0;
  }
}

export async function getDeliveredAndUndeliveredCounts() {
  try {
    const { data, error } = await db
      .from("delivery_Table")
      .select("delivered_at") // Only select the column needed for the check
      .or("is_archived.is.null,is_archived.eq.false"); // Filter out archived deliveries

    if (error) {
      console.error("Error fetching delivery rows for counts:", error.message);
      return { deliveredCount: 0, undeliveredCount: 0 };
    }

    if (!data || !Array.isArray(data)) {
      return { deliveredCount: 0, undeliveredCount: 0 };
    }

    let delivered = 0;
    let undelivered = 0;

    for (const record of data) {
      if (record.delivered_at !== null) {
        delivered++;
      } else {
        undelivered++;
      }
    }

    return { deliveredCount: delivered, undeliveredCount: undelivered };
  } catch (err) {
    console.error("Unexpected error counting delivered/undelivered:", err);
    return { deliveredCount: 0, undeliveredCount: 0 };
  }
}