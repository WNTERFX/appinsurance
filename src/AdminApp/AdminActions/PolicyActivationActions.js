import { db } from "../../dbServer";


export async function ActivatePolicyAndPayment(policyId, paymentTypeId, totalPremium, months)
{
  try {
    // 1. Activate the policy
    const { data: policyData, error: policyError } = await db
      .from("policy_Table")
      .update({ policy_is_active: true })
      .eq("id", policyId)
      .select();

    if (policyError) throw policyError;

    // 2. Generate monthly payments
     const monthlyAmount = Math.round((totalPremium / months) * 100) / 100;
    const today = new Date();

    const paymentRows = Array.from({ length: months }, (_, i) => ({
      payment_date: new Date(today.getFullYear(), today.getMonth() + (i + 1), today.getDate()), // each month ahead
      amount_to_be_paid: monthlyAmount,
      is_paid: false,
      created_at: new Date(),
      policy_id: policyId,
      paid_amount: null,
      payment_type_id: paymentTypeId,
    }));

    // 3. Insert payments
    const { data: paymentData, error: paymentError } = await db
      .from("payment_Table")
      .insert(paymentRows)
      .select();

    if (paymentError) throw paymentError;

    return { success: true, policy: policyData, payments: paymentData };
  } catch (error) {
    console.error("Error activating policy with payments:", error.message);
    return { success: false, error: error.message };
  }
  
}