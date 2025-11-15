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

/**
 * Get current user and check if they are admin or moderator
 */
async function getCurrentUserRole() {
  try {
    const { data: { user }, error } = await db.auth.getUser();
    
    if (error || !user) {
      console.error("Error getting current user:", error);
      return { isAdmin: false, isModerator: false, userId: null };
    }

    // Check if user is an employee (moderator or admin)
    const { data: employee, error: empError } = await db
      .from("employee_Accounts")
      .select("id, is_Admin")
      .eq("id", user.id)
      .maybeSingle();

    if (empError) {
      console.error("Error checking employee status:", empError);
      return { isAdmin: false, isModerator: false, userId: user.id };
    }

    if (!employee) {
      return { isAdmin: false, isModerator: false, userId: user.id };
    }

    return {
      isAdmin: employee.is_Admin === true,
      isModerator: !employee.is_Admin, // If not admin, then moderator
      userId: employee.id
    };
  } catch (err) {
    console.error("getCurrentUserRole error:", err);
    return { isAdmin: false, isModerator: false, userId: null };
  }
}

/**
 * Get pending claims with user-level access control
 * - Admins see all pending claims
 * - Moderators only see pending claims for their assigned clients
 */
export async function getPendingClaims() {
  try {
    console.log("Fetching pending claims with user access control...");
    
    // Get current user role
    const { isAdmin, isModerator, userId } = await getCurrentUserRole();
    console.log("User role:", { isAdmin, isModerator, userId });

    // Step 1: Get the appropriate client UIDs based on role
    let clientUids = [];
    
    if (isModerator) {
      // Moderator: Only get their assigned clients
      const { data: clients, error: clientsError } = await db
        .from("clients_Table")
        .select("uid")
        .eq("agent_Id", userId)
        .or("is_archived.is.null,is_archived.eq.false");

      if (clientsError) {
        console.error("Error fetching moderator's clients:", clientsError);
        throw clientsError;
      }

      if (!clients || clients.length === 0) {
        console.log("🔒 No clients assigned to this moderator");
        return [];
      }

      clientUids = clients.map(c => c.uid);
      console.log(`🔒 Moderator has ${clientUids.length} assigned clients`);
    }
    // If admin, clientUids remains empty array (fetch all)

    // Step 2: Get policies for these clients (or all policies if admin)
    let policyQuery = db
      .from("policy_Table")
      .select("id, client_id")
      .or("is_archived.is.null,is_archived.eq.false")
      .is("archival_date", null);

    if (isModerator) {
      // Filter by client UIDs for moderators
      policyQuery = policyQuery.in("client_id", clientUids);
    }

    const { data: policies, error: policiesError } = await policyQuery;

    if (policiesError) {
      console.error("Error fetching policies:", policiesError);
      throw policiesError;
    }

    if (!policies || policies.length === 0) {
      console.log("No policies found");
      return [];
    }

    const policyIds = policies.map(p => p.id);
    console.log(`Found ${policyIds.length} policies`);

    // Step 3: Fetch pending claims for these policies
    const { data: claims, error: claimsError } = await db
      .from('claims_Table')
      .select(`
        id,
        policy_id,
        status,
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
      .in('policy_id', policyIds)
      .eq('status', 'Pending')
      .eq('is_archived', false)
      .order('id', { ascending: false })
      .limit(10); // limit to 10 for dashboard

    if (claimsError) {
      console.error("Error fetching pending claims:", claimsError);
      throw claimsError;
    }

    console.log(`Found ${claims?.length || 0} pending claims`);

    // Format results
    return claims.map((claim) => ({
      id: claim.id,
      policy_id: claim.policy_Table?.internal_id || "N/A",
      status: claim.status,
      policy_holder: claim.policy_Table?.clients_Table
        ? `${claim.policy_Table.clients_Table.first_Name || ""} ${claim.policy_Table.clients_Table.middle_Name || ""} ${claim.policy_Table.clients_Table.family_Name || ""}`.trim()
        : "N/A",
    }));
  } catch (err) {
    console.error("Error fetching pending claims:", err.message);
    return [];
  }
}