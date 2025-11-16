import { db } from "../../dbServer";
import { recalculateClaimableAmount } from "./ClaimableAmountActions";

/**
 * Get current user and check if they are admin or moderator
 */
async function getCurrentUserRole() {
  try {
    const { data: { user }, error } = await db.auth.getUser();
    
    if (error || !user) {
      console.error("Error getting current user:", error);
      return { isAdmin: false, isModerator: false, userId: null };
    }

    // Check if user is an employee (moderator or admin)
    const { data: employee, error: empError } = await db
      .from("employee_Accounts")
      .select("id, is_Admin")
      .eq("id", user.id)
      .maybeSingle();

    if (empError) {
      console.error("Error checking employee status:", empError);
      return { isAdmin: false, isModerator: false, userId: user.id };
    }

    if (!employee) {
      return { isAdmin: false, isModerator: false, userId: user.id };
    }

    return {
      isAdmin: employee.is_Admin === true,
      isModerator: !employee.is_Admin, // If not admin, then moderator
      userId: employee.id
    };
  } catch (err) {
    console.error("getCurrentUserRole error:", err);
    return { isAdmin: false, isModerator: false, userId: null };
  }
}



export const fetchClaims = async (from = null, to = null, onlyArchived = false, agentId = null) => {
  console.log("Fetching claims from Supabase...");

  try {
    const { isAdmin, isModerator, userId } = await getCurrentUserRole();
    console.log("User role:", { isAdmin, isModerator, userId, agentId });

    let clientUids = [];
    let effectiveAgentId = null;

    // --- Determine the effective agent ID for filtering ---
    if (agentId) {
      // Priority 1: Use the explicit agentId provided by the UI filter
      effectiveAgentId = agentId;
      console.log(`Filtering by selected Agent ID: ${effectiveAgentId}`);
    } else if (isModerator && !isAdmin) {
      // Priority 2: If no agent is selected, but the user is a Moderator, restrict to their own clients
      effectiveAgentId = userId;
      console.log(`Restricting to current Moderator's clients: ${effectiveAgentId}`);
    } else if (isAdmin && !agentId) {
      // Admin viewing all claims (no agent filter needed)
      console.log("Admin viewing all claims.");
    }
    
    // --- If an agent filter is active, fetch the corresponding client IDs ---
    if (effectiveAgentId) {
      const { data: clients, error: clientsError } = await db
        .from("clients_Table")
        .select("uid")
        .eq("agent_Id", effectiveAgentId);

      if (clientsError) {
        console.error("Error fetching agent's clients:", clientsError);
        throw clientsError;
      }

      if (!clients || clients.length === 0) {
        console.log(`🔒 No clients found for agent ${effectiveAgentId}. Returning empty.`);
        return [];
      }

      clientUids = clients.map(c => c.uid);
      console.log(`Filtering claims for ${clientUids.length} clients assigned to agent ${effectiveAgentId}`);
    }

    // --- Query for Policies based on client access ---
    let policyQuery = db
      .from("policy_Table")
      .select("id, client_id, partner_id"); // Ensure partner_id is selected for enrichment

    if (clientUids.length > 0) {
      // If we are filtering by agent (either explicit or moderator self-filter)
      policyQuery = policyQuery.in("client_id", clientUids);
    }

    const { data: policies, error: policiesError } = await policyQuery;

    if (policiesError) {
      console.error("Error fetching policies:", policiesError);
      throw policiesError;
    }

    if (!policies || policies.length === 0) {
      console.log("No policies found matching the criteria.");
      return [];
    }

    const policyIds = policies.map(p => p.id);
    const policyMap = new Map(policies.map(p => [p.id, p]));
    console.log(`Found ${policyIds.length} policies.`);

    // --- Query for Claims based on policy access and date range ---
    let claimsQuery = db
      .from("claims_Table")
      .select("*")
      .in("policy_id", policyIds);

    if (onlyArchived) {
      claimsQuery = claimsQuery.eq("is_archived", true);
    } else {
      claimsQuery = claimsQuery.eq("is_archived", false);
    }

    if (from && to) {
      claimsQuery = claimsQuery.gte("created_at", `${from}T00:00:00.000Z`);
      claimsQuery = claimsQuery.lte("created_at", `${to}T23:59:59.999Z`);
      console.log(`Filtering claims from ${from} to ${to}`);
    }

    claimsQuery = claimsQuery.order("created_at", { ascending: false });

    const { data: claims, error: claimsError } = await claimsQuery;

    if (claimsError) {
      console.error("Error fetching claims:", claimsError);
      throw claimsError;
    }

    console.log(`Found ${claims?.length || 0} claims.`);

    // --- Enrich Claims with Policy, Client, and Partner Data ---
    const clientIds = [...new Set(policies.map(p => p.client_id))].filter(Boolean);
    const partnerIds = [...new Set(policies.map(p => p.partner_id))].filter(Boolean);

    const [{ data: allClients }, { data: allPartners }] = await Promise.all([
      db.from("clients_Table").select("uid, first_Name, family_Name, internal_id").in("uid", clientIds),
      db.from("insurance_Partners").select("id, insurance_Name").in("id", partnerIds),
    ]);
    
    const clientMap = new Map((allClients || []).map(c => [c.uid, c]));
    const partnerMap = new Map((allPartners || []).map(p => [p.id, p]));

    const enrichedClaims = await Promise.all(
      (claims || []).map(async (claim) => {
        const policyData = policyMap.get(claim.policy_id);
        const clientData = policyData?.client_id ? clientMap.get(policyData.client_id) : null;
        const partnerData = policyData?.partner_id ? partnerMap.get(policyData.partner_id) : null;

        // Fetch computation data separately, as it's policy-specific and single
        let computationData = null;
        if (claim.policy_id) {
          const { data: computation } = await db
            .from("policy_Computation_Table")
            .select("policy_claim_amount")
            .eq("policy_id", claim.policy_id)
            .single();
          computationData = computation;
        }

        return {
          ...claim,
          policy_Table: {
            ...policyData,
            clients_Table: clientData,
            insurance_Partners: partnerData,
            policy_Computation_Table: computationData
          }
        };
      })
    );

    console.log("Claims fetched and enriched:", enrichedClaims.length);
    return enrichedClaims;
  } catch (err) {
    console.error("fetchClaims error:", err);
    return [];
  }
};


