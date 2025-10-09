import { db } from "../../dbServer";
import { getCurrentUser } from "../ModeratorActions/ModeratorClientActions";

/**
 * Fetch archived deliveries for the current moderator's clients only
 */
export async function fetchModeratorArchivedDeliveries() {
  try {
    // Get the logged-in moderator
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error("Moderator not found or not logged in.");
      return [];
    }

    // Fetch only archived deliveries assigned to this moderator
    const { data, error } = await db
      .from("delivery_Table")
      .select(
        `
        *,
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
      `
      )
      .eq("is_archived", true)
      .eq("agent", currentUser.id);

    if (error) {
      console.error("Error fetching moderator archived deliveries:", error.message);
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
      delivery_date: delivery.delivery_at
        ? new Date(delivery.delivery_at).toLocaleDateString()
        : (delivery.estimated_delivery_date
            ? new Date(delivery.estimated_delivery_date).toLocaleDateString()
            : "Not set"),
      archival_date: delivery.archival_date
        ? new Date(delivery.archival_date).toLocaleDateString()
        : "N/A",
    }));
  } catch (err) {
    console.error("Error in fetchModeratorArchivedDeliveries:", err.message);
    return [];
  }
}

/**
 * Unarchive a delivery (moderator can only unarchive their own deliveries)
 */
export async function unarchiveModeratorDelivery(deliveryId) {
  const currentUser = await getCurrentUser();
  const { error } = await db
    .from("delivery_Table")
    .update({ is_archived: false, archival_date: null })
    .eq("id", deliveryId)
    .eq("agent", currentUser.id); // ✅ Only their deliveries

  if (error) throw error;
  return true;
}

/**
 * Permanently delete a delivery (moderator can only delete their own deliveries)
 */
export async function deleteModeratorDelivery(deliveryId) {
  const currentUser = await getCurrentUser();
  const { error } = await db
    .from("delivery_Table")
    .delete()
    .eq("id", deliveryId)
    .eq("agent", currentUser.id); // ✅ Only their deliveries

  if (error) throw error;
  return true;
}
