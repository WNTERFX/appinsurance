// src/AdminActions/NewDeliveryActions.js
import { db } from "../../dbServer";

// ✅ Get current user with role and employee ID (using is_Admin boolean)
export async function getCurrentUser() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) return null;
  
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;

  // Get employee record - id is the foreign key to auth.users
  const { data: employee, error } = await db
    .from("employee_Accounts")
    .select("id, is_Admin")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching employee:", error.message);
    return { ...user, employeeId: null, isAdmin: false };
  }

  return {
    ...user,
    employeeId: employee.id,
    isAdmin: employee.is_Admin // true = admin, false = moderator
  };
}

// ✅ Fetch policies with proper join through clients_Table.agent_Id
// ✅ UPDATED: Fetch policies regardless of policy_is_active status (true or false)
export async function fetchPolicies() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

    // ✅ Fetch policies with client info (includes agent_Id from clients_Table)
    // ✅ REMOVED: .eq("policy_is_active", true) to allow both active and inactive policies
    let policyQuery = db
      .from("policy_Table")
      .select(`
        id,
        internal_id,
        client_id,
        policy_type,
        policy_inception,
        policy_expiry,
        policy_is_active,
        is_archived,
        policy_status,
        void_reason,
        voided_date,
        client:clients_Table(agent_Id)
      `)
      .or("is_archived.is.null,is_archived.eq.false") // Only exclude archived policies
      .or("policy_status.is.null,policy_status.neq.voided"); // ✅ Exclude voided policies

    const { data: policies, error: policyError } = await policyQuery;

    if (policyError) throw policyError;
    if (!policies?.length) return [];

    // ✅ Filter policies by client's agent_Id for moderators
    let filteredPolicies = policies;
    if (!currentUser.isAdmin && currentUser.employeeId) {
      filteredPolicies = policies.filter(p => 
        p.client?.agent_Id === currentUser.employeeId
      );
    }

    const policyIds = filteredPolicies.map((p) => p.id);
    if (policyIds.length === 0) return [];
    
    // ✅ Get deliveries - filter by agent_id for moderators
    let deliveryQuery = db
      .from("delivery_Table")
      .select("policy_id, is_archived, agent_id")
      .in("policy_id", policyIds)
      .or("is_archived.is.null,is_archived.eq.false");

    // Filter deliveries by agent for moderators
    if (!currentUser.isAdmin && currentUser.employeeId) {
      deliveryQuery = deliveryQuery.eq("agent_id", currentUser.employeeId);
    }

    const { data: deliveries, error: deliveryError } = await deliveryQuery;

    if (deliveryError) throw deliveryError;

    const deliveredIds = new Set((deliveries ?? []).map((d) => String(d.policy_id)));
    
    // Remove the client object from response (just used for filtering)
    return filteredPolicies.map((p) => {
      const { client, ...policyData } = p;
      return {
        ...policyData,
        hasDelivery: deliveredIds.has(String(p.id))
      };
    });
  } catch (err) {
    console.error("Error fetching policies:", err.message);
    return [];
  }
}

// ✅ Fetch clients filtered by agent_Id for moderators
export async function fetchClients() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

    let query = db
      .from("clients_Table")
      .select("uid, internal_id, first_Name, middle_Name, family_Name, agent_Id")
      .order("internal_id", { ascending: true });

    // ✅ Filter by agent_Id for moderators
    if (!currentUser.isAdmin && currentUser.employeeId) {
      query = query.eq("agent_Id", currentUser.employeeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Remove agent_Id from response (just used for filtering)
    return (data || []).map(({ agent_Id, ...client }) => client);
  } catch (e) {
    console.error("Error fetching clients:", e.message);
    return [];
  }
}

// ✅ Get client's agent_id from policy
async function getClientAgentFromPolicy(policyId) {
  try {
    const { data, error } = await db
      .from("policy_Table")
      .select(`
        client:clients_Table(agent_Id)
      `)
      .eq("id", policyId)
      .single();

    if (error) {
      console.error("Error fetching client's agent:", error.message);
      return null;
    }

    return data?.client?.agent_Id || null;
  } catch (err) {
    console.error("Error in getClientAgentFromPolicy:", err);
    return null;
  }
}

export async function createDelivery(payload) {
  // ✅ Get current user for validation
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.employeeId) {
    throw new Error("User not authenticated or employee record not found");
  }

  // ✅ Get the client's agent_id from the policy
  const clientAgentId = await getClientAgentFromPolicy(payload.policyId);
  
  if (!clientAgentId) {
    throw new Error("Unable to determine client's assigned agent for this policy");
  }

  console.log("📝 Creating delivery:", {
    policyId: payload.policyId,
    clientAgentId: clientAgentId,
    createdBy: currentUser.employeeId,
    isAdmin: currentUser.isAdmin
  });

  // ✅ Determine address type based on source
  const isCustomAddress = payload.delivery_address_type === "custom" && payload.custom_address_id;
  
  const insert = {
    agent_id: clientAgentId,  // ✅ Use client's agent, not current user
    policy_id: payload.policyId,
    delivery_date: payload.deliveryDate,
    estimated_delivery_date: payload.estDeliveryDate,
    remarks: payload.remarks || null,
    status: "Pending",
    created_at: new Date().toISOString(),

    // ✅ Address type must be either 'default' or 'custom'
    delivery_address_type: isCustomAddress ? "custom" : "default",
    custom_address_id: isCustomAddress ? payload.custom_address_id : null,
    
    // ✅ Snapshot fields - always include regardless of source
    delivery_street_address: payload.delivery_street_address || null,
    delivery_region: payload.delivery_region || null,
    delivery_province: payload.delivery_province || null,
    delivery_city: payload.delivery_city || null,
    delivery_barangay: payload.delivery_barangay || null,
    delivery_zip_code:
      typeof payload.delivery_zip_code === "number"
        ? payload.delivery_zip_code
        : payload.delivery_zip_code
        ? Number(payload.delivery_zip_code)
        : null,
  };

  const { data, error } = await db
    .from("delivery_Table")
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  
  console.log("✅ Delivery created successfully:", data.id);
  return data;
}