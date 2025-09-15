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
    .or("is_archived.is.null,is_archived.eq.false")
    .is("archival_date", null) 
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
    .or("(is_archived.is.null,is_archived.eq.false)and(archival_date.is.null)") 
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
    })
    .eq("id", policyId)
    .select(); 

  if (error) throw error;
  return data?.[0] || null;
}

export async function activatePolicy(policyId) {
  const {data, error} = await db
  .from("policy_Table")
  .update({
    
  })
}