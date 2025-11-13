import { db } from "../../dbServer";

/* ========== LIFO active policies (with client_id) ========== */
export async function fetchPolicies() {
  let res = await db
    .from("policy_Table")
    .select("id, internal_id, client_id, policy_type, policy_inception, policy_expiry, policy_is_active, is_archived, created_at")
    .eq("policy_is_active", true)
    .or("is_archived.is.null,is_archived.eq.false")
    .order("created_at", { ascending: false });

  if (res.error) {
    console.warn("fetchPolicies fallback →", res.error.message);
    res = await db
      .from("policy_Table")
      .select("id, internal_id, client_id, policy_type, policy_inception, policy_expiry, policy_is_active, is_archived")
      .eq("policy_is_active", true)
      .or("is_archived.is.null,is_archived.eq.false")
      .order("id", { ascending: false });
  }
  if (res.error) {
    console.error("fetchPolicies error:", res.error);
    return [];
  }
  return res.data ?? [];
}

/* ========== Load a single delivery row ========== */
export async function fetchDelivery(deliveryId) {
  const { data, error } = await db
    .from("delivery_Table")
    .select(`
      id, policy_id, delivery_date, estimated_delivery_date, remarks, created_at,
      delivery_street_address, delivery_region, delivery_province, 
      delivery_city, delivery_barangay, delivery_zip_code
    `)
    .eq("id", deliveryId)
    .single();
  if (error) {
    console.error("fetchDelivery error:", error);
    throw error;
  }
  return data;
}

/* ========== Policy by ID (includes client_id) ========== */
export async function fetchPolicyById(id) {
  const { data, error } = await db
    .from("policy_Table")
    .select("id, internal_id, client_id, policy_type, policy_inception, policy_expiry, policy_is_active, is_archived, created_at")
    .eq("id", id)
    .single();
  if (error) {
    console.error("fetchPolicyById error:", error);
    throw error;
  }
  console.log("Policy fetched by ID:", data);
  return data;
}

/* ========== Client by UID ========== */
export async function fetchClientByUid(uid) {
  console.log("Fetching client with UID:", uid);
  
  const { data, error } = await db
    .from("clients_Table")
    .select(`
      uid, internal_id, first_Name, middle_Name, family_Name,
      address, barangay_address, city_address, province_address, region_address, zip_code
    `)
    .eq("uid", uid)
    .single();
  
  if (error) {
    console.error("fetchClientByUid error:", error);
    throw error;
  }
  
  console.log("Client data fetched:", data);
  return data;
}

/* ========== Update delivery with address snapshot ========== */
export async function updateDelivery(deliveryId, payload) {
  const {
    policyId,
    deliveryDate,
    estDeliveryDate,
    remarks,
    delivery_street_address,
    delivery_region,
    delivery_province,
    delivery_city,
    delivery_barangay,
    delivery_zip_code,
  } = payload;

  const patch = {};
  
  // Core fields
  if (typeof policyId !== "undefined") patch.policy_id = policyId;
  if (typeof deliveryDate !== "undefined") patch.delivery_date = deliveryDate;
  patch.estimated_delivery_date = typeof estDeliveryDate === "undefined" ? null : estDeliveryDate || null;
  patch.remarks = typeof remarks === "undefined" ? null : remarks ?? null;

  // ✅ Address snapshot fields
  if (typeof delivery_street_address !== "undefined") {
    patch.delivery_street_address = delivery_street_address || null;
  }
  if (typeof delivery_region !== "undefined") {
    patch.delivery_region = delivery_region || null;
  }
  if (typeof delivery_province !== "undefined") {
    patch.delivery_province = delivery_province || null;
  }
  if (typeof delivery_city !== "undefined") {
    patch.delivery_city = delivery_city || null;
  }
  if (typeof delivery_barangay !== "undefined") {
    patch.delivery_barangay = delivery_barangay || null;
  }
  if (typeof delivery_zip_code !== "undefined") {
    patch.delivery_zip_code = delivery_zip_code || null;
  }

  console.log("Updating delivery with:", patch);

  const { data, error } = await db
    .from("delivery_Table")
    .update(patch)
    .eq("id", deliveryId)
    .select()
    .single();

  if (error) {
    console.error("updateDelivery error:", error);
    throw error;
  }
  return data;
}