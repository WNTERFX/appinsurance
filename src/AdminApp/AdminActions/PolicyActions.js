import { db } from "../../dbServer";

// ✅ UPDATED: Now accepts date range parameters and partner filter
export async function fetchPolicies(fromDate = null, toDate = null, partnerId = null, employeeId = null) {
  console.log("fetchPolicies called with:", { fromDate, toDate, partnerId, employeeId });

  let query = db
    .from("policy_Table")
    .select(`
      *,
      clients_Table!inner(
        first_Name,
        middle_Name,
        family_Name,
        prefix,
        suffix,
        address,
        email,
        phone_Number,
        internal_id,
        agent_Id,
        employee_Accounts:agent_Id (
          personnel_Name,
          first_name,
          middle_name,
          last_name
        )
      ),
      insurance_Partners(
        insurance_Name
      ),
      policy_Computation_Table(
        total_Premium,
        payment_type_id
      )
    `)
    .or("is_archived.is.null,is_archived.eq.false")
    .is("archival_date", null);

  if (fromDate && toDate) {
    query = query.gte("created_at", fromDate).lte("created_at", toDate);
  }

  if (partnerId) {
    query = query.eq("partner_id", partnerId);
  }

  // ✅ Correct way to filter by employee: use the nested clients_Table.agent_Id
  if (employeeId) {
    query = query.eq("clients_Table.agent_Id", employeeId);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching policies:", error.message);
    throw error;
  }

  console.log("Query result:", { count: data?.length || 0 });
  return data || [];
}

export async function getPolicyById(policyId) {
  const { data, error } = await db
    .from("policy_Table")
    .select(
      `
        id,
        policy_type,
        policy_inception,
        policy_expiry,
        policy_is_active,
        clients_Table (
          uid,
          prefix,
          first_Name,
          middle_Name,
          family_Name,
          suffix
        )
      `
    )
    .eq("id", policyId)
    .or("is_archived.is.null,is_archived.eq.false")
    .is("archival_date", null)
    .single();
  if (error) throw error;
  return data;
}

export async function archivePolicy(policyId) {
  const { data, error } = await db
    .from("policy_Table")
    .update({
      is_archived: true,
      archival_date: new Date().toISOString().split("T")[0],
      policy_is_active: false, // ✅ Deactivate when archiving
    })
    .eq("id", policyId)
    .select()
    .single(); // ✅ Returns single object instead of array

  if (error) {
    console.error("Error archiving policy:", error.message);
    throw error;
  }
  
  return data;
}

export async function activatePolicy(policy, paymentTypeId) {
  try {
    const totalPremium = policy.policy_Computation_Table?.[0]?.total_Premium;
    const months = policy.payment_type?.months_payment || 6;
    if (!totalPremium) throw new Error("No premium available to split.");
    
    // Dates for inception/expiry
    const inceptionDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(inceptionDate.getFullYear() + 1);
    
    // 1. Update policy with active + dates
    const { data: policyData, error: policyError } = await db
      .from("policy_Table")
      .update({
        policy_is_active: true,
        policy_inception: inceptionDate.toISOString().split("T")[0],
        policy_expiry: expiryDate.toISOString().split("T")[0],
      })
      .eq("id", policy.id)
      .select();
    if (policyError) throw policyError;
    
    // 2. Create payments
    const monthlyAmount = totalPremium / months;
    const today = new Date();
    const paymentRows = Array.from({ length: months }, (_, i) => ({
      payment_date: new Date(
        today.getFullYear(),
        today.getMonth() + (i + 1),
        today.getDate()
      ),
      amount_to_be_paid: monthlyAmount,
      is_paid: false,
      created_at: new Date(),
      policy_id: policy.id,
      paid_amount: null,
      payment_type_id: paymentTypeId,
    }));
    
    const { data: payments, error: paymentError } = await db
      .from("payment_Table")
      .insert(paymentRows)
      .select();
    if (paymentError) throw paymentError;
    
    return { success: true, policy: policyData, payments };
  } catch (error) {
    console.error("Error activating policy:", error.message);
    return { success: false, error: error.message };
  }
}

export async function fetchPartners() {
  const { data, error } = await db
    .from("insurance_Partners")
    .select("id, insurance_Name")
    .order("insurance_Name", { ascending: true });
  if (error) throw error;
  return data;
}



