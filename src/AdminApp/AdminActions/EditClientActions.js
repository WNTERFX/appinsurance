import { db } from "../../dbServer";

export async function editClient(
  clientId, 
  updatePrefix, 
  updateFirst, 
  updateMiddle, 
  updateFamily, 
  updateSuffix, 
  updateAddress, 
  updateBarangay,     
  updateCity,         
  updateProvince,     
  updateRegion,       
  updatePhoneNum, 
  updateEmail,
  updateZipCode // ADDED
) {
  const { data, error } = await db 
    .from("clients_Table")
    .update({ 
      prefix: updatePrefix,
      first_Name: updateFirst,
      middle_Name: updateMiddle,
      family_Name: updateFamily,
      suffix: updateSuffix,
      address: updateAddress,
      barangay_address: updateBarangay,     
      city_address: updateCity,           
      province_address: updateProvince,     
      region_address: updateRegion,       
      phone_Number: updatePhoneNum,
      email: updateEmail,
      zip_code: updateZipCode // ADDED
    })
    .eq("uid", clientId);

  if (error) {
    console.error("Error updating client:", error.message);
    return [];
  }
  
  return data;
}

export async function fetchClients() {
  const { data, error } = await db
    .from("clients_Table")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error.message);
    return [];
  }
  return data;
}

export async function checkIfEmailExists(email) {
  try {
    const { data, error } = await db
      .from("clients_Table")
      .select("uid", { count: "exact" })
      .eq("email", email);

    if (error) throw error;
    return (data && data.length > 0);
  } catch (error) {
    console.error("Error checking email:", error.message);
    return false;
  }
}

export async function checkIfPhoneExists(phoneNumber) {
  try {
    const { data, error } = await db
      .from("clients_Table")
      .select("uid", { count: "exact" })
      .eq("phone_Number", phoneNumber);

    if (error) throw error;
    return (data && data.length > 0);
  } catch (error) {
    console.error("Error checking phone:", error.message);
    return false;
  }
}
