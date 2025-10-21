import { db } from "../../dbServer";

/**
 * Updates the claimable_amount in policy_Computation_Table
 * by subtracting the approved_amount from the current claimable_amount
 */
export async function updateClaimableAmount(policyId, approvedAmount) {
  try {
    console.log(`🔄 Updating claimable amount for policy ${policyId}`);
    console.log(`💰 Subtracting approved amount: ₱${approvedAmount}`);

    // Step 1: Get current computation data
    const { data: computation, error: fetchError } = await db
      .from("policy_Computation_Table")
      .select("policy_claim_amount, current_Value")
      .eq("policy_id", policyId)
      .single();

    if (fetchError) {
      console.error("❌ Error fetching computation:", fetchError);
      throw new Error(`Failed to fetch computation: ${fetchError.message}`);
    }

    if (!computation) {
      throw new Error("Computation record not found for this policy");
    }

    const currentClaimableAmount = computation.policy_claim_amount || computation.current_Value || 0;
    const newClaimableAmount = Math.max(0, currentClaimableAmount - approvedAmount);

    console.log(`📊 Current claimable amount: ₱${currentClaimableAmount}`);
    console.log(`📊 New claimable amount: ₱${newClaimableAmount}`);

    // Step 2: Update the claimable_amount
    const { error: updateError } = await db
      .from("policy_Computation_Table")
      .update({ policy_claim_amount: newClaimableAmount })
      .eq("policy_id", policyId);

    if (updateError) {
      console.error("❌ Error updating claimable amount:", updateError);
      throw new Error(`Failed to update claimable amount: ${updateError.message}`);
    }

    console.log(`✅ Successfully updated claimable amount to ₱${newClaimableAmount}`);

    return { success: true, newClaimableAmount };
  } catch (error) {
    console.error("❌ updateClaimableAmount error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Recalculates and updates the claimable_amount based on all approved claims for a policy
 * This is useful when you need to recalculate from scratch
 */
export async function recalculateClaimableAmount(policyId) {
  try {
    console.log(`🔄 Recalculating claimable amount for policy ${policyId}`);

    // Step 1: Get the current vehicle value from computation
    // FIXED: Select current_Value instead of policy_claim_amount
    const { data: computation, error: fetchError } = await db
      .from("policy_Computation_Table")
      .select("current_Value")
      .eq("policy_id", policyId)
      .single();

    if (fetchError) throw new Error(`Failed to fetch computation: ${fetchError.message}`);
    if (!computation) throw new Error("Computation record not found");

    const currentValue = computation.current_Value || 0;

    // Step 2: Get all approved claims for this policy
    const { data: claims, error: claimsError } = await db
      .from("claims_Table")
      .select("approved_amount")
      .eq("policy_id", policyId)
      .eq("status", "Approved");

    if (claimsError) throw new Error(`Failed to fetch claims: ${claimsError.message}`);

    // Step 3: Calculate total approved amounts
    // FIXED: Use approved_amount instead of policy_claim_amount
    const totalApprovedAmount = (claims || []).reduce((sum, claim) => {
      return sum + (parseFloat(claim.approved_amount) || 0);
    }, 0);

    // Step 4: Calculate new claimable amount
    const newClaimableAmount = Math.max(0, currentValue - totalApprovedAmount);

    console.log(`📊 Current Value: ₱${currentValue}`);
    console.log(`📊 Total Approved Claims: ₱${totalApprovedAmount}`);
    console.log(`📊 New Claimable Amount: ₱${newClaimableAmount}`);

    // Step 5: Update the claimable_amount
    const { error: updateError } = await db
      .from("policy_Computation_Table")
      .update({ policy_claim_amount: newClaimableAmount })
      .eq("policy_id", policyId);

    if (updateError) throw new Error(`Failed to update claimable amount: ${updateError.message}`);

    console.log(`✅ Successfully recalculated claimable amount to ₱${newClaimableAmount}`);

    return { success: true, newClaimableAmount, totalApprovedAmount };
  } catch (error) {
    console.error("❌ recalculateClaimableAmount error:", error);
    return { success: false, error: error.message };
  }
}