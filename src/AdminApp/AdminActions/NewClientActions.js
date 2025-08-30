import { db } from "../../dbServer";

export async function NewClientCreation(clientData) {

  try {
    const { data, error } = await db
      .from("clients_Table") 
      .insert([clientData]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error inserting new client:", error.message);
    return { success: false, error: error.message };
  }
}