/**
 * Update claim status to Under Review
 */
export const updateClaimToUnderReview = async (policyId) => {
  console.log(`Setting claims for policy ${policyId} to Under Review...`);

  const updateData = {
    status: 'Under Review',
    under_review_date: new Date().toISOString().split('T')[0],
  };

  const { data, error } = await db
    .from('claims_Table')
    .update(updateData)
    .eq('policy_id', policyId)
    .select();

  if (error) {
    console.error(`Error updating claims for policy ${policyId}:`, error);
    throw new Error(`Failed to update claims status: ${error.message}`);
  }

  console.log(`Claims for policy ${policyId} set to Under Review:`, data);
  return data;
};

/**
 * Update claim status to Rejected
 */
export const updateClaimToRejected = async (policyId) => {
  console.log(`Rejecting claims for policy ${policyId}...`);

  const updateData = {
    status: 'Rejected',
    reject_claim_date: new Date().toISOString().split('T')[0],
    is_approved: false,
  };

  const { data, error } = await db
    .from('claims_Table')
    .update(updateData)
    .eq('policy_id', policyId)
    .select();

  if (error) {
    console.error(`Error rejecting claims for policy ${policyId}:`, error);
    throw new Error(`Failed to reject claims: ${error.message}`);
  }

  console.log(`Claims for policy ${policyId} rejected:`, data);
  return data;
};

/**
 * Update claim status to Approved and recalculate claimable amount
 */
