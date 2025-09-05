import { db } from "../../dbServer";


export async function NewComputationCreation(clientComputationData) {
  try {
    const { data, error } = await db
      .from("policy_Computation_Table")
      .insert([clientComputationData])
      .select(); 
     
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error inserting new client:", error.message);
    return { success: false, error: error.message };
  }
}

export async function NewPolicyCreation(policyData){
  try {
      const {data, error} = await db
      .from("policy_Table")
      .insert([policyData])
      .select();
      
    if (error) throw error;
    return {success: true, data};
  } catch (error) {
    console.error("Error inserting policy data", error.message);
    return {success: false, error: error.message};
  }
}

export async function NewVehicleCreation(vehicleData){
  try {
      const {data, error} = await db
      .from("vehicle_table")
      .insert([vehicleData])
      .select();
      
    if (error) throw error;
    return {success: true, data};
  } catch (error) {
    console.error("Error inserting vehicle data", error.message);
    return {success: false, error: error.message};
  }
}

export async function fetchClients(){
  const { data, error } = await db
    .from("clients_Table")
    .select("uid, prefix, first_Name, middle_Name, family_Name, suffix");
  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
  console.log("DEBUG - Fetched clients data:", data);
  return data;
}

export async function fetchPartners() {
           
    const{data, error} = await db 
    .from("insurance_Partners")
    .select("id, insurance_Name")

    if (error) {
        console.error("Error fetching partners:", error);
        return[];

    }
    return data;
}
