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
    .single();

  if (error) throw error;
  return data;
}