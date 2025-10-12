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

// Update an existing payment
export async function updatePayment(paymentId, paidAmount, amountToBePaid) {
  if (!paymentId) throw new Error("Payment ID is required");

  // Fetch the current payment
  const { data: currentPayment, error: fetchError } = await db
    .from("payment_Table")
    .select("id, policy_id, payment_date, amount_to_be_paid, paid_amount, is_paid")
    .eq("id", paymentId)
    .single();

  if (fetchError) throw fetchError;
  if (!currentPayment) throw new Error("Payment not found");

  const { policy_id } = currentPayment;

  // Fetch all payments for this policy (ordered by date)
  const { data: allPayments, error: allError } = await db
    .from("payment_Table")
    .select("id, payment_date, amount_to_be_paid, paid_amount, is_paid")
    .eq("policy_id", policy_id)
    .order("payment_date", { ascending: true });

  if (allError) throw allError;

  // Find index of current payment in the list
  const currentIndex = allPayments.findIndex(p => p.id === paymentId);
  if (currentIndex === -1) throw new Error("Payment not found in schedule");

  // Apply new payment with rollover
  let remaining = paidAmount;
  const updates = [];

  for (let i = currentIndex; i < allPayments.length && remaining > 0; i++) {
    const payment = allPayments[i];
    const due = parseFloat(payment.amount_to_be_paid);
    const alreadyPaid = parseFloat(payment.paid_amount || 0);

    const needed = Math.max(due - alreadyPaid, 0);
    const applied = Math.min(remaining, needed);
    const newPaid = alreadyPaid + applied;
    const isPaid = newPaid >= due;

    updates.push({
      id: payment.id,
      paid_amount: newPaid,
      is_paid: isPaid
    });

    remaining -= applied;
  }

  // Perform all updates in parallel
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

  // Return the updated first payment (the one that triggered the update)
  const updatedCurrent = updates.find(u => u.id === paymentId);
  return updatedCurrent;
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
  console.log("fetchAllDues called with:", { fromDate, toDate });
  
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

  // ✅ Add date filtering if dates are provided
  if (fromDate && toDate) {
    console.log("Applying date filters:", { fromDate, toDate });
    query = query
      .gte("payment_date", fromDate)
      .lte("payment_date", toDate);
  }

  query = query.order("payment_date", { ascending: true });

  const { data, error } = await query;
  
  console.log("fetchAllDues result:", { data, error, count: data?.length });
  
  if (error) {
    console.error("Error in fetchAllDues:", error);
    throw error;
  }
  return data || [];
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


