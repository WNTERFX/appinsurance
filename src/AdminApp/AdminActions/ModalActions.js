import { db } from "../../dbServer";

export async function getClientInfo(clientID) {
  const { data, error } = await db
    .from("clients_Table")
    .select("*, employee:employee_Accounts(personnel_Name)")
    .eq("uid", clientID)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getPolicyInfo(clientID) {
  const { data, error } = await db
    .from("policy_Table")
    .select(`
      id,
      policy_type,
      policy_inception,
      policy_expirty,
      policy_is_active,
      insurance_Partners(insurance_Name, insurance_Rate)
    `)
    .eq("client_id", clientID);
  
  if (error) throw error;
  return data || [];
}

export async function getVehicleInfo(policyIDs) {
  if (!policyIDs.length) return [];
  
  const { data, error } = await db
    .from("vehicle_table")
    .select("*")
    .in("policy_id", policyIDs);
  
  if (error) throw error;
  return data || [];
}

// ✅ Updated: fetch by policy_id instead of client_Id
export async function getPolicyComputationInfo(policyIDs) {
  if (!policyIDs.length) return [];

  const { data, error } = await db
    .from("policy_Computation_Table")
    .select("*")
    .in("policy_id", policyIDs);
  
  if (error) throw error;
  return data || [];
}
