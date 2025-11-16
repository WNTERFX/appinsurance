import { db } from "../../dbServer";

// Get Supabase URL and Key for edge function calls
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://ezmvecxqcjnrspmjfgkk.supabase.co";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

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
  updateZipCode
) {
  try {
    // Get current client data
    const { data: currentClient, error: fetchError } = await db
      .from("clients_Table")
      .select("email, phone_Number, auth_id")
      .eq("uid", clientId)
      .single();

    if (fetchError) {
      console.error("Error fetching current client:", fetchError);
      throw new Error("Failed to fetch current client data");
    }

    const emailChanged = currentClient && currentClient.email !== updateEmail;
    const phoneChanged = currentClient && currentClient.phone_Number !== updatePhoneNum;

    // If email OR phone changed, call edge function for notification
    if ((emailChanged || phoneChanged) && currentClient.auth_id) {
      console.log("Contact info changed, calling notification edge function...");
      
      // Get current session
      const { data: sessionData } = await db.auth.getSession();
      
      if (!sessionData?.session?.access_token) {
        throw new Error("No active session found");
      }

      // Prepare payload
      const payload = { clientUid: clientId };
      if (emailChanged) payload.newEmail = updateEmail;
      if (phoneChanged) payload.newPhone = updatePhoneNum;

      // Call edge function
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-update-client-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`,
            "apikey": SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      
      if (!result.ok) {
        console.error("Edge function error:", result.error);
        
        // Handle specific errors
        if (result.error === "email_in_use") {
          throw new Error("EMAIL_IN_USE");
        } else if (result.error === "phone_in_use") {
          throw new Error("PHONE_IN_USE");
        } else if (result.error === "invalid_email") {
          throw new Error("INVALID_EMAIL");
        } else if (result.error === "not_authenticated") {
          throw new Error("NOT_AUTHENTICATED");
        } else {
          throw new Error(result.error || "Failed to update contact information");
        }
      }

      console.log("Contact info and notifications sent successfully");
    }

    // Update all other fields in clients_Table
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
        zip_code: updateZipCode
      })
      .eq("uid", clientId);

    if (error) {
      console.error("Error updating client:", error.message);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("editClient error:", error);
    throw error;
  }
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