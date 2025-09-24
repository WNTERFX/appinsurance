import { db } from "../../dbServer";

/**
 * Archive a client (Moderator/Agent level)
 * Just updates the is_archived + archival_date in clients_Table
 */
export async function archiveModeratorClient(clientUid) {
  try {
    const { data, error } = await db
      .from("clients_Table")
      .update({
        is_archived: true,
        archival_date: new Date().toISOString(),
      })
      .eq("uid", clientUid)
      .select();

    if (error) {
      console.error("Error archiving client:", error.message);
      throw error;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error("Unexpected error archiving client:", err.message);
    throw err;
  }
}

/**
 * Fetch archived clients for a specific moderator/agent
 */
export async function fetchModeratorArchivedClients() {
  const { data: { user }, error: userError } = await db.auth.getUser();
  if (userError || !user) {
    console.error("Moderator not logged in");
    return [];
  }

  const { data, error } = await db
    .from("clients_Table")
    .select(`
      *,
      employee:employee_Accounts(personnel_Name)
    `)
    .eq("is_archived", true)
    .not("archival_date", "is", null)
    .eq("agent_Id", user.id)  // ✅ filter by logged-in moderator
    .order("archival_date", { ascending: false });

  if (error) {
    console.error("Error fetching moderator archived clients:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Fetch ALL archived clients (Admin view)
 */
export async function fetchAllArchivedClients() {
  try {
    const { data, error } = await db
      .from("clients_Table")
      .select(`
        *,
        employee:employee_Accounts(personnel_Name)
      `)
      .eq("is_archived", true)
      .not("archival_date", "is", null)
      .order("archival_date", { ascending: false });

    if (error) {
      console.error("Error fetching all archived clients:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error:", err.message);
    return [];
  }
}

/**
 * Unarchive client (restore)
 */
export async function unarchiveModeratorClient(clientUid) {
  try {
    const { data, error } = await db
      .from("clients_Table")
      .update({
        is_archived: false,
        archival_date: null,
      })
      .eq("uid", clientUid)
      .select();

    if (error) {
      console.error("Error unarchiving client:", error.message);
      throw error;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error("Unexpected error unarchiving client:", err.message);
    throw err;
  }
}

/**
 * Permanently delete a client (Moderator/Agent level)
 */
export async function deleteModeratorClient(clientUid) {
  try {
    const { error } = await db
      .from("clients_Table")
      .delete()
      .eq("uid", clientUid);

    if (error) {
      console.error("Error deleting client:", error.message);
      throw error;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error deleting client:", err.message);
    throw err;
  }
}
