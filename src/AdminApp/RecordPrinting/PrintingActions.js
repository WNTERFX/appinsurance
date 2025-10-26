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

export async function fetchPaymentsWithPenalties(policyId) {
  try {
    const { data, error } = await db
      .from("payment_Table")
      .select(`
        id,
        payment_date,
        amount_to_be_paid,
        is_paid,
        paid_amount,
        policy_id,
        payment_type_id,
        payment_due_penalties (
          penalty_amount,
          penalty_date,
          penalty_reason
        )
      `)
      .eq("policy_id", policyId)
      .order("payment_date", { ascending: true });

    if (error) throw error;

    // Compute total penalty per payment
    const processed = data.map((p) => {
      const totalPenalty = p.payment_due_penalties?.reduce(
        (sum, pen) => sum + (pen.penalty_amount || 0),
        0
      ) || 0;

      return {
        ...p,
        totalPenalty,
        totalDue: (p.amount_to_be_paid || 0) + totalPenalty,
      };
    });

    return processed;
  } catch (err) {
    console.error("Error fetching payments with penalties:", err);
    return [];
  }
}