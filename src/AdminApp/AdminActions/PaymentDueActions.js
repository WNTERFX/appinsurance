import { db } from "../../dbServer";
import { fetchPenaltiesForPayments, calculateTotalDue, calculateRemainingBalance } from "./PaymentPenaltyActions";

// ✅ UPDATED: Fetch payment_type_id and payment_type_name to identify payment types
export async function fetchPaymentSchedule(policyId) {
  if (!policyId) throw new Error("Policy ID is required");

  const { data: payments, error: paymentsError } = await db
    .from("payment_Table")
    .select(`
      id,
      payment_date,
      amount_to_be_paid,
      is_paid,
      paid_amount,
      payment_type_id,
      payment_mode_id,
      payment_manual_reference,
      payment_status,
      is_refunded,
      refund_amount,
      refund_date,
      refund_reason,
      payment_type ( payment_type_name ),
      payment_mode ( payment_mode_name ),
      paymongo_transactions (
        reference_number,
        status,
        checkout_url
      ),
      receipts:payment_receipts ( * )
    `)
    .eq("policy_id", policyId)
    .or("is_archive.is.null,is_archive.eq.false")
    .order("payment_date", { ascending: true });

  if (paymentsError) throw paymentsError;
  if (!payments || payments.length === 0) return [];

  // Fetch penalties
  const paymentIds = payments.map(p => p.id);
  const { data: penalties, error: penaltiesError } = await db
    .from("payment_due_penalties")
    .select("*")
    .in("payment_id", paymentIds)
    .order("penalty_date", { ascending: true });

  if (penaltiesError) throw penaltiesError;

  const penaltiesMap = {};
  for (const p of penalties) {
    if (!penaltiesMap[p.payment_id]) penaltiesMap[p.payment_id] = [];
    penaltiesMap[p.payment_id].push(p);
  }

  return payments.map(p => {
    const paymentPenalties = penaltiesMap[p.id] || [];
    return {
      ...p,
      payment_type_name: p.payment_type?.payment_type_name || null,
      payment_mode_name: p.payment_mode?.payment_mode_name || null,
      paymongo_reference: p.paymongo_transactions?.[0]?.reference_number || null,
      paymongo_status: p.paymongo_transactions?.[0]?.status || null,
      paymongo_checkout_url: p.paymongo_transactions?.[0]?.checkout_url || null,
      penalties: paymentPenalties,
      receipts: p.receipts || [],
      total_due: calculateTotalDue(p, paymentPenalties),
      remaining_balance: calculateRemainingBalance(p, paymentPenalties),
    };
  });
}

// Update an existing payment
export async function updatePayment(paymentId, paidAmount, paymentModeId = null, manualReference = null) {
  if (!paymentId) throw new Error("Payment ID is required");
  if (!paidAmount || paidAmount <= 0) throw new Error("Paid amount must be positive");
  
  const { data: currentPayment, error: fetchError } = await db
    .from("payment_Table")
    .select("id, policy_id, payment_date, amount_to_be_paid, paid_amount, is_paid, payment_type_id")
    .eq("id", paymentId)
    .single();
  
  if (fetchError) throw fetchError;
  if (!currentPayment) throw new Error("Payment not found");
  
  const { policy_id } = currentPayment;
  
  const { data: allPayments, error: allError } = await db
    .from("payment_Table")
    .select("id, payment_date, amount_to_be_paid, paid_amount, is_paid, payment_type_id")
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
      const penaltyRemaining = penalty.penalty_amount;
      const toPay = Math.min(remaining, penaltyRemaining);
      remaining -= toPay;
      
      await db
        .from("payment_due_penalties")
        .update({ is_paid: toPay >= penaltyRemaining })
        .eq("id", penalty.id);
      
      if (remaining <= 0) break;
    }
    
    if (remaining <= 0) break;
    
    // Apply to payment base amount
    const due = parseFloat(payment.amount_to_be_paid);
    const alreadyPaid = parseFloat(payment.paid_amount || 0);
    const needed = Math.max(due - alreadyPaid, 0);
    
    if (needed <= 0) continue;
    
    const applied = Math.min(remaining, needed);
    const newPaid = alreadyPaid + applied;
    const isPaid = newPaid >= due;
    
    // Build update object
    const updateData = {
      paid_amount: newPaid,
      is_paid: isPaid
    };
    
    // Add payment_mode_id only for the first payment (the one being processed)
    // and only if paymentModeId is provided
    if (i === currentIndex && paymentModeId !== null) {
      updateData.payment_mode_id = paymentModeId;
    }
    
    // Add manual reference if provided (ONLY for the first payment)
    if (i === currentIndex && manualReference !== null) {
      updateData.payment_manual_reference = manualReference;
    }
    
    updates.push({
      id: payment.id,
      updateData,
      spillover: remaining > needed
    });
    
    console.log(
      remaining > needed
        ? `💧 Spillover: Applied ₱${applied.toFixed(2)} to ${payment.payment_date}, ₱${(remaining - applied).toFixed(2)} remaining`
        : `✅ Payment applied to ${payment.payment_date}: ₱${applied.toFixed(2)}`
    );
    
    remaining -= applied;
  }
  
  // Apply all updates
  for (const up of updates) {
    const { error: updateErr } = await db
      .from("payment_Table")
      .update(up.updateData)
      .eq("id", up.id);
    
    if (updateErr) throw updateErr;
  }
  
  return updates.find(u => u.id === paymentId);
}

