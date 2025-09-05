import { db } from "../../dbServer";
export async function NewClientCreation(clientCreationData) {

  try {
    const { data, error } = await db
      .from("clients_Table") 
      .insert([clientCreationData])
      

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error inserting new client:", error.message);
    return { success: false, error: error.message };
  }

}  


export async function getCurrentUser() {

 
  const { data: { session }, error: sessionError } = await db.auth.getSession();
  if (sessionError) {
    console.error("Error getting session:", sessionError.message);
    return null;
  }
  if (!session) {
    console.log("No active session");
    return null;
  }

 
  const { data: { user }, error: userError } = await db.auth.getUser();
  if (userError) {
    console.error("Error getting user:", userError.message);
    return null;
  }

  return user; 
}

