import { db } from "../../dbServer";


export const fetchAllAgents = async () => {
  try {
    const { data, error } = await db
      .from("employee_Accounts")
      .select("*")
      .eq("status_Account", true) // Only active accounts
      .order("first_name", { ascending: true });

    if (error) {
      console.error("Error fetching agents:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Error in fetchAllAgents:", err);
    throw err;
  }
};

export const fetchAllPartners = async () => {
  try {
    const { data, error } = await db
      .from("insurance_Partners")
      .select("*")
      .order("insurance_Name", { ascending: true });

    if (error) {
      console.error("Error fetching partners:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Error in fetchAllPartners:", err);
    throw err;
  }
};