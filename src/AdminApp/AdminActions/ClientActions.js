import { db } from "../../dbServer";

export async function fetchClients() {
  const { data, error } = await db
    .from("clients_Table")
    .select(`
      *,
      employee:employee_Accounts(personnel_Name)
    `);
  
  if (error) {
    console.error("Error fetching clients:", error.message);
    return [];
  }
  
  console.log("CLIENTS DATA:", data);
  return data;
}

export async function fetchEmployees() {
  const { data, error } = await db
    .from("employee_Accounts")
    .select("id, personnel_Name");
  
  if (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
 
  return data;
}