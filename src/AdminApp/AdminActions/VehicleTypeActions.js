
import { db } from "../../dbServer";

export async function getComputationValue() {
  const { data, error } = await db
    .from("calculation_Table")
    .select("id, vehicle_Type")
    .order("vehicle_Type", { ascending: true }); 

  if (error) {
    console.error("Error fetching vehicle types:", error.message);
    return [];
  }

  console.log("Fetched vehicle types:", data);
  return data || [];
}


export async function fetchVehicleDetails(type) {
  const { data, error } = await db
    .from("calculation_Table")
    .select("*")
    .eq("vehicle_Type", type)
    .maybeSingle(); 

  if (error) {
    console.error("Error fetching vehicle details:", error.message);
    return null;
  }

  console.log("Fetched vehicle details:", data);
  return data;
}