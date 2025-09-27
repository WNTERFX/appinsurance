import { db } from "../../dbServer";

// ✅ Fetch policies + payments but only for clients of this moderator/agent
export async function fetchModeratorPoliciesWithPayments(moderatorId) {
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
    .eq("clients_Table.agent_Id", moderatorId)   // 🔑 filter by agent/moderator
    .or("is_archived.is.null,is_archived.eq.false")
    .is("archival_date", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchPaymentSchedule(policyId) {
  const { data, error } = await db
    .from("payment_Table")
    .select(`
      id,
      payment_date,
      amount_to_be_paid,
      is_paid,
      paid_amount
    `)
    .eq("policy_id", policyId)
    .order("payment_date", { ascending: true });

  if (error) throw error;
  return data || [];
}
