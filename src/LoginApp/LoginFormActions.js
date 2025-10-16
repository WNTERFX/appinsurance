import { db } from "../dbServer";

export async function loginFunction(email, password) {
  // Step 1: Authenticate user via Supabase
  const { data: authData, error: authError } = await db.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) return { success: false, error: authError.message };

  const userId = authData.user?.id;
  const sessionToken = authData.session?.access_token;

  if (!userId || !sessionToken) {
    return { success: false, error: "Authentication failed" };
  }

  // Step 2: Fetch and update account info
  const { data: accountData, error: accountError } = await db
    .from("employee_Accounts")
    .update({ current_session_token: sessionToken })
    .eq("id", userId)
    .select("is_Admin, status_Account, first_name, last_name, employee_email")
    .single();

  if (accountError) return { success: false, error: accountError.message };

  if (!accountData.status_Account) {
    return {
      success: false,
      error: "Invalid account. Please contact the administrator.",
    };
  }

  // ✅ Step 3: Store user info in localStorage
  const userData = {
    id: userId,
    email: accountData.employee_email,
    first_name: accountData.first_name,
    last_name: accountData.last_name,
    is_Admin: accountData.is_Admin,
    access_token: sessionToken,
  };

  localStorage.setItem("currentUser", JSON.stringify(userData));

  // Step 4: Return success
  return {
    success: true,
    ...userData,
  };
}
