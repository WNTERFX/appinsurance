import { db } from "../../dbServer";

export async function getCurrentLoggedIn() {
  
  const {
    data: { user },
    error: userError,
  } = await db.auth.getUser();

  if (userError || !user) {
    throw userError || new Error("No logged-in user");
  }

  const { data: profile, error: profileError } = await db
    .from("employee_Accounts")
    .select("personnel_Name") 
    .eq("id", user.id) 
    .single();

  if (profileError) {
    throw profileError;
  }

  return { user, profile };
}