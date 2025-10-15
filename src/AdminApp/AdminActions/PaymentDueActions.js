import { db } from "../../dbServer";
import { fetchPenaltiesForPayments, calculateTotalDue, calculateRemainingBalance } from "./PaymentPenaltyActions";

// Fetch all payments linked to a policy
export async function fetchPaymentSchedule(policyId) {
  const { data: payments, error } = await db
    .from("payment_Table")
    .select(`id, payment_date, amount_to_be_paid, is_paid, paid_amount`)
    .eq("policy_id", policyId)
    .order("payment_date", { ascending: true });

  if (error) throw error;

  const paymentIds = payments.map(p => p.id);
  const penaltiesMap = await fetchPenaltiesForPayments(paymentIds);

  // Attach penalties and calculate totals
  return payments.map(p => {
    const penalties = penaltiesMap[p.id] || [];
    return {
      ...p,
      penalties,
      total_due: calculateTotalDue(p, penalties),
      remaining_balance: calculateRemainingBalance(p, penalties)
    };
  });
}

// Update an existing payment
export async function updatePayment(paymentId, paidAmount) {
  if (!paymentId) throw new Error("Payment ID is required");
  if (!paidAmount || paidAmount <= 0) throw new Error("Paid amount must be positive");

  const { data: currentPayment, error: fetchError } = await db
    .from("payment_Table")
    .select("id, policy_id, payment_date, amount_to_be_paid, paid_amount, is_paid")
    .eq("id", paymentId)
    .single();

  if (fetchError) throw fetchError;
  if (!currentPayment) throw new Error("Payment not found");

  const { policy_id } = currentPayment;

  const { data: allPayments, error: allError } = await db
    .from("payment_Table")
    .select("id, payment_date, amount_to_be_paid, paid_amount, is_paid")
    .eq("policy_id", policy_id)
    .order("payment_date", { ascending: true });

  if (allError) throw allError;

  const currentIndex = allPayments.findIndex(p => p.id === paymentId);
  if (currentIndex === -1) throw new Error("Payment not found in schedule");

  let remaining = paidAmount;
  const updates = [];

 for (let i = currentIndex; i < allPayments.length && remaining > 0; i++) {
  const payment = allPayments[i];

  // Apply to penalties first
  const { data: penalties } = await db
    .from("payment_due_penalties")
    .select("id, penalty_amount, is_paid")
    .eq("payment_id", payment.id)
    .order("penalty_date", { ascending: true });

  for (const penalty of penalties || []) {
    if (penalty.is_paid) continue;
    const toPay = Math.min(remaining, penalty.penalty_amount);
    remaining -= toPay;

    await db
      .from("payment_due_penalties")
      .update({ is_paid: toPay >= penalty.penalty_amount })
      .eq("id", penalty.id);

    if (remaining <= 0) break;
    }

    if (remaining <= 0) break;

    // Apply to payment
    const due = parseFloat(payment.amount_to_be_paid);
    const alreadyPaid = parseFloat(payment.paid_amount || 0);
    const needed = Math.max(due - alreadyPaid, 0);

    if (needed <= 0) continue;

    const applied = Math.min(remaining, needed);
    const newPaid = alreadyPaid + applied;
    const isPaid = newPaid >= due;

    updates.push({
      id: payment.id,
      paid_amount: newPaid,
      is_paid: isPaid,
      spillover: applied < remaining ? true : false
    });

    console.log(
      applied < remaining
        ? `💧 Spillover applied to ${payment.payment_date}: ₱${applied.toFixed(2)}`
        : `✅ Payment applied to ${payment.payment_date}: ₱${applied.toFixed(2)}`
    );

    remaining -= applied;
  }

  for (const up of updates) {
    const { error: updateErr } = await db
      .from("payment_Table")
      .update({
        paid_amount: up.paid_amount,
        is_paid: up.is_paid
      })
      .eq("id", up.id);

    if (updateErr) throw updateErr;
    }

  return updates.find(u => u.id === paymentId);
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
    payment_type_id: payment.payment_type_id || 1,
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

// ✅ UPDATED: Now accepts date range parameters
export async function fetchAllDues(fromDate = null, toDate = null) {
  let query = db
    .from("payment_Table")
    .select(`
      id,
      payment_date,
      amount_to_be_paid,
      is_paid,
      paid_amount,
      policy_Table (
        id,
        internal_id,
        policy_type,
        clients_Table (
          prefix,
          first_Name,
          middle_Name,
          family_Name,
          suffix
        )
      )
    `)
    .or("is_archive.is.null,is_archive.eq.false");

  if (fromDate && toDate) {
    query = query
      .gte("payment_date", fromDate)
      .lte("payment_date", toDate);
  }

  query = query.order("payment_date", { ascending: true });

  const { data: payments, error } = await query;
  if (error) throw error;

  const paymentIds = payments.map(p => p.id);
  const penaltiesMap = await fetchPenaltiesForPayments(paymentIds);

  return payments.map(p => {
    const penalties = penaltiesMap[p.id] || [];
    return {
      ...p,
      penalties,
      total_due: calculateTotalDue(p, penalties),
      remaining_balance: calculateRemainingBalance(p, penalties)
    };
  });
}