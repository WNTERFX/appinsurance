import { db } from "../../dbServer";

export async function recentClientTable() {
    const { data, error } = await db
        .from("clients_Table")
        .select(`
            uid,
            first_Name,
            middle_Name,
            family_Name,
            client_Registered,
            employee_Accounts:agent_Id (
                personnel_Name
            )
        `)
        .or("is_archived.is.null,is_archived.eq.false")
        .order("client_Registered", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching clients:", error.message);
        return [];
    }

    return data.map((client) => ({
        uid: client.uid,
        fullName: `${client.first_Name || ""} ${client.middle_Name || ""} ${
            client.family_Name || ""
        }`.trim(),
        agent_Name: client.employee_Accounts?.personnel_Name || "N/A",
        client_Registered: new Date(client.client_Registered).toLocaleDateString(),
    }));
}

export async function fetchRecentPolicy() {
    const { data, error } = await db
        .from("policy_Table")
        .select(`
            *,
            clients_Table(
                first_Name,
                middle_Name,
                family_Name,
                prefix,
                suffix
            )`)
        .or("is_archived.is.null,is_archived.eq.false")
        .is("archival_date", null)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching policy:", error.message);
        return [];
    }
    return data;
}

export async function getClientCount() {
    const { count, error } = await db
        .from("clients_Table")
        .select("uid", { count: "exact", head: true })
        .or("is_archived.is.null,is_archived.eq.false");

    if (error) {
        console.error("Error counting clients:", error.message);
        return 0;
    }

    return count;
}

export async function getTotalPolicyCount() { 
  try {
    const { count, error } = await db
      .from("policy_Table")
      .select("id", { count: "exact", head: true })
      .or("is_archived.is.null,is_archived.eq.false") 
      .is("archival_date", null); 

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error("Error counting total policies:", err.message);
    return 0;
  }
}

export async function getTotalDeliveredPolicyCount() { 
  try {
    const { count, error } = await db
      .from("delivery_Table")
      .select("id", { count: "exact", head: true }) 
      .not("delivery_date", "is", null) 
      .or("is_archived.is.null,is_archived.eq.false"); 

    if (error) {
      console.error("Supabase error counting total delivered records:", error.message);
      throw error;
    }

    return count || 0;

  } catch (err) {
    console.error("Unexpected error counting total delivered records:", err.message);
    return 0;
  }
}

export async function getMonthlyPartnerPolicyData() {
  try {
    const { data, error } = await db
      .from("policy_Table")
      .select(`
        id,
        created_at,
        partner_id,
        insurance_Partners!policy_table_partner_id_fkey(insurance_Name)
      `)
      .or("is_archived.is.null,is_archived.eq.false")
      .is("archival_date", null);

    if (error) {
      console.error("Supabase query error:", error.message);
      return { xAxis: [], series: [] };
    }

    console.log("Raw policy data:", data); 

    const monthMap = {
      0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr",
      4: "May", 5: "Jun", 6: "Jul", 7: "Aug",
      8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec"
    };

    const monthlyCounts = {};
    const partnerNames = new Set();

    data.forEach((policy) => {
      const createdDate = new Date(policy.created_at);
      const month = monthMap[createdDate.getMonth()];
      const partner = policy.insurance_Partners?.insurance_Name || "Unknown";

      partnerNames.add(partner);
      monthlyCounts[month] ??= {};
      monthlyCounts[month][partner] ??= 0;
      monthlyCounts[month][partner] += 1;
    });

    const xAxis = Object.keys(monthlyCounts);
    const partners = Array.from(partnerNames);

    const series = partners.map((partner) => ({
      label: partner,
      data: xAxis.map((month) => monthlyCounts[month][partner] || 0),
    }));

    console.log("Chart data:", { xAxis, series }); // 👈 DEBUG

    return { xAxis, series };
  } catch (err) {
    console.error("Error fetching monthly partner data:", err.message);
    return { xAxis: [], series: [] };
  }
}

export async function getAllPartners() {
  try {
    const { data, error } = await db
      .from("insurance_Partners")
      .select("id, insurance_Name")
      .order("insurance_Name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching partners:", err.message);
    return [];
  }
}

export async function getThisMonthsDuePaymentsDetails() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await db
      .from("payment_Table")
      .select(`
        id,
        payment_date,
        amount_to_be_paid,
        policy_Table (
          internal_id,
          client_id,
          clients_Table (
            first_Name,
            middle_Name,
            family_Name
          )
        )
      `)
      .gte("payment_date", startOfMonth)
      .lte("payment_date", endOfMonth)
      .eq("is_paid", false)
      .or("is_archive.is.null,is_archive.eq.false")
      .order("payment_date", { ascending: true })
      .limit(20); // limit to 20 for dashboard

    if (error) throw error;

    // Format results
    return data.map((payment) => ({
      id: payment.id,
      payment_date: new Date(payment.payment_date).toLocaleDateString(),
      amount_to_be_paid: payment.amount_to_be_paid,
      policy_id: payment.policy_Table?.internal_id || "N/A",
      client_name: payment.policy_Table?.clients_Table
        ? `${payment.policy_Table.clients_Table.first_Name || ""} ${payment.policy_Table.clients_Table.middle_Name || ""} ${payment.policy_Table.clients_Table.family_Name || ""}`.trim()
        : "N/A",
    }));
  } catch (err) {
    console.error("Error fetching this month's due payments details:", err.message);
    return [];
  }
}