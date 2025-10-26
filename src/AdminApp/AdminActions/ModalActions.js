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
      policy_expiry,
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


export async function getPolicyComputationInfo(policyIDs) {
  if (!policyIDs.length) return [];
  const { data, error } = await db
    .from("policy_Computation_Table")
    .select("*")
    .in("policy_id", policyIDs);
 
  if (error) throw error;
  return data || [];
}

export async function getCalculationDataForPolicies(policyIDs) {
  if (!policyIDs.length) return [];
  
  const { data, error } = await db
    .from("vehicle_table")
    .select(`
      policy_id,
      calculation_Table(
        vat_Tax,
        docu_Stamp,
        local_Gov_Tax
      )
    `)
    .in("policy_id", policyIDs)
    .not("vehicle_type_id", "is", null);
 
  if (error) throw error;
  return data || [];
}