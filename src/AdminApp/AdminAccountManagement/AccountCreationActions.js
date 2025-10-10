import { db } from "../../dbServer";

/**
 * Create a new account
 */
export async function createAccount({ firstName, middleName, lastName, email, password, isAdmin = false, status = "active" }) {
  try {
    const personnel_Name = [firstName, middleName, lastName].filter(Boolean).join(" ");

    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: personnel_Name },
    });

    if (authError) throw authError;
    const accountId = authData.user.id;

    await db.from("employee_Accounts").insert([
      {
        id: accountId,
        personnel_Name,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        employee_email: email,
        creation_Date: new Date().toISOString().split("T")[0],
        status_Account: status === "active",  // <-- convert string to boolean
        is_Admin: isAdmin,
      },
    ]);

    return { success: true, id: accountId };
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
export async function editAccount(id, { firstName, middleName, lastName, email, password, isAdmin, accountStatus }) {
  try {
    const personnel_Name = [firstName, middleName, lastName].filter(Boolean).join(" ");

    const { data: sessionData, error: sessionError } = await db.auth.getSession();
    if (sessionError) throw sessionError;
    const accessToken = sessionData?.session?.access_token;

    const { error: updateError } = await db
      .from("employee_Accounts")
      .update({
        personnel_Name,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        employee_email: email,
        is_Admin: isAdmin,
        status_Account: accountStatus === "active", // <-- convert string to boolean
      })
      .eq("id", id);

    if (updateError) throw updateError;

    if (email || password) {
      const res = await fetch("https://ezmvecxqcjnrspmjfgkk.functions.supabase.co/pass-admin-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ id, email, password }),
      });

      const text = await res.text();
      let result;
      try { result = JSON.parse(text); } catch { throw new Error(`Invalid JSON response: ${text}`); }

      if (!res.ok) throw new Error(result.error || "Failed to update user in Supabase Auth");
    }

    return { success: true };
  } catch (err) {
    console.error("Error editing account:", err);
    return { success: false, error: err?.message ?? String(err) };
  }
}



