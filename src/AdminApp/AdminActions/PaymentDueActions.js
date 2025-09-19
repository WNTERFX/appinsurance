import { db } from "../../dbServer";

// Fetch all payments linked to a policy
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

export async function paymentEdit(policyId) {
  const { data, error } = await db
    .from("payment_Table")
    .update("paid_amount")
}