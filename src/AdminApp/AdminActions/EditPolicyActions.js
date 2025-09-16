import { db } from "../../dbServer";

// ================================
// 1. Update an existing policy
// ================================
export async function updatePolicy(policyId, updateData) {
  try {
    const { data, error } = await db
      .from("policy_Table")
      .update(updateData)
      .eq("id", policyId) // <-- use "id", not "policy_id"
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error updating policy data:", error.message);
    return { success: false, error: error.message };
  }
}

// ================================
// 2. Update an existing computation linked to a policy
// ================================
export async function updateComputation(policyId, updateData) {
  try {
    const { data, error } = await db
      .from("policy_Computation_Table")
      .update(updateData)
      .eq("policy_id", policyId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error updating computation data:", error.message);
    return { success: false, error: error.message };
  }
}

// ================================
// 3. Update an existing vehicle
// ================================
export async function updateVehicle(vehicleId, updateData) {
  try {
    const { data, error } = await db
      .from("vehicle_table")
      .update(updateData)
      .eq("id", vehicleId)   // <-- use vehicle id, not policy id
      .select();

    if (error) throw error;
    console.log("Vehicle updated:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error updating vehicle data:", error.message);
    return { success: false, error: error.message };
  }
}

// ================================
// 4. Fetch clients
// ================================
export async function fetchClients() {
  const { data, error } = await db
    .from("clients_Table")
    .select("uid, prefix, first_Name, middle_Name, family_Name, suffix");

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
  return data;
}

// ================================
// 5. Fetch insurance partners
// ================================
export async function fetchPartners() {
  const { data, error } = await db
    .from("insurance_Partners")
    .select("id, insurance_Name");

  if (error) {
    console.error("Error fetching partners:", error);
    return [];
  }
  return data;
}

// ================================
// 6. Fetch policy by ID
// ================================
export async function fetchPolicyById(policyId) {
  const { data, error } = await db
    .from("policy_Table")
    .select("*")
    .eq("id", policyId)
    .single();

  if (error) {
    console.error("Error fetching policy:", error);
    return null;
  }
  return data;
}

// ================================
// 7. Fetch vehicle by policy ID
// ================================
export async function fetchVehicleByPolicyId(policyId) {
  const { data, error } = await db
    .from("vehicle_table")
    .select("*")
    .eq("policy_id", policyId)
    .single();

  if (error) {
    console.error("Error fetching vehicle:", error);
    return null;
  }
  return data;
}

// ================================
// 8. Fetch computation by policy ID
// ================================
export async function fetchComputationByPolicyId(policyId) {
  const { data, error } = await db
    .from("policy_Computation_Table")
    .select("*")
    .eq("policy_id", policyId)
    .single();

  if (error) {
    console.error("Error fetching computation:", error);
    return null;
  }
  return data;
}

export async function fetchCalculationByVehicleType(vehicleType) {
  try {
    const { data, error } = await db
      .from("calculation_Table")
      .select("*")
      .eq("vehicle_type", vehicleType)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error("Error fetching calculation:", err.message);
    return null;
  }
}