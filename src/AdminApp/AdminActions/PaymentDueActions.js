import { db } from "../../dbServer";

// Fetch all payments linked to a policy
export async function fetchPaymentSchedule(policyId) {
  const { data, error } = await db
    .from("payment_Table")
    .select(`id, payment_date, amount_to_be_paid, is_paid, paid_amount`)
    .eq("policy_id", policyId)
    .order("payment_date", { ascending: true });

  if (error) throw error;
  return data || [];
}

// Update an existing payment
export async function updatePayment(paymentId, paidAmount, amountToBePaid) {
  if (!paymentId) throw new Error("Payment ID is required");
  const { data, error } = await db
    .from("payment_Table")
    .update({
      paid_amount: paidAmount,
      is_paid: paidAmount >= amountToBePaid  // Fixed: use >= instead of =
    })
    .eq("id", paymentId)
    .select(); // important to get updated row back
  if (error) throw error;
  return data[0]; // the updated row
}

export async function fetchArchivedPayments() {
  const { data, error } = await db
    .from("payment_Table")
    .select(`
      *,
      policy_Table!inner (
        id,
        internal_id,
        policy_type,
        policy_is_active,
        client_id,
        clients_Table (
          prefix,
          first_Name,
          middle_Name,
          family_Name,
          suffix
        )
      )
    `)
    .eq("is_archived", true)
    .order("payment_date", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Archive a payment
export async function archivePayment(paymentId) {
  if (!paymentId) throw new Error("Payment ID is required");
  
  const { data, error } = await db
    .from("payment_Table")
    .update({ is_archived: true })
    .eq("id", paymentId)
    .select();
  
  if (error) throw error;
  return data[0];
}

// Unarchive a payment
export async function unArchivePayment(paymentId) {
  if (!paymentId) throw new Error("Payment ID is required");
  
  const { data, error } = await db
    .from("payment_Table")
    .update({ is_archived: false })
    .eq("id", paymentId)
    .select();
  
  if (error) throw error;
  return data[0];
}

// Delete a payment permanently
export async function deletePayment(paymentId) {
  if (!paymentId) throw new Error("Payment ID is required");
  
  const { error } = await db
    .from("payment_Table")
    .delete()
    .eq("id", paymentId);
  
  if (error) throw error;
  return true;
}

export async function generatePayments(policyId, payments) {
  if (!policyId) throw new Error("Policy ID is required");
  if (!payments || payments.length === 0) throw new Error("Payments array is required");

  // Validate policy exists
  const { data: policy, error: policyError } = await db
    .from("policy_Table")
    .select("id")
    .eq("id", policyId)
    .single();

  if (policyError) throw policyError;

  // Prepare payment records with policy_id
  const paymentRecords = payments.map(payment => ({
    policy_id: policyId,
    payment_date: payment.payment_date,
    amount_to_be_paid: payment.amount_to_be_paid,
    paid_amount: payment.paid_amount || 0,
    is_paid: payment.is_paid || false,
    payment_type_id: payment.payment_type_id || 1, // Default to 1 if not provided
    is_archive: false
  }));

  // Insert all payments
  const { data, error } = await db
    .from("payment_Table")
    .insert(paymentRecords)
    .select();

  if (error) throw error;
  return data;
}