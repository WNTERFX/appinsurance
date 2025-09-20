import { db } from "../../dbServer";

export async function fetchPolicies() {
  const { data, error } = await db
    .from("policy_Table")
    .select(`
      *,
      clients_Table(
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
      )
    `)
    .eq("is_archived", true)      
    .not("archival_date", "is", null) 
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPolicyById(policyId) {
  const { data, error } = await db
    .from("policy_Table")
    .select(`
      *,
      clients_Table(
        uid,
        first_Name,
        middle_Name,
        family_Name,
        prefix,
        suffix,
        address,
        email,
        phone_Number,
        employee:employee_Accounts(personnel_Name)
      ),
      insurance_Partners(
        insurance_Name,
        insurance_Rate,
        address,
        contact
      )
    `)
    .eq('id', policyId)
    .eq("is_archived", true)          // must be true
    .not("archival_date", "is", null) // must not be null
    .single();

  if (error) throw error;
  return data;
}

export async function unArchivePolicy(policyId) {
  const { data, error } = await db
    .from("policy_Table")
    .update({
      is_archived: false,
      archival_date: null
    })
    .eq("id", policyId)
    .select(); 

  if (error) throw error;
  return data?.[0] || null;
}

// only archived 
export async function deletePolicy(policyId) {
  const { error } = await db
    .from("policy_Table")
    .delete()
    .eq("id", policyId);

  if (error) throw error;
  return true;
}