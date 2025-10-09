import { db } from "../../dbServer";

// ✅ Fetch deliveries by moderator agent_Id
export async function fetchModeratorDeliveries(agentId) {
  if (!agentId) return [];

  const { data, error } = await db
    .from("delivery_Table")
    .select(`
      *, 
      employee:employee_Accounts(personnel_Name),
      policy:policy_Table!inner(
        id,
        policy_type,
        policy_inception,
        policy_expiry,
        client:clients_Table!inner(
          uid,
          first_Name,
          middle_Name,
          family_Name,
          address,
          agent_Id
        )
      )
    `)
    // ✅ correct filter: match this moderator’s agent_Id
    .eq("policy.client.agent_Id", agentId)
    .or("is_archived.is.null,is_archived.eq.false");

  if (error) {
    console.error("❌ Error fetching moderator deliveries:", error.message);
    return [];
  }

  return formatDeliveries(data);
}

/**
 * Formatter
 */
function formatDeliveries(data) {
  return data.map((delivery) => {
    const delivered = delivery.delivered_at
      ? new Date(delivery.delivered_at).toLocaleDateString()
      : null;

    const estimated = delivery.estimated_delivery_date
      ? new Date(delivery.estimated_delivery_date).toLocaleDateString()
      : "Not set";

    return {
      ...delivery,
      uid: delivery.id,
      policy_Id: delivery.policy_id,
      delivered_at: delivery.delivered_at,
      remarks: delivery.remarks || "" , 
      policy_Holder: delivery.policy?.client
        ? `${delivery.policy.client.first_Name || ""} ${delivery.policy.client.middle_Name || ""} ${delivery.policy.client.family_Name || ""}`.trim()
        : "Unknown",
      address: delivery.policy?.client?.address || "No address",
      created_At: new Date(delivery.created_at).toLocaleDateString(),
      displayDate: delivered || estimated,
    };
  });
}

// ✅ Archive
export async function archiveModeratorDelivery(deliveryId) {
  const { data, error } = await db
    .from("delivery_Table")
    .update({
      is_archived: true,
      archival_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", deliveryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ✅ Mark Delivered
export async function markModeratorDeliveryAsDelivered(deliveryId) {
  const { data, error } = await db
    .from("delivery_Table")
    .update({
      delivered_at: new Date().toISOString().split("T")[0],
    })
    .eq("id", deliveryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
