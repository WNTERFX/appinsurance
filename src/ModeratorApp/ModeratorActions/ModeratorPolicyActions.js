import { db } from "../../dbServer";

//  Fetch only policies where the linked client belongs to the moderator
export async function fetchModeratorPolicies(moderatorId) {
  const { data, error } = await db
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
        phone_Number
      ),
      insurance_Partners(
        insurance_Name,
        insurance_Rate
      ),
      policy_Computation_Table(
        total_Premium
      ) 
     
    `)
   

    .eq("clients_Table.agent_Id", moderatorId) //  filter by the agent that owns the client
    .or("is_archived.is.null,is_archived.eq.false")
    .is("archival_date", null)
    .order("created_at", { ascending: false });

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