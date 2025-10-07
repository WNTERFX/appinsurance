import { db } from "../dbServer";

export async function loginFunction(email, password) {
  // Step 1: Authenticate user via Supabase
  const { data: authData, error: authError } = await db.auth.signInWithPassword({ email, password });
  if (authError) return { success: false, error: authError.message };

  const userId = authData.user?.id;
  if (!userId) return { success: false, error: "User ID not found" };

  // Step 2: Generate a new session token
  const newToken = crypto.randomUUID();

  // Step 3: Update DB first
  const { data: accountData, error: accountError } = await db
    .from("employee_Accounts")
    .update({ current_session_token: newToken })
    .eq("id", userId)
    .select("is_Admin, current_session_token")
    .single();

  if (accountError) return { success: false, error: accountError.message };

  // Step 4: Return token and role
  return {
    success: true,
    userId,
    accessToken: accountData.current_session_token,
    isAdmin: accountData.is_Admin || false,
  };
}
