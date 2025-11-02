import { db } from "../../dbServer";
import { getCurrentUser } from "../ModeratorActions/ModeratorClientActions";

export async function fetchModeratorArchivedDeliveries() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error("Moderator not found or not logged in.");
      return [];
    }

    // ✅ Fetch archived deliveries from this moderator's clients only
    const { data, error } = await db
      .from("delivery_Table")
      .select(`
        *,
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
      .eq("policy.client.agent_Id", currentUser.id) // ✅ only their clients
      .eq("is_archived", true)
      .order("archival_date", { ascending: false });

    if (error) {
      console.error("Error fetching moderator archived deliveries:", error.message);
      return [];
    }

    console.log("Archived deliveries fetched:", data);

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
      delivery_date: delivery.delivery_date
        ? new Date(delivery.delivery_date).toLocaleDateString()
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
  if (!currentUser || !currentUser.id) throw new Error("Not logged in");

  // fetch delivery + policy.client.agent_Id to verify ownership
  const { data: delivery, error: fetchErr } = await db
    .from("delivery_Table")
    .select(`
      id,
      policy:policy_Table!inner(
        client:clients_Table!inner(agent_Id)
      )
    `)
    .eq("id", deliveryId)
    .single();

  if (fetchErr) {
    console.error("Error fetching delivery before unarchive:", fetchErr.message);
    throw fetchErr;
  }
  if (!delivery) throw new Error("Delivery not found");

  const agentId = delivery?.policy?.client?.agent_Id;
  if (String(agentId) !== String(currentUser.id)) {
    throw new Error("Not authorized to unarchive this delivery");
  }

  const { data, error } = await db
    .from("delivery_Table")
    .update({ is_archived: false, archival_date: null })
    .eq("id", deliveryId)
    .select()
    .single();

  if (error) {
    console.error("Error unarchiving delivery:", error.message);
    throw error;
  }

  return data;
}

/**
 * Permanently delete a delivery (only if this moderator owns the client on the delivery's policy)
 */
export async function deleteModeratorDelivery(deliveryId) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.id) throw new Error("Not logged in");

  // fetch delivery + policy.client.agent_Id to verify ownership
  const { data: delivery, error: fetchErr } = await db
    .from("delivery_Table")
    .select(`
      id,
      policy:policy_Table!inner(
        client:clients_Table!inner(agent_Id)
      )
    `)
    .eq("id", deliveryId)
    .single();

  if (fetchErr) {
    console.error("Error fetching delivery before delete:", fetchErr.message);
    throw fetchErr;
  }
  if (!delivery) throw new Error("Delivery not found");

  const agentId = delivery?.policy?.client?.agent_Id;
  if (String(agentId) !== String(currentUser.id)) {
    throw new Error("Not authorized to delete this delivery");
  }

  const { error } = await db
    .from("delivery_Table")
    .delete()
    .eq("id", deliveryId);

  if (error) {
    console.error("Error deleting delivery:", error.message);
    throw error;
  }

  return true;
}