import { db } from "../../dbServer";

// ✅ Fetch all deliveries (with employee + policy + client)
export async function fetchDeliveries() {
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
    .or("is_archived.is.null,is_archived.eq.false");
  
  if (error) {
    console.error("Error fetching deliveries:", error.message);
    return [];
  }
  
  // Transform the data to match what the UI expects
  return data.map(delivery => {
    const delivered = delivery.delivered_at
      ? new Date(delivery.delivered_at).toLocaleDateString()
      : null;

    const estimated = delivery.estimated_delivery_date
      ? new Date(delivery.estimated_delivery_date).toLocaleDateString()
      : "Not set";

    return {
      ...delivery,
      uid: delivery.id, // Map id to uid for compatibility
      policy_Id: delivery.policy_id,
      delivered_at: delivery.delivered_at, 
      policy_Holder: delivery.policy?.client 
        ? `${delivery.policy.client.first_Name || ''} ${delivery.policy.client.middle_Name || ''} ${delivery.policy.client.family_Name || ''}`.trim()
        : "Unknown",
      address: delivery.policy?.client?.address || "No address",
      created_At: new Date(delivery.created_at).toLocaleDateString(),

      // ✅ Single field: if delivered, show delivered date, else show estimate
      displayDate: delivered || estimated,
    };
  });
}
// ✅ Archive
export async function archiveDelivery(deliveryId) {
  const { data, error } = await db
    .from("delivery_Table")
    .update({
      is_archived: true,
      archival_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", deliveryId)
    .select()
    .single();
  
  if (error) {
    console.error("Error archiving delivery:", error.message);
    throw error;
  }
  return data;
}

// ✅ Mark Delivered
export async function markDeliveryAsDelivered(deliveryId) {
  const { data, error } = await db
    .from("delivery_Table")
    .update({
      delivered_at: new Date().toISOString().split("T")[0],
    })
    .eq("id", deliveryId)
    .select()
    .single();
  
  if (error) {
    console.error("Error marking delivery as delivered:", error.message);
    throw error;
  }
  return data;
}