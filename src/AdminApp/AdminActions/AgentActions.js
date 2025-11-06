import { db } from "../../dbServer";

const agentColors = [
  "#7B5F97", // Purple
  "#5D8AA8", // Light Blue
  "#8FBC8F", // Dark Sea Green
  "#CD5C5C", // Indian Red
  "#DAA520", // Goldenrod
  "#6A5ACD", // Slate Blue
  "#FF6347", // Tomato
  "#3CB371", // Medium Sea Green
  "#FFD700", // Gold
  "#4682B4", // Steel Blue
];

  export async function getAllAgentsWithAssignedColors() {
    try {
      const { data: agents, error } = await db
        .from("employee_Accounts")
        .select("id, first_name, last_name, is_Admin"); // include is_Admin

      if (error) {
        console.error("Error fetching agents:", error.message);
        return [];
      }

      if (!agents || !Array.isArray(agents)) {
        return [];
      }

      const agentsWithColors = agents.map((agent, index) => ({
        ...agent,
        borderColor: agentColors[index % agentColors.length],
        role: agent.is_Admin ? "Admin" : "Sales Agent", 
      }));

      return agentsWithColors;
    } catch (err) {
      console.error("Unexpected error fetching agents:", err);
      return [];
    }
  }

// Modified getClientCountByAgent to handle null agentId for total count
export async function getClientCountByAgent(agentId = null) { // Accept null
  try {
    let query = db
      .from("clients_Table")
      .select("uid", { count: "exact" }); // Count 'uid' column

    // Only apply agent_Id filter if agentId is explicitly provided (not null)
    if (agentId) {
      query = query.eq("agent_Id", agentId); 
    }

    // Always filter for non-archived clients
    query = query.or("is_archived.is.null,is_archived.eq.false");

    const { count, error } = await query;

    if (error) {
      console.error(`Error fetching client count for agent ${agentId}:`, error.message);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.error(`Unexpected error fetching client count for agent ${agentId}:`, err);
    return 0;
  }
}