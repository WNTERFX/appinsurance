import { db } from "../../dbServer";

// Fetch ARCHIVED policies for this moderator
export async function fetchModeratorArchivedPolicies(agentId) {
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
        suffix
      ),
      insurance_Partners(
        insurance_Name,
        insurance_Rate
      ),
      policy_Computation_Table(
        total_Premium
      )
    `)
    .eq("is_archived", true)
    .not("archival_date", "is", null)
    .eq("clients_Table.agent_Id", agentId) // ✅ fixed field
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function unarchiveModeratorPolicy(policyId) {
  const { data, error } = await db
    .from("policy_Table")
    .update({
      is_archived: false,
      archival_date: null,
    })
    .eq("id", policyId)
    .select();

  if (error) throw error;
  return data?.[0] || null;
}

export async function deleteModeratorPolicy(policyId) {
  const { error } = await db
    .from("policy_Table")
    .delete()
    .eq("id", policyId);

  if (error) throw error;
  return true;
}
