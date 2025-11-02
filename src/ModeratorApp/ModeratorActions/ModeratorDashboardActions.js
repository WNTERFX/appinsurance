// src/ModeratorApp/ModeratorActions/ModeratorDashboardActions.js

import { db } from "../../dbServer";

// Function to get the total count of clients associated with a specific agent_Id
export async function getModeratorClientCount(agentId) {
  if (!agentId) return 0;
  try {
    const { count, error } = await db
      .from("clients_Table")
      .select("uid", { count: "exact", head: true })
      .eq("agent_Id", agentId)
      .or("is_archived.is.null,is_archived.eq.false"); // Only non-archived clients

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error("Error counting moderator clients:", err.message);
    return 0;
  }
}

// Function to get the total count of all policies associated with a specific agent_Id
// This counts ALL policies, not just active ones, and filters by agent_Id
export async function getModeratorTotalPolicyCount(agentId) {
  if (!agentId) return 0;
  try {
    const { count, error } = await db
      .from("policy_Table")
      .select(`
        id,
        clients_Table!inner(
          agent_Id
        )
      `, { count: "exact", head: true })
      .eq("clients_Table.agent_Id", agentId)
      .or("is_archived.is.null,is_archived.eq.false"); // Only non-archived policies

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error("Error counting moderator total policies:", err.message);
    return 0;
  }
}

// Function to get the total count of all deliveries associated with a specific agent_Id
// This counts ALL deliveries, regardless of delivered_at status, and filters by agent_Id
export async function getModeratorTotalDeliveryCount(agentId) {
  if (!agentId) return 0;
  try {
    const { count, error } = await db
      .from("delivery_Table")
      .select(`
        id,
        policy:policy_Table!inner(
          clients_Table!inner(
            agent_Id
          )
        )
      `, { count: "exact", head: true })
      .eq("policy.clients_Table.agent_Id", agentId)
      .or("is_archived.is.null,is_archived.eq.false"); // Only non-archived deliveries

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error("Error counting moderator total deliveries:", err.message);
    return 0;
  }
}


