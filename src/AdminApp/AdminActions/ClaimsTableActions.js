import { db } from "../../dbServer";

import { recalculateClaimableAmount } from "./ClaimableAmountActions";

/**
 * Fetch all claims with policy and client information
 */
/**
 * Fetch all claims with policy and client information
 */
export const fetchClaims = async (onlyArchived = false) => {
  console.log("Fetching claims from Supabase...");

  // Step 1: Fetch claims with filter applied at database level
  let query = db
    .from('claims_Table')
    .select(`
      *,
      policy_Table (
        id,
        internal_id,
        policy_type,
        policy_inception,
        policy_expiry,
        client_id,
        partner_id,
        clients_Table (
          uid,
          first_Name,
          middle_Name,
          family_Name,
          prefix,
          suffix,
          phone_Number,
          internal_id
        ),
        insurance_Partners (
          id,
          insurance_Name
        )
      )
    `)
    .order('created_at', { ascending: false });

  // ✅ Filter by archived status at database level
  if (onlyArchived) {
    query = query.eq('is_archived', true);
  } else {
    query = query.eq('is_archived', false); // Only fetch non-archived claims by default
  }

  const { data: claims, error: claimsError } = await query;

  if (claimsError) throw claimsError;

  // Step 2: Fetch computation data separately
  const { data: computations, error: compError } = await db
    .from('policy_Computation_Table')
    .select('policy_id, policy_claim_amount');

  if (compError) throw compError;

  // Step 3: Merge claim + computation by policy_id
  const computationsMap = Object.fromEntries(
    computations.map(c => [c.policy_id, c])
  );

  const enrichedClaims = claims.map(c => ({
    ...c,
    policy_Table: {
      ...c.policy_Table,
      policy_Computation_Table: computationsMap[c.policy_id] || null,
    },
  }));

  console.log(
    onlyArchived
      ? "Archived claims fetched and enriched:"
      : "Non-archived claims fetched and enriched:",
    enrichedClaims
  );

  return enrichedClaims;
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
      // Don't throw error - claim approval was successful
    } else {
      console.log(`✅ Claimable amount updated to ₱${newClaimableAmount}`);
    }
  } catch (recalcError) {
    console.error("⚠️ Warning: Error recalculating claimable amount:", recalcError);
    // Don't throw error - claim approval was successful
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
 * If the claim is being approved and has an approved_amount, update the claimable amount
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
    // Check if status changed to Approved or approved_amount changed
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
          // Don't throw error - claim update was successful
        }
      } catch (recalcError) {
        console.error("⚠️ Warning: Error recalculating claimable amount:", recalcError);
        // Don't throw error - claim update was successful
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
 * Archive a claim by moving it to the archive table or flagging as archived
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