// ✅ UPDATED: Fetch archived payments with payment_type_id
export async function fetchArchivedPayments() {
  const { data: payments, error: paymentsError } = await db
    .from("payment_Table")
    .select(`
      *,
      payment_mode (
        id,
        payment_mode_name
      ),
      policy_Table!inner (
        id,
        internal_id,
        policy_type,
        policy_is_active,
        client_id,
        partner_id,
        insurance_Partners (
          id,
          insurance_Name
        ),
        clients_Table (
          prefix,
          first_Name,
          middle_Name,
          family_Name,
          suffix,
          internal_id,
          agent_Id,
          employee_Accounts!fk_clients_agent (
            id,
            first_name,
            last_name
          )
        )
      )
    `)
    .eq("is_archive", true)
    .order("payment_date", { ascending: false });

  if (paymentsError) throw paymentsError;
  if (!payments || payments.length === 0) return [];

  // 2️⃣ Fetch all penalties for archived payments in one query
  const paymentIds = payments.map(p => p.id);
  const { data: penalties, error: penaltiesError } = await db
    .from("payment_due_penalties")
    .select("*")
    .in("payment_id", paymentIds)
    .order("penalty_date", { ascending: true });

  if (penaltiesError) throw penaltiesError;

  // 3️⃣ Map penalties by payment ID
  const penaltiesMap = {};
  for (const p of penalties) {
    if (!penaltiesMap[p.payment_id]) penaltiesMap[p.payment_id] = [];
    penaltiesMap[p.payment_id].push(p);
  }

  // 4️⃣ Merge penalties into payments
  return payments.map(p => {
    const paymentPenalties = penaltiesMap[p.id] || [];
    return {
      ...p,
      payment_mode_name: p.payment_mode?.payment_mode_name || null,
      penalties: paymentPenalties,
      total_due: calculateTotalDue(p, paymentPenalties),
      remaining_balance: calculateRemainingBalance(p, paymentPenalties)
    };
  });
}

// Archive a payment
export async function archivePayment(paymentId) {
  if (!paymentId) throw new Error("Payment ID is required");
 
  const { data, error } = await db
    .from("payment_Table")
    .update({ is_archive: true })
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
    .update({ is_archive: false })
    .eq("id", paymentId)
    .select();
 
  if (error) throw error;
  return data[0];
}

