import { db } from "../dbServer";

export async function loginFunction(email, password) {

  const { data: authData, error: authError } = await db.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { success: false, error: "No user ID found after login." };
  }


  const { data: accountData, error: accountError } = await db
    .from("privilages_Table")
    .select("is_Admin")
    .eq("id", userId)
    .single();

  if (accountError) {
    return { success: false, error: accountError.message };
  }

  return { success: true, isAdmin: accountData?.is_Admin || false };
}