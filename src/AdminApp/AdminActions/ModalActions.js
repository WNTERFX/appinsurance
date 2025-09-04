
import { db } from "../../dbServer";

export async function getClientInfo(clientID){
   const {data, error} = await db
    .from("clients_Table")
    .select(`
      id,
      uid,
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
    `)
    .eq("uid", clientID)  // Filter by uid (primary key)
    .single()             // Get single record
       
    if(error){
        console.error("There is an error getting clients info", error);
        return null;
    }
    return data;
}

export async function getComputationInfo(clientID) {
    const{data, error} = await db
    .from("client_policy_Table")
    .select(`
        vehicle_Year,
        original_Value,
        current_Value,
        total_Premium,
        aon_Cost,
        vehicle_Rate_Value
    `)
    .eq("client_Id", clientID); // Filter by client_Id (foreign key to clients_Table.uid)
   
    if(error){
        console.error("There is an error getting computation info", error);
        return [];
    }
    return data;      
}