import { db } from "../../dbServer";
export async function getCurrentUser() {
  const { data, error } = await db.auth.getUser();

  if (error) {
    console.error("Error getting logged in user:", error.message);
    return null;
  }

  return data.user; 
}