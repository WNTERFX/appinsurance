import { db } from "../../dbServer";

/**
 * Create a new account
 */
export async function createAccount({ firstName, middleName, lastName, email, password, isAdmin = false, status = "active" }) {
  try {
    const { data: { session } } = await db.auth.getSession();
    
    const response = await fetch(
      "https://ezmvecxqcjnrspmjfgkk.functions.supabase.co/create-employee",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ firstName, middleName, lastName, email, password, isAdmin, status }),
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
    await db.auth.admin.deleteUser(id);
    await db.from("employee_Accounts").delete().eq("id", id);
    return { success: true };
  } catch (err) {
    console.error("Error deleting account:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Edit/update an account by ID using Supabase Edge Function
 */
export async function editAccount(
  id,
  { firstName, middleName, lastName, email, password, isAdmin, accountStatus, emailLocked, passwordLocked }
) {
  try {
    console.log("🟢 editAccount called with:", {
      id,
      firstName,
      middleName,
      lastName,
      email,
      isAdmin,
      accountStatus,
      emailLocked,
      passwordLocked,
    });

    // 1️⃣ Fetch existing record
    const { data: existing, error: fetchError } = await db
      .from("employee_Accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error("Fetch failed: " + fetchError.message);
    if (!existing) throw new Error("Account not found for ID: " + id);

    console.log("📦 Existing record:", existing);

    // 2️⃣ Build name safely
    const personnel_Name = [firstName, middleName, lastName].filter(Boolean).join(" ");

    // 3️⃣ Build payload
    const updatePayload = {
      personnel_Name: personnel_Name || existing.personnel_Name,
      first_name: firstName ?? existing.first_name,
      middle_name: middleName ?? existing.middle_name,
      last_name: lastName ?? existing.last_name,
      employee_email: emailLocked ? existing.employee_email : email ?? existing.employee_email,
      is_Admin: typeof isAdmin === "boolean" ? isAdmin : existing.is_Admin,
      status_Account:
        typeof accountStatus === "boolean"
          ? accountStatus
          : accountStatus === "active"
          ? true
          : existing.status_Account,
    };

    console.log("🟢 Update payload:", updatePayload);

    // 4️⃣ Force Supabase to update even if same data
    const { data: updated, error: updateError, status } = await db
      .from("employee_Accounts")
      .update(updatePayload)
      .eq("id", id)
      .select();

    console.log("🟣 Update response status:", status);
    console.log("🟣 Update response:", updated);

    if (updateError) throw new Error("Update error: " + updateError.message);
    if (!updated || !updated.length) throw new Error("No rows updated for ID: " + id);

    console.log("✅ Updated successfully:", updated[0]);

    // 5️⃣ Call edge function if email/password unlocked
    if (!emailLocked || !passwordLocked) {
      const { data: { session } } = await db.auth.getSession();

      const response = await fetch(
        "https://ezmvecxqcjnrspmjfgkk.functions.supabase.co/pass-admin-reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
          },
          body: JSON.stringify({
            id,
            email: emailLocked ? undefined : email,
            password: passwordLocked ? undefined : password,
          }),
        }
      );

      const resText = await response.text();
      console.log("🔹 Edge function response:", resText);
    }

    return { success: true };
  } catch (err) {
    console.error("❌ Edit account failed:", err);
    return { success: false, error: err.message };
  }
}
