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

export async function fetchQuotations(fromDate, toDate, insurancePartner = null) {
  try {
    let query = db
      .from("quotation_Table")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply date range filter
    if (fromDate && toDate) {
      query = query
        .gte("created_at", fromDate)
        .lte("created_at", toDate);
    }

    // Apply insurance partner filter if provided
    if (insurancePartner) {
      query = query.eq("insurance_partner", insurancePartner);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching quotations:", err);
    return [];
  }
}

export async function fetchDeliveries(fromDate, toDate, employeeId = null) {
  try {
    let query = db
      .from("delivery_Table")
      .select(`
        *,
        employee_Accounts:agent_id (
          id,
          personnel_Name,
          first_name,
          last_name
        ),
        policy_Table:policy_id (
          id,
          internal_id,
          clients_Table (
            first_Name,
            family_Name
          ),
          insurance_Partners (
            insurance_Name
          )
        )
      `)
      .order("created_at", { ascending: false });

    // Apply date range filter on delivery_date or estimated_delivery_date
    if (fromDate && toDate) {
      query = query.or(
        `delivery_date.gte.${fromDate},delivery_date.lte.${toDate},` +
        `estimated_delivery_date.gte.${fromDate},estimated_delivery_date.lte.${toDate},` +
        `delivered_at.gte.${fromDate},delivered_at.lte.${toDate}`
      );
    }

    // Apply employee filter if provided
    if (employeeId) {
      query = query.eq("agent_id", employeeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching deliveries:", err);
    return [];
  }
}