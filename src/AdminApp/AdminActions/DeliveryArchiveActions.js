import { db } from "../../dbServer";

/**
 * Fetch all archived deliveries
 */
export async function fetchArchivedDeliveries() {
   const { data, error } = await db
    .from("delivery_Table")
    .select(`
      *,
      employee:employee_Accounts(personnel_Name),
      policy:policy_Table(
        id,
        policy_type,
        policy_inception,
        policy_expiry,
        client:clients_Table(
          uid,
          first_Name,
          middle_Name,
          family_Name,
          address
        )
      )
    `)
    .eq("is_archived", true);  // ✅ correct boolean filter

  if (error) {
    console.error("Error fetching archived deliveries:", error.message);
    return [];
  }

  return data.map((delivery) => ({
    ...delivery,
    uid: delivery.id,
    policy_Id: delivery.policy_id,
    policy_Holder: delivery.policy?.client
      ? `${delivery.policy.client.first_Name || ""} ${delivery.policy.client.middle_Name || ""} ${delivery.policy.client.family_Name || ""}`.trim()
      : "Unknown",
    address: delivery.policy?.client?.address || "No address",
    created_at: delivery.created_at
      ? new Date(delivery.created_at).toLocaleDateString()
      : "N/A",
    delivery_date: delivery.delivered_at
      ? new Date(delivery.delivered_at).toLocaleDateString()
      : (delivery.estimated_delivery_date
          ? new Date(delivery.estimated_delivery_date).toLocaleDateString()
          : "Not set"),
    archival_date: delivery.archival_date
      ? new Date(delivery.archival_date).toLocaleDateString()
      : "N/A",
  }));
}

/**
 * Get a specific archived delivery by ID
 */
export async function getArchivedDeliveryById(deliveryId) {
  const { data, error } = await db
    .from("delivery_Table")
    .select(`
      *,
      agent:employee_Accounts(personnel_Name),
      policy:policy_Table(policy_Number)
    `)
    .eq("id", deliveryId)
    .eq("is_archived", true)          // must be archived
    .not("archival_date", "is", null) // must have archival date
    .single();

  if (error) {
    console.error("Error fetching archived delivery:", error.message);
    return null;
  }

  return data;
}

/**
 * Unarchive a delivery
 */
export async function unarchiveDelivery(deliveryId) {
  const { data, error } = await db
    .from("delivery_Table")
    .update({
      is_archived: false,
      archival_date: null,
    })
    .eq("id", deliveryId)
    .select();

  if (error) {
    console.error("Error unarchiving delivery:", error.message);
    throw error;
  }

  return data?.[0] || null;
}

/**
 * Permanently delete a delivery
 */
export async function deleteDelivery(deliveryId) {
  const { error } = await db
    .from("delivery_Table")
    .delete()
    .eq("id", deliveryId);

  if (error) throw error;
  return true;
}
