import { db } from "../../dbServer";
import { calculateTotalDue, calculateRemainingBalance } from "./PaymentPenaltyActions";

/**
 * Fetch all paid payments (payment history)
 */
export async function fetchPaymentHistory(fromDate = null, toDate = null) {
  let query = db
    .from("payment_Table")
    .select(`
      *,
      payment_mode (
        id,
        payment_mode_name
      ),
      payment_type (
        id,
        payment_type_name
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
      ),
      paymongo_transactions (
        reference_number,
        status,
        checkout_url
      ),
      receipts:payment_receipts ( * )
    `)
    .or("is_paid.eq.true,paid_amount.gt.0")
    .or("is_archive.is.null,is_archive.eq.false");

  if (fromDate && toDate) {
    query = query.gte("payment_date", fromDate).lte("payment_date", toDate);
  }

  query = query.order("payment_date", { ascending: false });

  const { data: payments, error: paymentsError } = await query;
  if (paymentsError) throw paymentsError;
  if (!payments || payments.length === 0) return [];

  // Fetch penalties for all payments
  const paymentIds = payments.map(p => p.id);
  const { data: penalties, error: penaltiesError } = await db
    .from("payment_due_penalties")
    .select("*")
    .in("payment_id", paymentIds)
    .order("penalty_date", { ascending: true });

  if (penaltiesError) throw penaltiesError;

  // Map penalties by payment ID
  const penaltiesMap = {};
  for (const p of penalties || []) {
    if (!penaltiesMap[p.payment_id]) penaltiesMap[p.payment_id] = [];
    penaltiesMap[p.payment_id].push(p);
  }

  // Merge penalties into payments
  return payments.map(p => {
    const paymentPenalties = penaltiesMap[p.id] || [];
    return {
      ...p,
      payment_mode_name: p.payment_mode?.payment_mode_name || null,
      payment_type_name: p.payment_type?.payment_type_name || null,
      paymongo_reference: p.paymongo_transactions?.[0]?.reference_number || null,
      paymongo_status: p.paymongo_transactions?.[0]?.status || null,
      paymongo_checkout_url: p.paymongo_transactions?.[0]?.checkout_url || null,
      penalties: paymentPenalties,
      receipts: p.receipts || [],
      total_due: calculateTotalDue(p, paymentPenalties),
      remaining_balance: calculateRemainingBalance(p, paymentPenalties)
    };
  });
}

/**
 * Get payment statistics for a given period
 */
export async function getPaymentHistoryStats(fromDate = null, toDate = null) {
  let query = db
    .from("payment_Table")
    .select("paid_amount, amount_to_be_paid, payment_date, payment_type_id")
    .or("is_paid.eq.true,paid_amount.gt.0")
    .or("is_archive.is.null,is_archive.eq.false");

  if (fromDate && toDate) {
    query = query.gte("payment_date", fromDate).lte("payment_date", toDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  const totalPaid = data.reduce((sum, p) => sum + (parseFloat(p.paid_amount) || 0), 0);
  const totalExpected = data.reduce((sum, p) => sum + (parseFloat(p.amount_to_be_paid) || 0), 0);
  const paymentCount = data.length;

  return {
    totalPaid,
    totalExpected,
    paymentCount,
    averagePayment: paymentCount > 0 ? totalPaid / paymentCount : 0
  };
}