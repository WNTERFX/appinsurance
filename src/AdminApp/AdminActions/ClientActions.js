import { db } from "../../dbServer";

export async function fetchClients() {
  const { data, error } = await db
    .from("clients_Table")
    .select(`
      id,
      prefix_Name,
      first_Name,
      middle_Name,
      family_Name,
      suffix_Name,
      address,
      phone_Number,
      vehicle_Model,
      insurance_Id,

      vehicle_Type_Id,
      vehicle:calculation_Table!clients_Table_vehicle_Type_Id_fkey (
        vehicle_Type
      ),
      agent_Id,
      employee:employee_Accounts!fk_clients_agent (
        personnel_Name
      ),
      partner:insurance_Partners!clients_Table_insurance_Id_fkey(
        insurance_Name
      )
     
     
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


