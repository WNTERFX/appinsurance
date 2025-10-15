import { db } from "../../dbServer";


// Fetch all penalties for a specific payment
export async function fetchPaymentPenalties(paymentId) {
  if (!paymentId) throw new Error("Payment ID is required");
  
  const { data, error } = await db
    .from("payment_due_penalties")
    .select("*")
    .eq("payment_id", paymentId)
    .order("penalty_date", { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Fetch penalties for multiple payments (returns a map)
export async function fetchPenaltiesForPayments(paymentIds) {
  if (!paymentIds || paymentIds.length === 0) return {};
  
  const { data, error } = await db
    .from("payment_due_penalties")
    .select("*")
    .in("payment_id", paymentIds)
    .order("penalty_date", { ascending: true });
  
  if (error) throw error;
  
  // Group penalties by payment_id
  const penaltiesMap = {};
  (data || []).forEach(penalty => {
    if (!penaltiesMap[penalty.payment_id]) {
      penaltiesMap[penalty.payment_id] = [];
    }
    penaltiesMap[penalty.payment_id].push(penalty);
  });
  
  return penaltiesMap;
}

// Add a penalty to a payment
export async function addPaymentPenalty(paymentId, penaltyAmount, penaltyReason, notPaidDays) {
  if (!paymentId) throw new Error("Payment ID is required");
  if (!penaltyAmount || penaltyAmount <= 0) throw new Error("Valid penalty amount is required");
  if (!penaltyReason) throw new Error("Penalty reason is required");
  
  // Verify payment exists
  const { data: payment, error: paymentError } = await db
    .from("payment_Table")
    .select("id, payment_date")
    .eq("id", paymentId)
    .single();
  
  if (paymentError) throw paymentError;
  if (!payment) throw new Error("Payment not found");
  
  // ✅ NEW: Delete all existing penalties for this payment before adding new one
  await db
    .from("payment_due_penalties")
    .delete()
    .eq("payment_id", paymentId);
  
  const penaltyRecord = {
    payment_id: paymentId,
    penalty_date: new Date().toISOString().split('T')[0],
    penalty_amount: penaltyAmount,
    penalty_reason: penaltyReason,
    not_paid_days: notPaidDays
  };
  
  const { data, error } = await db
    .from("payment_due_penalties")
    .insert(penaltyRecord)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Calculate daily penalty (1% per day)
export async function calculateDailyPenalty(payment) {
  const today = new Date();
  const paymentDate = new Date(payment.payment_date);
  const daysOverdue = Math.floor((today - paymentDate) / (1000 * 60 * 60 * 24));

  // No penalty if not overdue
  if (daysOverdue <= 0) return { daysOverdue: 0, penaltyAmount: 0, penaltyPercentage: 0 };

  // ✅ Cap the penalty percentage at 31%
  const penaltyPercentage = Math.min(daysOverdue, 31);
  const penaltyAmount = payment.amount_to_be_paid * (penaltyPercentage / 100);

  return {
    daysOverdue,
    penaltyAmount: Number(penaltyAmount.toFixed(2)),
    penaltyPercentage
  };
}

// Calculate automatic penalty for a payment (1% per day)
export async function calculateAutomaticPenalty(paymentId) {
  const { data: payment, error } = await db
    .from("payment_Table")
    .select("id, payment_date, amount_to_be_paid, paid_amount, is_paid, policy_id")
    .eq("id", paymentId)
    .single();
  
  if (error) throw error;
  if (!payment) throw new Error("Payment not found");
  
  // Don't add penalty if already paid
  if (payment.is_paid) {
    return { shouldAddPenalty: false, shouldVoidPolicy: false, reason: "Payment already marked as paid" };
  }
  
  const paymentDate = new Date(payment.payment_date);
  const today = new Date();
  const daysOverdue = Math.floor((today - paymentDate) / (1000 * 60 * 60 * 24));
  
  // No penalty if not overdue yet
  if (daysOverdue <= 0) {
    return { shouldAddPenalty: false, shouldVoidPolicy: false, reason: "Payment not yet due" };
  }
  
  // Check if policy should be voided (90+ days overdue)
  const shouldVoidPolicy = daysOverdue >= 90;
  
  // Check if penalty already exists for today
  const { data: existingPenalty } = await db
    .from("payment_due_penalties")
    .select("id")
    .eq("payment_id", paymentId)
    .eq("penalty_date", today.toISOString().split('T')[0])
    .maybeSingle();
  
  if (existingPenalty) {
    return { 
      shouldAddPenalty: false, 
      shouldVoidPolicy, 
      reason: "Penalty already added today",
      daysOverdue,
      policyId: payment.policy_id
    };
  }
  
  const penaltyAmount = calculateDailyPenalty(payment.amount_to_be_paid, daysOverdue);
  
  return {
    shouldAddPenalty: true,
    shouldVoidPolicy,
    penaltyAmount,
    daysOverdue,
    policyId: payment.policy_id,
    reason: `${daysOverdue} day(s) overdue - ${daysOverdue}% penalty (1% per day)`
  };
}

// Void/archive a policy due to non-payment
export async function voidPolicy(policyId) {
  if (!policyId) throw new Error("Policy ID is required");
  
  const { data, error } = await db
    .from("policy_Table")
    .update({ 
      is_archived: true,
      archival_date: new Date().toISOString().split('T')[0],
      policy_is_active: false
    })
    .eq("id", policyId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Apply automatic penalties to all overdue payments (runs daily)
export async function applyAutomaticPenalties() {
  // Fetch all unpaid payments
  const { data: overduePayments, error } = await db
    .from("payment_Table")
    .select(`
      id, 
      payment_date, 
      amount_to_be_paid, 
      policy_id,
      policy_Table!inner (
        id,
        is_archived,
        policy_is_active
      )
    `)
    .eq("is_paid", false)
    .eq("policy_Table.is_archived", false)
    .lt("payment_date", new Date().toISOString().split('T')[0]);
  
  if (error) throw error;
  
  const results = [];
  const policiesToVoid = new Set();
  
  for (const payment of overduePayments || []) {
    const calc = await calculateAutomaticPenalty(payment.id);
    
    // Track policies that need to be voided
    if (calc.shouldVoidPolicy) {
      policiesToVoid.add(calc.policyId);
    }
    
    if (calc.shouldAddPenalty) {
      try {
        const penalty = await addPaymentPenalty(
          payment.id,
          calc.penaltyAmount,
          calc.reason,
          calc.daysOverdue
        );
        results.push({ 
          success: true, 
          payment_id: payment.id, 
          penalty,
          shouldVoidPolicy: calc.shouldVoidPolicy,
          daysOverdue: calc.daysOverdue
        });
      } catch (err) {
        results.push({ 
          success: false, 
          payment_id: payment.id, 
          error: err.message 
        });
      }
    } else if (calc.shouldVoidPolicy) {
      results.push({
        success: true,
        payment_id: payment.id,
        shouldVoidPolicy: true,
        daysOverdue: calc.daysOverdue,
        message: calc.reason
      });
    }
  }
  
  // Void all policies that are 90+ days overdue
  const voidedPolicies = [];
  for (const policyId of policiesToVoid) {
    try {
      const voided = await voidPolicy(policyId);
      voidedPolicies.push({ success: true, policy_id: policyId, policy: voided });
    } catch (err) {
      voidedPolicies.push({ success: false, policy_id: policyId, error: err.message });
    }
  }
  
  return {
    penaltyResults: results,
    voidedPolicies,
    summary: {
      totalProcessed: results.length,
      penaltiesAdded: results.filter(r => r.success && r.penalty).length,
      policiesVoided: voidedPolicies.filter(p => p.success).length
    }
  };
}

// Manual penalty calculation for a specific payment (for display purposes)
export async function getPaymentPenaltyInfo(paymentId) {
  const { data: payment, error } = await db
    .from("payment_Table")
    .select(`
      id, 
      payment_date, 
      amount_to_be_paid, 
      paid_amount, 
      is_paid,
      payment_due_penalties (
        id,
        penalty_amount,
        penalty_date,
        not_paid_days
      )
    `)
    .eq("id", paymentId)
    .single();
  
  if (error) throw error;
  if (!payment) throw new Error("Payment not found");
  
  const paymentDate = new Date(payment.payment_date);
  const today = new Date();
  const daysOverdue = Math.floor((today - paymentDate) / (1000 * 60 * 60 * 24));
  
  const penalties = payment.payment_due_penalties || [];
  const totalPenalties = penalties.reduce((sum, p) => sum + p.penalty_amount, 0);
  
  // Calculate what the penalty SHOULD be based on days overdue
  const expectedPenalty = daysOverdue > 0 ? calculateDailyPenalty(payment.amount_to_be_paid, daysOverdue) : 0;
  
  return {
    payment_id: payment.id,
    payment_date: payment.payment_date,
    amount_to_be_paid: payment.amount_to_be_paid,
    paid_amount: payment.paid_amount || 0,
    is_paid: payment.is_paid,
    days_overdue: Math.max(daysOverdue, 0),
    penalty_rate: daysOverdue > 0 ? Math.min(daysOverdue, 90) : 0, // percentage
    expected_penalty: expectedPenalty,
    actual_penalties: totalPenalties,
    penalty_difference: expectedPenalty - totalPenalties,
    total_due: payment.amount_to_be_paid + totalPenalties,
    remaining_balance: payment.amount_to_be_paid + totalPenalties - (payment.paid_amount || 0),
    should_void_policy: daysOverdue >= 90,
    penalties
  };
}

// Delete a penalty
export async function deletePaymentPenalty(penaltyId) {
  if (!penaltyId) throw new Error("Penalty ID is required");
  
  const { error } = await db
    .from("payment_due_penalties")
    .delete()
    .eq("id", penaltyId);
  
  if (error) throw error;
  return true;
}

// Calculate total amount due including penalties
export function calculateTotalDue(payment, penalties = []) {
  const baseDue = parseFloat(payment.amount_to_be_paid || 0);
  const totalPenalties = penalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
  return baseDue + totalPenalties;
}

// Calculate remaining balance after payment
export function calculateRemainingBalance(payment, penalties = []) {
  const totalDue = calculateTotalDue(payment, penalties);
  const paidAmount = parseFloat(payment.paid_amount || 0);
  return Math.max(totalDue - paidAmount, 0);
}

export function hasPenaltyForToday(payment) {
  const today = new Date().toISOString().split('T')[0];
  const penalties = payment.penalties || payment.payment_due_penalties || [];
  return penalties.some(penalty => {
    const penaltyDate = penalty.penalty_date.split('T')[0]; // Handle both date formats
    return penaltyDate === today;
  });
}