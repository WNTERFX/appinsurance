import { db } from "../../dbServer";

/**
 * Create a new account
 */
export async function createAccount({ firstName, middleName, lastName, email, password, isAdmin = false, accountStatus = "active", roleId = null }) {
  try {
    const { data: { session } } = await db.auth.getSession();
    
    // NOTE: Assuming 'create-employee' Edge Function handles user creation AND employee_Accounts table insertion.
    const response = await fetch(
      "https://ezmvecxqcjnrspmjfgkk.functions.supabase.co/create-employee",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          firstName, 
          middleName, 
          lastName, 
          email, 
          password, 
          isAdmin, 
          status: accountStatus,
          roleId // ✅ Added roleId
        }),
      }
    );

    const result = await response.json();
    return result;
  } catch (err) {
    console.error("Error creating account:", err);
    return { success: false, error: err.message };
  }
}


/**
 * Fetch all accounts
 */
export async function fetchAccounts() {
  try {
    // Correct table based on user's schema
    const { data, error } = await db.from("employee_Accounts").select("*");
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching accounts:", err);
    return [];
  }
}

/**
 * Delete an account by ID
 */
export async function deleteAccount(id) {
  try {
    // The foreign key constraint on employee_Accounts (ON DELETE CASCADE)
    // means deleting from auth.users also deletes the employee record.
    await db.auth.admin.deleteUser(id); 
    // The explicit employee_Accounts delete is redundant if CASCADE is set, 
    // but kept here for robustness in case RLS interferes or CASCADE is missing.
    // await db.from("employee_Accounts").delete().eq("id", id); 
    return { success: true };
  } catch (err) {
    console.error("Error deleting account:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Edit/update an account by ID using Supabase Edge Function
 * This function now sends ALL profile data to the Edge Function for server-side processing.
 */
export async function editAccount(
  id,
  { firstName, middleName, lastName, email, password, isAdmin, accountStatus, emailLocked, passwordLocked, roleId, phoneNumber, employeeEmail, employeeRole }
) {
  try {
    console.log("🟢 editAccount called with:", {
      id,
      firstName,
      lastName,
      email,
      isAdmin,
      accountStatus,
      roleId,
      emailLocked, 
      passwordLocked,
    });

    // 1️⃣ Get session to authorize the Edge Function call
    const { data: { session } } = await db.auth.getSession();
    
    // 2️⃣ Prepare the data payload for the Edge Function
    const updatePayload = {
      id,
      // Employee Profile Fields
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      employee_email: email, // Always send the email field value from the form
      // status_Account field conversion to boolean for the database
      status_Account: accountStatus === 'active', 
      is_Admin: isAdmin,
      role_id: roleId || null,
      
      // Auth Fields (only sent if unlocked)
      email_auth: emailLocked ? undefined : email,
      password_auth: passwordLocked ? undefined : password,
    };
    
    // 3️⃣ Call the Edge Function
    const response = await fetch(
      "https://ezmvecxqcjnrspmjfgkk.functions.supabase.co/pass-admin-reset",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Send Authorization header if session token is available
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }), 
        },
        body: JSON.stringify(updatePayload),
      }
    );

    const resText = await response.text();
    let result;
    try {
        result = JSON.parse(resText);
    } catch {
        console.error("❌ Edge function returned non-JSON response:", resText);
        throw new Error("Server error occurred during account update.");
    }

    if (!response.ok || result.error) {
        console.error("❌ Edge function error:", result.error);
        throw new Error(`Update failed: ${result.error || response.statusText}`);
    }

    console.log("✅ Edge function response:", result);

    return { success: true };
  } catch (err) {
    console.error("❌ Edit account failed:", err);
    return { success: false, error: err.message };
  }
}