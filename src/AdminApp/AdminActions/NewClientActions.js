import { db } from "../../dbServer";

// For single client creation
export async function NewClientCreation(clientCreationData) {
  try {
    // Get current user to set agent_Id
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user found");
    }

    // Add agent_Id to the client data
    const clientWithAgent = {
      ...clientCreationData,
      agent_Id: user.id
    };

    const { data, error } = await db
      .from("clients_Table") 
      .insert([clientWithAgent])
      .select(); // Add select to return the inserted data
      
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error inserting new client:", error.message);
    return { success: false, error: error.message };
  }
}

// NEW: For batch client creation
export async function BatchClientCreation(clientsArray) {
  try {
    // Get current user to set agent_Id
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user found");
    }

    // Add agent_Id to all clients
    const clientsWithAgent = clientsArray.map(client => ({
      ...client,
      agent_Id: user.id
    }));

    const { data, error } = await db
      .from("clients_Table") 
      .insert(clientsWithAgent)
      .select(); // Return inserted data
      
    if (error) throw error;
    return { success: true, data, count: data.length };
  } catch (error) {
    console.error("Error inserting batch clients:", error.message);
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

export async function checkIfEmailExists(email) {
  try {
    const { data, error } = await db
      .from("clients_Table")
      .select("uid", { count: "exact" })
      .eq("email", email);
    if (error) throw error;
    return (data && data.length > 0);
  } catch (error) {
    console.error("Error checking email:", error.message);
    return false;
  }
}

export async function checkIfPhoneExists(phoneNumber) {
  try {
    const { data, error } = await db
      .from("clients_Table")
      .select("uid", { count: "exact" })
      .eq("phone_Number", phoneNumber);
    if (error) throw error;
    return (data && data.length > 0);
  } catch (error) {
    console.error("Error checking phone:", error.message);
    return false;
  }
}

// NEW: Check for duplicate emails in batch
export async function checkBatchEmailDuplicates(emails) {
  try {
    const { data, error } = await db
      .from("clients_Table")
      .select("email")
      .in("email", emails);
    if (error) throw error;
    return data.map(row => row.email);
  } catch (error) {
    console.error("Error checking batch emails:", error.message);
    return [];
  }
}

// NEW: Check for duplicate phones in batch
export async function checkBatchPhoneDuplicates(phones) {
  try {
    const { data, error } = await db
      .from("clients_Table")
      .select("phone_Number")
      .in("phone_Number", phones);
    if (error) throw error;
    return data.map(row => row.phone_Number);
  } catch (error) {
    console.error("Error checking batch phones:", error.message);
    return [];
  }
}