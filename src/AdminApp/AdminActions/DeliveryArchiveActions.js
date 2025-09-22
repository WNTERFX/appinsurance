import { db } from "../../dbServer";

/**
 * Fetch all archived deliveries
 */
export async function fetchArchivedDeliveries() {
  const { data, error } = await db
    .from("delivery_Table")
    .select(`
      *,
      agent:employee_Accounts(personnel_Name),
      policy:policy_Table(policy_Number)
    `)
    .eq("is_archived", true)          // must be archived
    .not("archival_date", "is", null) // must have archival date
    .order("delivery_date", { ascending: false });

  if (error) {
    console.error("Error fetching archived deliveries:", error.message);
    return [];
  }

  return data || [];
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