export const updateClaimToApproved = async (policyId, approvedAmount = null) => {
  console.log(`Approving claims for policy ${policyId}...`);

  const updateData = {
    status: 'Approved',
    approved_claim_date: new Date().toISOString().split('T')[0],
    is_approved: true,
  };

  if (approvedAmount !== null) {
    updateData.approved_amount = parseFloat(approvedAmount);
  }

  const { data, error } = await db
    .from('claims_Table')
    .update(updateData)
    .eq('policy_id', policyId)
    .select();

  if (error) {
    console.error(`Error approving claims for policy ${policyId}:`, error);
    throw new Error(`Failed to approve claims: ${error.message}`);
  }

  console.log(`Claims for policy ${policyId} approved:`, data);

  // 🔄 RECALCULATE CLAIMABLE AMOUNT AFTER APPROVAL
  try {
    const { success, error: recalcError, newClaimableAmount } = await recalculateClaimableAmount(policyId);
    
    if (!success) {
      console.error("⚠️ Warning: Failed to update claimable amount:", recalcError);
    } else {
      console.log(`✅ Claimable amount updated to ₱${newClaimableAmount}`);
    }
  } catch (recalcError) {
    console.error("⚠️ Warning: Error recalculating claimable amount:", recalcError);
  }

  return data;
};

/**
 * Update claim status to Completed
 */
export const updateClaimToCompleted = async (claimId) => {
  console.log(`Marking claim ${claimId} as completed...`);

  const updateData = {
    status: 'Completed',
    completed_date: new Date().toISOString().split('T')[0],
  };

  const { data, error } = await db
    .from('claims_Table')
    .update(updateData)
    .eq('id', claimId)
    .select();

  if (error) {
    console.error(`Error marking claim ${claimId} as completed:`, error);
    throw new Error(`Failed to mark claim as completed: ${error.message}`);
  }

  console.log(`Claim ${claimId} marked as completed:`, data);
  return data;
};

/**
 * Update claim status (deprecated - use specific functions instead)
 */
export const updateClaimStatus = async (policyId, newStatus) => {
  console.log(`[DEPRECATED] Use specific status update functions instead`);

  if (newStatus === 'Under Review') {
    return await updateClaimToUnderReview(policyId);
  } else if (newStatus === 'Rejected') {
    return await updateClaimToRejected(policyId);
  } else if (newStatus === 'Approved') {
    return await updateClaimToApproved(policyId);
  }

  throw new Error(`Invalid status: ${newStatus}`);
};

/**
 * Create a new claim
 */
export const createClaim = async (newClaimData) => {
  console.log("Creating new claim in Supabase:", newClaimData);

  const { data, error } = await db
    .from('claims_Table')
    .insert([{
      ...newClaimData,
      status: 'Pending',
    }])
    .select();

  if (error) {
    console.error("Error creating claim:", error);
    throw new Error(`Failed to create claim: ${error.message}`);
  }

  console.log("Claim created successfully:", data);
  return data[0];
};

/**
 * Get signed URLs for claim documents
 */
export async function getClaimDocumentUrls(documents) {
  if (!documents || documents.length === 0) return [];

  console.log('Attempting to get signed URLs for documents:', documents);

  const urlPromises = documents.map(async (doc) => {
    if (!doc || typeof doc.path !== 'string' || doc.path.trim() === '') {
      console.warn('Skipping document due to invalid path:', doc);
      return null;
    }

    const filePath = doc.path.trim();
    console.log(`Attempting to get signed URL for path: "${filePath}"`);

    try {
      const { data, error } = await db.storage
        .from('claim-documents')
        .createSignedUrl(filePath, 3600);

      if (error) {
        console.error(`❌ Failed to get signed URL for "${filePath}":`, error.message);
        console.error('Error details:', error);
        return null;
      }

      console.log(`✅ Successfully got signed URL for "${filePath}"`);
      return {
        ...doc,
        url: data.signedUrl
      };
    } catch (err) {
      console.error(`❌ Error getting signed URL for "${filePath}":`, err.message);
      console.error('Full error:', err);
      return null;
    }
  });

  const results = await Promise.all(urlPromises);
  const successfulResults = results.filter(r => r !== null);
  console.log(`Successfully retrieved ${successfulResults.length} document URLs out of ${documents.length}.`);
  return successfulResults;
}

