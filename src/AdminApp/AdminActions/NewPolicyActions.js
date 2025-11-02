import { db } from "../../dbServer";

// ================================
// 1. Insert a new policy
// ================================
export async function NewPolicyCreation(policyData) {
  try {
    const { data, error } = await db
      .from("policy_Table")
      .insert([policyData])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error inserting policy data:", error.message);
    return { success: false, error: error.message };
  }
}

// ================================
// 2. Insert a new computation linked to a policy
// ================================
export async function NewComputationCreation(computationData) {
  try {
    // Make sure computationData contains a valid policy_id
    const { data, error } = await db
      .from("policy_Computation_Table")
      .insert([computationData])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error inserting computation data:", error.message);
    return { success: false, error: error.message };
  }
}

// ================================
// 3. Insert a new vehicle
// ================================
export async function NewVehicleCreation(vehicleData) {
  try {
    const { data, error } = await db
      .from("vehicle_table")
      .insert([vehicleData])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error inserting vehicle data:", error.message);
    return { success: false, error: error.message };
  }
}

// ================================
// 4. Fetch clients
// ================================
export async function fetchClients() {
  const { data, error } = await db
    .from("clients_Table")
    .select("uid, internal_id,  prefix, first_Name, middle_Name, family_Name, suffix")
    .order("client_Registered", { ascending: false }); // ⬅ newest first


  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
  console.log("DEBUG - Fetched clients data:", data);
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