// Delete a payment permanently
export async function deletePayment(paymentId) {
  if (!paymentId) throw new Error("Payment ID is required");
  
  // Get payment details
  const { data: payment, error: fetchError } = await db
    .from("payment_Table")
    .select("paid_amount, is_paid")
    .eq("id", paymentId)
    .single();
  
  if (fetchError) throw fetchError;
  
  // Prevent deletion if payment has been paid
  if (payment.is_paid || (payment.paid_amount && payment.paid_amount > 0)) {
    throw new Error("Cannot delete a payment that has already been paid. Please use refund instead.");
  }
  
  // Check if payment has any penalties
  const { data: penalties, error: penaltyCheckError } = await db
    .from("payment_due_penalties")
    .select("id, is_paid")
    .eq("payment_id", paymentId);
  
  if (penaltyCheckError) throw penaltyCheckError;
  
  if (penalties && penalties.length > 0) {
    throw new Error("Cannot delete payment with associated penalties. Please remove penalties first or update the payment amount instead.");
  }
  
  // Delete the payment
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

// ✅ UPDATED: Fetch all dues with payment_type_id and payment_type_name
export async function fetchAllDues(fromDate = null, toDate = null) {
  let query = db
    .from("payment_Table")
    .select(`
      id,
      payment_date,
      amount_to_be_paid,
      is_paid,
      paid_amount,
      payment_type_id,
      payment_type ( payment_type_name ),
      paymongo_transactions (
        reference_number,
        status,
        checkout_url
      ),
      policy_Table!inner (
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
    .eq("is_archive", false);

  if (fromDate && toDate) {
    query = query.gte("payment_date", fromDate).lte("payment_date", toDate);
  }

  query = query.order("payment_date", { ascending: true });

  const { data: payments, error: paymentsError } = await query;
  if (paymentsError) throw paymentsError;
  if (!payments || payments.length === 0) return [];

  const paymentIds = payments.map(p => p.id);
  const { data: penalties, error: penaltiesError } = await db
    .from("payment_due_penalties")
    .select("*")
    .in("payment_id", paymentIds)
    .order("penalty_date", { ascending: true });

  if (penaltiesError) throw penaltiesError;

  const penaltiesMap = {};
  for (const p of penalties) {
    if (!penaltiesMap[p.payment_id]) penaltiesMap[p.payment_id] = [];
    penaltiesMap[p.payment_id].push(p);
  }

  return payments.map(p => {
    const paymentPenalties = penaltiesMap[p.id] || [];
    return {
      ...p,
      payment_type_name: p.payment_type?.payment_type_name || null,
      paymongo_reference: p.paymongo_transactions?.[0]?.reference_number || null,
      paymongo_status: p.paymongo_transactions?.[0]?.status || null,
      paymongo_checkout_url: p.paymongo_transactions?.[0]?.checkout_url || null,
      penalties: paymentPenalties,
      total_due: calculateTotalDue(p, paymentPenalties),
      remaining_balance: calculateRemainingBalance(p, paymentPenalties)
    };
  });
}

export async function fetchPaymentsWithPenalties(policyId = null) {
  try {
    let query = db
      .from("payment_Table")
      .select(`
        id,
        payment_date,
        amount_to_be_paid,
        is_paid,
        paid_amount,
        policy_id,
        payment_type_id,
        policy_Table (
          internal_id,
          clients_Table (
            internal_id,
            prefix,
            first_Name,
            middle_Name,
            family_Name,
            suffix
          )
        ),
        payment_due_penalties (
          penalty_amount,
          penalty_date,
          penalty_reason
        )
      `)
      .order("payment_date", { ascending: true });

    if (policyId) query = query.eq("policy_id", policyId);

    const { data, error } = await query;
    if (error) throw error;

    const processed = data.map((p) => {
      const totalPenalty =
        p.payment_due_penalties?.reduce(
          (sum, pen) => sum + (pen.penalty_amount || 0),
          0
        ) || 0;

      return {
        ...p,
        totalPenalty,
        totalDue: (p.amount_to_be_paid || 0) + totalPenalty,
      };
    });

    return processed;
  } catch (err) {
    console.error("Error fetching payments with penalties:", err);
    return [];
  }
}


export async function fetchAllPaymentModes() {
  const { data, error } = await db
    .from("payment_mode")
    .select("*")
    .order("payment_mode_name");
  
  if (error) throw error;
  return data || [];
}

export async function editPaymentDetails(paymentId, paymentModeId = null, manualReference = null) {
  if (!paymentId) throw new Error("Payment ID is required");
  
  const updateData = {};
  
  if (paymentModeId !== null) {
    updateData.payment_mode_id = paymentModeId;
  }
  
  if (manualReference !== null) {
    updateData.payment_manual_reference = manualReference;
  }
  
  if (Object.keys(updateData).length === 0) {
    throw new Error("No fields to update");
  }
  
  const { data, error } = await db
    .from("payment_Table")
    .update(updateData)
    .eq("id", paymentId)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function updatePaymentAmount(paymentId, newAmount) {
  if (!paymentId) throw new Error("Payment ID is required");
  if (!newAmount || newAmount <= 0) throw new Error("Amount must be positive");
  
  // Check if payment has any penalties
  const { data: penalties, error: penaltyCheckError } = await db
    .from("payment_due_penalties")
    .select("id, penalty_amount, is_paid, not_paid_days")
    .eq("payment_id", paymentId);
  
  if (penaltyCheckError) throw penaltyCheckError;
  
  // Get current payment details
  const { data: payment, error: fetchError } = await db
    .from("payment_Table")
    .select("amount_to_be_paid, payment_date, paid_amount")
    .eq("id", paymentId)
    .single();
  
  if (fetchError) throw fetchError;
  
  // Update the payment amount
  const { data, error } = await db
    .from("payment_Table")
    .update({ amount_to_be_paid: newAmount })
    .eq("id", paymentId)
    .select();
  
  if (error) throw error;
  
  // Recalculate penalties if they exist
  if (penalties && penalties.length > 0) {
    const PENALTY_RATE = 0.01; // 1% per day
    
    for (const penalty of penalties) {
      if (!penalty.is_paid) {
        const daysOverdue = penalty.not_paid_days || 0;
        const newPenaltyAmount = newAmount * PENALTY_RATE * daysOverdue;
        
        await db
          .from("payment_due_penalties")
          .update({ penalty_amount: newPenaltyAmount })
          .eq("id", penalty.id);
      }
    }
  }
  
  return data[0];
}