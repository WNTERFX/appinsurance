import { db } from "../../dbServer";

/**
 * ORIGINAL FUNCTIONS
 */

export const fetchClaims = async () => {
  console.log("Fetching claims from Supabase...");

  const { data, error } = await db
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
          internal_id
        ),
        insurance_Partners (
          id,
          insurance_Name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching claims:", error);
    throw new Error(`Failed to fetch claims: ${error.message}`);
  }

  console.log("Claims fetched from Supabase:", data);
  return data;
};

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
  return data;
};

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

export async function updateClaim(claimId, updatedData) {
  try {
    console.log(`Updating claim ${claimId}...`);

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
    return data[0];
  } catch (err) {
    console.error(`updateClaim error:`, err.message);
    throw err;
  }
}

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