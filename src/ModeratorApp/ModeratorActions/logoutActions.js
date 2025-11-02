import { db } from "../../dbServer";
export const logoutUser = async () => {
  const { error } = await db.auth.signOut();
  return error; // returns null if successful
};