import { db } from "../../dbServer";

//  Fetch only policies where the linked client belongs to the moderator
export async function fetchModeratorPolicies(moderatorId, fromDate = null, toDate = null, partnerId = null) {
  console.log("fetchModeratorPolicies called with:", {
    moderatorId,
    fromDate,
    toDate,
    partnerId,
  });

  let query = db
    .from("policy_Table")
    .select(`
      *,
      clients_Table!inner(
        agent_Id,
        first_Name,
        middle_Name,
        family_Name,
        prefix,
        suffix,
        address,
        email,
        phone_Number,
        internal_id
      ),
      insurance_Partners(
        insurance_Name,
        insurance_Rate
      ),
      policy_Computation_Table(
        total_Premium
      )
    `)
    .eq("clients_Table.agent_Id", moderatorId) // ✅ filter by agent that owns the client
    .or("is_archived.is.null,is_archived.eq.false")
    .is("archival_date", null);

  // ✅ Add date filtering if both are provided
  if (fromDate && toDate) {
    query = query
      .gte("created_at", fromDate)
      .lte("created_at", toDate);
  }

  // ✅ Add partner filter if provided
  if (partnerId) {
    console.log("Applying partner filter:", partnerId);
    query = query.eq("partner_id", partnerId);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  console.log("Moderator policy query result:", {
    count: data?.length,
    error,
  });

  if (data && data.length > 0) {
    console.log("Sample moderator policy:", data[0].partner_id);
  }

  if (error) throw error;
  return data || [];
}

// Create a new policy 
// The agent_Id is stored in the client
export async function createModeratorPolicy(policyData) {
  const { data, error } = await db
    .from("policy_Table")
    .insert([policyData])
    .select();

  if (error) throw error;
  return data;
}
export async function fetchModeratorClients(moderatorId) {
  const { data, error } = await db
    .from("clients_Table")
    .select("*")
    .order("client_Registered", { ascending: false }) // ⬅ newest first
    .eq("agent_Id", moderatorId); // Only clients of this moderator
    
  if (error) throw error;
  return data || [];
}

export async function archivePolicy(policyId) {
  const { data, error } = await db
    .from("policy_Table")
    .update({
      is_archived: true,
      archival_date: new Date().toISOString().split("T")[0], 
    })
    .eq("id", policyId)
    .select(); 

  if (error) throw error;
  return data?.[0] || null;
}

export async function fetchPartners() {
  const { data, error } = await db
    .from("insurance_Partners")
    .select("id, insurance_Name")
    .order("insurance_Name", { ascending: true });
  if (error) throw error;
  return data;
}
