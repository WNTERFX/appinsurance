// src/AdminActions/ClientAddressActions.js
import { db } from "../../dbServer";

/** Display helper that tolerates different street column names */
export function formatAddressString(a = {}) {
  const street =
    a.street_address || a.street || a.address || a.street_addr || a.streetAddress || "";
  const parts = [street, a.barangay, a.city, a.region || a.province, a.zip_code]
    .filter(Boolean)
    .map((s) => String(s).trim());
  return parts.join(", ");
}

/** Pull client's default (non-editable) address from clients_Table */
export async function fetchClientDefaultFromClientsTable(clientUid) {
  if (!clientUid) return null;
  const { data, error } = await db
    .from("clients_Table")
    .select(
      "uid, address, region_address, province_address, city_address, barangay_address, zip_code"
    )
    .eq("uid", clientUid)
    .maybeSingle();

  if (error) {
    console.error("fetchClientDefaultFromClientsTable:", error.message);
    return null;
  }
  if (!data) return null;

  return {
    id: null,
    client_uid: data.uid,
    street_address: data.address || "",
    region: data.region_address || "",
    province: data.province_address || "",
    city: data.city_address || "",
    barangay: data.barangay_address || "",
    zip_code: data.zip_code ?? "",
    is_default: true,
    is_delivered_address: false,
  };
}

/** Fetch from client_addresses (delivered first) */
export async function fetchClientAddresses(clientUid) {
  if (!clientUid) return [];
  const { data, error } = await db
    .from("client_addresses")
    .select("*")
    .eq("client_uid", clientUid)
    .or("is_archived.is.null,is_archived.eq.false")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchClientAddresses:", error.message);
    return [];
  }

  const delivered = [];
  const others = [];
  for (const row of data) {
    (row.is_delivered_address ? delivered : others).push(row);
  }
  return [...delivered, ...others];
}

/** Internal helper: remap street key when DB column names differ */
function remapStreetKey(obj, newKey) {
  const { street_address, ...rest } = obj;
  return { ...rest, [newKey]: street_address };
}

/** Create (tolerates street_address | address | street) */
export async function createClientAddress(clientUid, payload) {
  const base = {
    client_uid: clientUid,
    street_address: payload.street_address?.trim() || "",
    region: payload.region?.trim() || "",
    province: payload.province?.trim() || "",
    city: payload.city?.trim() || "",
    barangay: payload.barangay?.trim() || "",
    zip_code: payload.zip_code ? Number(payload.zip_code) : null,
    is_default: false,
    is_delivered_address: !!payload.is_delivered_address,
  };

  let { data, error } = await db
    .from("client_addresses")
    .insert(base)
    .select()
    .single();

  // Column name compatibility fallback
  if (error && error.code === "42703") {
    ({ data, error } = await db
      .from("client_addresses")
      .insert(remapStreetKey(base, "address"))
      .select()
      .single());
    if (error && error.code === "42703") {
      ({ data, error } = await db
        .from("client_addresses")
        .insert(remapStreetKey(base, "street"))
        .select()
        .single());
    }
  }
  if (error) throw error;

  if (base.is_delivered_address) {
    await setDeliveredAddress(clientUid, data.id);
  }
  return data;
}

/** Update (same fallback trick) */
export async function updateClientAddress(addressId, payload) {
  const base = {
    street_address: payload.street_address?.trim() || "",
    region: payload.region?.trim() || "",
    province: payload.province?.trim() || "",
    city: payload.city?.trim() || "",
    barangay: payload.barangay?.trim() || "",
    zip_code: payload.zip_code ? Number(payload.zip_code) : null,
  };

  let { data, error } = await db
    .from("client_addresses")
    .update(base)
    .eq("id", addressId)
    .select()
    .single();

  if (error && error.code === "42703") {
    ({ data, error } = await db
      .from("client_addresses")
      .update(remapStreetKey(base, "address"))
      .eq("id", addressId)
      .select()
      .single());
    if (error && error.code === "42703") {
      ({ data, error } = await db
        .from("client_addresses")
        .update(remapStreetKey(base, "street"))
        .eq("id", addressId)
        .select()
        .single());
    }
  }

  if (error) throw error;
  return data;
}

/** Mark one row as delivered and clear others */
export async function setDeliveredAddress(clientUid, addressId) {
  if (!clientUid || !addressId) return;

  const { error: clearErr } = await db
    .from("client_addresses")
    .update({ is_delivered_address: false })
    .eq("client_uid", clientUid);
  if (clearErr) throw clearErr;

  const { error: setErr } = await db
    .from("client_addresses")
    .update({ is_delivered_address: true })
    .eq("id", addressId);
  if (setErr) throw setErr;
}

/** ✅ NEW: Set default (clients_Table) address as delivered by clearing all custom addresses */
export async function setDefaultAsDeliveredAddress(clientUid) {
  if (!clientUid) return;

  // Clear all custom addresses' delivered flag
  const { error } = await db
    .from("client_addresses")
    .update({ is_delivered_address: false })
    .eq("client_uid", clientUid);
  
  if (error) throw error;
}

export function pickDeliveredAddress(addresses = []) {
  return addresses.find((a) => a.is_delivered_address) || null;
}
