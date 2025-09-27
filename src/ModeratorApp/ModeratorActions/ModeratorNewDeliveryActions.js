import { db } from "../../dbServer";

// ✅ Get current moderator user
export async function getCurrentModerator() {
  const { data: { session }, error: sessionError } = await db.auth.getSession();
  if (sessionError) {
    console.error("Error getting session:", sessionError.message);
    return null;
  }
  if (!session) {
    console.log("No active session");
    return null;
  }

  const { data: { user }, error: userError } = await db.auth.getUser();
  if (userError) {
    console.error("Error getting user:", userError.message);
    return null;
  }
  return user;
}

// ✅ Fetch only policies belonging to this moderator’s clients
export async function fetchModeratorPolicies(agentId) {
  if (!agentId) return [];

  const { data, error } = await db
    .from("policy_Table")
    .select(`
      id,
      policy_type,
      policy_inception,
      policy_expiry,
      policy_is_active,
      client:clients_Table!inner(
        uid,
        first_Name,
        middle_Name,
        family_Name,
        agent_Id
      )
    `)
    .eq("client.agent_Id", agentId) // 🔹 filter only moderator’s clients
    .eq("policy_is_active", true)
    .or("is_archived.is.null,is_archived.eq.false");

  if (error) {
    console.error("❌ Error fetching moderator policies:", error.message);
    return [];
  }
  return data;
}

// ✅ Create a new delivery
export async function createModeratorDelivery({ agentId, policyId, deliveryDate, estDeliveryDate, remarks }) {
  const { data, error } = await db
    .from("delivery_Table")
    .insert([
      {
        agent_id: agentId,
        policy_id: policyId,
        delivery_date: deliveryDate,
        estimated_delivery_date: estDeliveryDate || null,
        remarks: remarks || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ Error creating moderator delivery:", error.message);
    throw error;
  }
  return data;
}
