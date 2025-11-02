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

  try {
    // 1️⃣ Fetch active, non-archived policies for moderator's clients
    const { data: policies, error: policyError } = await db
      .from("policy_Table")
      .select(`
        id,
        internal_id,
        policy_type,
        policy_inception,
        policy_expiry,
        policy_is_active,
        is_archived,
        client:clients_Table!inner(
          uid,
          first_Name,
          middle_Name,
          family_Name,
          agent_Id
        )
      `)
      .eq("client.agent_Id", agentId)
      .eq("policy_is_active", true)
      .or("is_archived.is.null,is_archived.eq.false");

    if (policyError) throw policyError;
    if (!policies?.length) return [];

    // 2️⃣ Get all deliveries linked to these policies
    const policyIds = policies.map((p) => p.id);
    const { data: deliveries, error: deliveryError } = await db
      .from("delivery_Table")
      .select("policy_id, is_archived")
      .in("policy_id", policyIds)
      .or("is_archived.is.null,is_archived.eq.false");

    if (deliveryError) throw deliveryError;

    // 3️⃣ Mark which policies already have deliveries
    const deliveredIds = new Set(deliveries.map((d) => String(d.policy_id)));

    return policies.map((p) => ({
      ...p,
      hasDelivery: deliveredIds.has(String(p.id)), // 🔹 Add this flag
    }));
  } catch (err) {
    console.error("❌ Error fetching moderator policies:", err.message);
    return [];
  }
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
