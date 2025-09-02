import { db } from "../../dbServer";

export async function NewClientCreation(clientData) {

  try {
    const { data, error } = await db
      .from("clients_Table") 
      .insert([clientData])
      .select("uid");

    if (error) throw error;
    return { success: true, uid: data[0].uid, data };
  } catch (error) {
    console.error("Error inserting new client:", error.message);
    return { success: false, error: error.message };
  }

}

export async function NewComputationCreation(clientComputationData) {

  try {
    const { data, error } = await db
      .from("client_policy_Table") 
      .insert([clientComputationData])
      

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error inserting new client:", error.message);
    return { success: false, error: error.message };
  }
  
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
