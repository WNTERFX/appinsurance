import { db } from "../../dbServer";

/**
 * Fetch all archived claims (is_archived = true) with policy holder info
 */
export async function fetchArchivedClaims(page = 1, limit = 10) {
  try {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Get total count for pagination
    const { count, error: countError } = await db
      .from("claims_Table")
      .select("*", { count: "exact", head: true })
      .eq("is_archived", true);

    if (countError) throw countError;

    // Fetch paginated claims with policy and client info
    const { data: claims, error: claimsError } = await db
      .from("claims_Table")
      .select(`
        *,
        policy_Table!inner (
          id,
          internal_id,
          policy_type,
          policy_inception,
          policy_expiry,
          policy_status,
          clients_Table!inner (
            uid,
            prefix,
            first_Name,
            middle_Name,
            family_Name,
            suffix,
            internal_id,
            email,
            phone_Number
          )
        )
      `)
      .eq("is_archived", true)
      .order("archived_date", { ascending: false })
      .range(start, end);

    if (claimsError) {
      console.error("Error fetching archived claims:", claimsError);
      throw claimsError;
    }

    // Format claims with policy holder name
    const claimsWithPolicyHolder = claims.map((claim) => {
      const policy = claim.policy_Table;
      const client = policy?.clients_Table;
      
      let policyHolderName = "Unknown";
      if (client) {
        policyHolderName = [
          client.prefix,
          client.first_Name,
          client.middle_Name ? client.middle_Name.charAt(0) + "." : "",
          client.family_Name,
          client.suffix,
        ]
          .filter(Boolean)
          .join(" ");
      }

      return {
        ...claim,
        policy_internal_id: policy?.internal_id || "N/A",
        policy_holder_name: policyHolderName,
        policy_type: policy?.policy_type || "N/A",
        client_email: client?.email || "",
        client_phone: client?.phone_Number || "",
      };
    });

    console.log(`Fetched ${claimsWithPolicyHolder.length} archived claims for page ${page}`);
    return { claims: claimsWithPolicyHolder, totalCount: count };
  } catch (err) {
    console.error("Error fetching archived claims:", err.message);
    throw err;
  }
}

/**
 * Unarchive claim - restore it to active status
 */
export async function unarchiveClaim(claimId) {
  try {
    console.log(`Unarchiving claim ${claimId}...`);
    
    const { data, error } = await db
      .from("claims_Table")
      .update({ 
        is_archived: false, 
        archived_date: null 
      })
      .eq("id", claimId)
      .select();

    if (error) {
      console.error("Error unarchiving claim:", error.message);
      throw error;
    }

    console.log(`Claim ${claimId} unarchived successfully:`, data);
    return true;
  } catch (err) {
    console.error("Error in unarchiveClaim:", err.message);
    throw err;
  }
}

/**
 * Filter archived claims by search term
 */
export function filterArchivedClaims(claims, _unusedPolicies, searchTerm) {
  // 🔒 Ensure searchTerm is always a lowercase string
  const term = (searchTerm ?? "").toString().trim().toLowerCase();

  if (!term) return claims;

  return claims.filter((claim) => {
    const claimId = claim.id?.toString() || "";
    const internalId = claim.policy_internal_id?.toLowerCase() || "";
    const type = claim.type_of_incident?.toLowerCase() || "";
    const status = claim.status?.toLowerCase() || "";
    const holderName = claim.policy_holder_name?.toLowerCase() || "";
    const policyType = claim.policy_type?.toLowerCase() || "";

    return (
      claimId.includes(term) ||
      internalId.includes(term) ||
      type.includes(term) ||
      status.includes(term) ||
      holderName.includes(term) ||
      policyType.includes(term)
    );
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
  if (!amount) return "₱0.00";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}