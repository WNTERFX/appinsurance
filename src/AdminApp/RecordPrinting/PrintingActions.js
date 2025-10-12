import { db } from "../../dbServer";

export async function fetchReportCreator() {

  
  try {
    // Get the currently logged-in user
    const { data: userData, error: userError } = await db.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error("Failed to get user:", userError);
      return "Unknown User";
    }
    
    const userId = userData.user.id;


    // Query employee_Accounts table
    const { data: employeeData, error: employeeError } = await db
      .from("employee_Accounts")
      .select("personnel_Name, first_name, last_name")
      .eq("id", userId)
      .maybeSingle();

    // If we got employee data, use it
    if (employeeData && !employeeError) {
      // Check personnel_Name first
      if (employeeData.personnel_Name && employeeData.personnel_Name.trim()) {
        console.log("✅ Returning personnel_Name:", employeeData.personnel_Name);
        return employeeData.personnel_Name.trim();
      }
      
      // Check first_name and last_name
      if (employeeData.first_name || employeeData.last_name) {
        const name = `${employeeData.first_name || ""} ${employeeData.last_name || ""}`.trim();
        console.log("✅ Returning combined name:", name);
        return name;
      }
    }


    return userData.user.email || "Unknown User";
    
  } catch (err) {

    return "Unknown User";
  }
}