/**
 * Update a single claim record
 */
export async function updateClaim(claimId, updatedData) {
  try {
    console.log(`Updating claim ${claimId}...`);

    // Get current claim data before update
    const { data: currentClaim, error: fetchError } = await db
      .from('claims_Table')
      .select('policy_id, status, approved_amount')
      .eq('id', claimId)
      .single();

    if (fetchError) {
      console.error(`Error fetching current claim ${claimId}:`, fetchError);
      throw new Error(`Failed to fetch current claim: ${fetchError.message}`);
    }

    // Update the claim
    const { data, error } = await db
      .from('claims_Table')
      .update(updatedData)
      .eq('id', claimId)
      .select();

    if (error) {
      console.error(`Error updating claim ${claimId}:`, error);
      throw new Error(`Failed to update claim: ${error.message}`);
    }

    console.log(`Claim ${claimId} updated successfully:`, data);

    // 🔄 RECALCULATE CLAIMABLE AMOUNT IF NEEDED
    const statusChanged = updatedData.status && updatedData.status !== currentClaim.status;
    const approvedAmountChanged = updatedData.approved_amount !== undefined && 
                                   updatedData.approved_amount !== currentClaim.approved_amount;

    if ((statusChanged && updatedData.status === "Approved") || 
        (currentClaim.status === "Approved" && approvedAmountChanged)) {
      
      console.log("🔄 Recalculating claimable amount due to approval or amount change");
      
      try {
        const { success, error: recalcError } = await recalculateClaimableAmount(currentClaim.policy_id);
        
        if (!success) {
          console.error("⚠️ Warning: Failed to update claimable amount:", recalcError);
        }
      } catch (recalcError) {
        console.error("⚠️ Warning: Error recalculating claimable amount:", recalcError);
      }
    }

    return data[0];
  } catch (err) {
    console.error(`updateClaim error:`, err.message);
    throw err;
  }
}

/**
 * Delete a claim document from storage
 */
export async function deleteClaimDocumentFromStorage(filePath) {
  try {
    if (!filePath || typeof filePath !== 'string' || filePath.trim() === '') {
      console.warn('Attempted to delete a document with an invalid or empty file path.');
      throw new Error('Invalid file path provided for deletion');
    }

    const pathToDelete = filePath.trim();
    console.log(`Attempting to delete file from storage: "${pathToDelete}"`);

    const { data, error } = await db.storage
      .from('claim-documents')
      .remove([pathToDelete]);

    if (error) {
      console.error(`Error deleting file "${pathToDelete}" from storage:`, error.message);
      throw new Error(`Failed to delete file from storage: ${error.message}`);
    }

    console.log(`File "${pathToDelete}" deleted from storage successfully.`, data);
    return true;
  } catch (err) {
    console.error(`deleteClaimDocumentFromStorage error:`, err.message);
    throw err;
  }
}

/**
 * Archive a claim
 */
export const archiveClaim = async (claimId) => {
  console.log(`Archiving claim ${claimId}...`);

  const updateData = {
    is_archived: true,
    archived_date: new Date().toISOString().split('T')[0],
  };

  const { data, error } = await db
    .from('claims_Table')
    .update(updateData)
    .eq('id', claimId)
    .select();

  if (error) {
    console.error(`Error archiving claim ${claimId}:`, error);
    throw new Error(`Failed to archive claim: ${error.message}`);
  }

  console.log(`Claim ${claimId} archived successfully:`, data);
  return data;
};