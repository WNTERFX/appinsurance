import { db } from "../../dbServer";

// ✅ Fetch active, non-archived policies
export async function fetchPolicies() {
  const { data, error } = await db
    .from("policy_Table")
    .select("id, internal_id, policy_type, policy_inception, policy_expiry, policy_is_active")
    .eq("policy_is_active", true)
    .or("is_archived.is.null,is_archived.eq.false");

  if (error) {
    console.error("Error fetching policies:", error.message);
    return [];
  }
  return data;
}

// ✅ Update existing delivery
export async function updateDelivery(deliveryId, { policyId, deliveryDate, estDeliveryDate, remarks }) {
  const { data, error } = await db
    .from("delivery_Table")
    .update({
      policy_id: policyId,
      delivery_date: deliveryDate,
      estimated_delivery_date: estDeliveryDate || null,
      remarks: remarks || null,
    })
    .eq("id", deliveryId)
    .select()
    .single();

  if (error) {
    console.error("Error updating delivery:", error.message);
    throw error;
  }

  return data;
}
