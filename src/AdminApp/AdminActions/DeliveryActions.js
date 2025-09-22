import { db } from "../../dbServer";

// ✅ Fetch all deliveries (with employee name + policy details)
export async function fetchDeliveries() {
  const { data, error } = await db
    .from("delivery_Table")
    .select(`
      *,
      employee:employee_Accounts(personnel_Name),
      policy:policy_Table(policy_Number, policy_Type)
    `)
    .or("is_archived.is.null,is_archived.eq.false"); // only active deliveries

  if (error) {
    console.error("Error fetching deliveries:", error.message);
    return [];
  }

  console.log("DELIVERIES DATA:", data);
  return data;
}

// ✅ Fetch employees (reusable for assigning deliveries)
export async function fetchEmployees() {
  const { data, error } = await db
    .from("employee_Accounts")
    .select("id, personnel_Name");

  if (error) {
    console.error("Error fetching employees:", error.message);
    return [];
  }

  return data;
}

// ✅ Create a new delivery
export async function createDelivery({ agentId, policyId, deliveryDate, remarks }) {
  const { data, error } = await db
    .from("delivery_Table")
    .insert([
      {
        agent_id: agentId || null,
        policy_id: policyId,
        delivery_date: deliveryDate,
        remarks: remarks || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating delivery:", error.message);
    throw error;
  }

  return data;
}

// ✅ Mark a delivery as archived
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

// ✅ Mark a delivery as completed (set delivered_at date)
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
