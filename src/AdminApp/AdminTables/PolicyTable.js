import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ClientInfo from "../ClientInfo";
import "../styles/policy-table-styles.css";
import {
  fetchPolicies,
  archivePolicy,
  fetchPartners
} from "../AdminActions/PolicyActions";
import { ActivatePolicyAndPayment, CancelPolicyAndRefund  } from "../AdminActions/PolicyActivationActions";

export default function PolicyTable() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [partnerFilter, setPartnerFilter] = useState("");
  const [partners, setPartners] = useState([]);
  const navigate = useNavigate();

  // Helper function to check if policy is expired
  const isPolicyExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return expiry < today;
  };

  // Helper function to get policy status
  const getPolicyStatus = (policy) => {
    if (policy.policy_status === 'voided') {
      return { text: "Voided", class: "policy-status-voided" };
    }
    if (policy.policy_status === 'cancelled') {
      return { text: "Cancelled", class: "policy-status-cancelled" };
    }
    if (isPolicyExpired(policy.policy_expiry)) {
      return { text: "Expired", class: "policy-status-expired" };
    }
    if (policy.policy_is_active) {
      return { text: "Active", class: "policy-status-active" };
    }
    return { text: "Inactive", class: "policy-status-inactive" };
  };

  const loadPolicies = async () => {
    try {
      const data = await fetchPolicies();
      // Auto-deactivate expired policies
      const updatedData = await Promise.all(
        data.map(async (policy) => {
          if (policy.policy_is_active && isPolicyExpired(policy.policy_expiry)) {
            try {
              await deactivateExpiredPolicy(policy.id);
              return { ...policy, policy_is_active: false };
            } catch (err) {
              console.error(`Failed to deactivate expired policy ${policy.id}:`, err);
              return policy;
            }
          }
          return policy;
        })
      );
      setPolicies(updatedData);
    } catch (error) {
      console.error("Error loading policies:", error);
      setPolicies([]);
    }
  };

  const deactivateExpiredPolicy = async (policyId) => {
    const { db } = await import("../../dbServer");
    const { error } = await db
      .from("policy_Table")
      .update({ policy_is_active: false })
      .eq("id", policyId);
    
    if (error) throw error;
  };

  const loadPartners = async () => {
    try {
      const data = await fetchPartners();
      setPartners(data);
    } catch (err) {
      console.error("Error loading partners:", err);
    }
  };

  useEffect(() => {
    loadPolicies();
    loadPartners();
  }, []);

  const handleRowClick = (policy) => {
    setSelectedPolicy({
      policyId: policy.id,
      clientId: policy.client_id,
    });
  };

  // Fetch payment type for a policy
  const fetchPolicyPaymentType = async (policyId) => {
    try {
      const { db } = await import("../../dbServer");
      
      // Get the payment_type_id from policy_Computation_Table
      const { data: computation, error: compError } = await db
        .from("policy_Computation_Table")
        .select("payment_type_id")
        .eq("policy_id", policyId)
        .single();
      
      if (compError || !computation?.payment_type_id) {
        console.error("No payment type found in computation");
        return null;
      }

      // Get the payment type details
      const { data: paymentType, error: ptError } = await db
        .from("payment_type")
        .select("*")
        .eq("id", computation.payment_type_id)
        .single();
      
      if (ptError) throw ptError;
      return paymentType;
    } catch (error) {
      console.error("Error fetching payment type:", error);
      return null;
    }
  };

  const handleActivateClick = async (policy) => {
    // Prevent activation if policy is expired
    if (isPolicyExpired(policy.policy_expiry)) {
      alert("Cannot activate an expired policy. Please update the expiry date first.");
      return;
    }

    const confirmActivate = window.confirm(
      "Activate this policy and generate payment schedule?"
    );
    if (!confirmActivate) return;

    try {
      // Get computation for total premium
      const computation = policy.policy_Computation_Table?.[0];
      if (!computation || !computation.total_Premium) {
        alert("No computation found for this policy");
        return;
      }

      // Get payment type that was selected during policy creation
      const paymentType = await fetchPolicyPaymentType(policy.id);
      if (!paymentType) {
        alert("No payment type found for this policy. Please edit the policy and select a payment type.");
        return;
      }

      const totalPremium = computation.total_Premium;
      const months = paymentType.months_payment;
      const paymentTypeId = paymentType.id;

      console.log("=== ACTIVATING POLICY ===");
      console.log("Policy ID:", policy.id);
      console.log("Payment Type:", paymentType.payment_type_name);
      console.log("Months:", months);
      console.log("Total Premium:", totalPremium);

      // Activate and create payment schedule
      const result = await ActivatePolicyAndPayment(
        policy.id,
        paymentTypeId,
        totalPremium,
        months
      );

      if (result.success) {
        setPolicies((prev) =>
          prev.map((p) =>
            p.id === policy.id ? { ...p, policy_is_active: true } : p
          )
        );
        alert(
          `Policy activated successfully!\n` +
          `Payment Plan: ${paymentType.payment_type_name} (${months} months)\n` +
          `Monthly Payment: ₱${(totalPremium / months).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
        );
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("Activation failed:", err);
      alert("Error activating policy: " + err.message);
    }
  };

  const handleArchiveClick = async (policyId) => {
    const confirmArchive = window.confirm("Proceed to archive this policy?");
    if (!confirmArchive) return;

    try {
      await archivePolicy(policyId);
      setPolicies((prev) => prev.filter((p) => p.id !== policyId));
    } catch (error) {
      console.error("Error archiving policy:", error);
    }
  };

  const handleVoidClick = async (policy) => {
    const reason = prompt("Enter reason for voiding this policy:");
    if (!reason || !reason.trim()) return;

    const confirmVoid = window.confirm(
      `Void this policy?\n\nThis will:\n- Mark policy as VOIDED\n- Deactivate the policy\n- Prevent any claims or payments\n\nReason: ${reason}`
    );
    if (!confirmVoid) return;

    try {
      const { db } = await import("../../dbServer");
      
      const { error } = await db
        .from("policy_Table")
        .update({
          policy_status: 'voided',
          policy_is_active: false,
          void_reason: reason,
          voided_date: new Date().toISOString(),
        })
        .eq("id", policy.id);

      if (error) throw error;

      setPolicies((prev) =>
        prev.map((p) =>
          p.id === policy.id
            ? { 
                ...p, 
                policy_status: 'voided',
                policy_is_active: false,
                void_reason: reason,
                voided_date: new Date().toISOString()
              }
            : p
        )
      );
      alert("Policy voided successfully");
    } catch (error) {
      console.error("Error voiding policy:", error);
      alert("Error voiding policy: " + error.message);
    }
  };

const handleCancelClick = async (policy) => {
  const reason = prompt("Enter reason for cancelling this policy:");
  if (!reason || !reason.trim()) return;

  const confirmCancel = window.confirm(
    `Cancel this policy?\n\nThis will:\n- Refund the first payment\n- Cancel all remaining payments\n- Mark the policy as CANCELLED\n\nReason: ${reason}`
  );
  if (!confirmCancel) return;

  try {
    const { db } = await import("../../dbServer");

    // 1️⃣ Get computation info
    const computation = policy.policy_Computation_Table?.[0];
    if (!computation || !computation.total_Premium) {
      alert("No computation found for this policy.");
      return;
    }

    // 2️⃣ Get payment type info (same logic as activation)
    const paymentType = await fetchPolicyPaymentType(policy.id);
    if (!paymentType) {
      alert("No payment type found for this policy. Please edit the policy and select one.");
      return;
    }

    const totalPremium = computation.total_Premium;
    const months = paymentType.months_payment;
    const paymentTypeId = paymentType.id;

    console.log("=== CANCELLING POLICY ===");
    console.log("Policy ID:", policy.id);
    console.log("Payment Type:", paymentType.payment_type_name);
    console.log("Months:", months);
    console.log("Total Premium:", totalPremium);

    // 3️⃣ Check if there are existing payments
    const { data: existingPayments, error: payError } = await db
      .from("payment_Table")
      .select("*")
      .eq("policy_id", policy.id);

    if (payError) throw payError;

    let paymentsToUse = existingPayments;

    // 4️⃣ If no payments exist, generate them (copy from activation)
    if (!paymentsToUse || paymentsToUse.length === 0) {
      console.log("No existing payments — generating before refund/cancel...");
      const now = new Date();
      const monthlyAmount = Number((totalPremium / months).toFixed(2));

      const paymentRows = Array.from({ length: months }, (_, i) => {
        const paymentDate = new Date(now);
        paymentDate.setMonth(paymentDate.getMonth() + (i + 1));
        return {
          payment_date: paymentDate.toISOString().split("T")[0],
          amount_to_be_paid: monthlyAmount,
          is_paid: false,
          paid_amount: 0,
          policy_id: policy.id,
          payment_type_id: paymentTypeId,
        };
      });

      const { data: inserted, error: insertError } = await db
        .from("payment_Table")
        .insert(paymentRows)
        .select();

      if (insertError) throw insertError;
      console.log("✅ Generated payments:", inserted.length);
      paymentsToUse = inserted;
    }

    // 5️⃣ Refund first payment
   const firstPayment = paymentsToUse[0];
    await db
      .from("payment_Table")
      .update({
        is_paid: false,
        paid_amount: 0,
        is_refunded: true,
        refund_amount: firstPayment.amount_to_be_paid,
        refund_date: new Date().toISOString(),
        refund_reason: reason,
        payment_status: "refunded",
      })
      .eq("id", firstPayment.id);

    // 6️⃣ Cancel remaining payments (not archive)
    if (paymentsToUse.length > 1) {
      const remainingIds = paymentsToUse.slice(1).map((p) => p.id);
      await db
        .from("payment_Table")
        .update({
          payment_status: "cancelled",
          is_archive: false,
        })
        .in("id", remainingIds);
    }

    // 7️⃣ Update policy as cancelled
    const { error: policyError } = await db
      .from("policy_Table")
      .update({
        policy_status: "cancelled",
        cancellation_reason: reason,
        cancellation_date: new Date().toISOString(),
        policy_is_active: false,
      })
      .eq("id", policy.id);

    if (policyError) throw policyError;

    // 8️⃣ Update UI
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === policy.id
          ? {
              ...p,
              policy_status: "cancelled",
              cancellation_reason: reason,
              cancellation_date: new Date().toISOString(),
              policy_is_active: false,
            }
          : p
      )
    );

    alert("✅ Policy cancelled successfully. First payment refunded, remaining payments cancelled.");
  } catch (error) {
    console.error("Error cancelling policy:", error);
    alert("Error cancelling policy: " + error.message);
  }
};


  const filteredAndSearchedPolicies = useMemo(() => {
    let tempPolicies = policies;

    // Partner filter
    if (partnerFilter) {
      tempPolicies = tempPolicies.filter((policy) => {
        const partnerArray = policy.insurance_Partners;
        const partnerIdFromJoin =
          Array.isArray(partnerArray) && partnerArray.length > 0
            ? partnerArray[0].id
            : null;

        const partnerId = partnerIdFromJoin || policy.partner_id || null;
        return String(partnerId) === String(partnerFilter);
      });
    }

    // Status filter
    if (statusFilter === "Active") {
      tempPolicies = tempPolicies.filter((policy) => policy.policy_is_active && !isPolicyExpired(policy.policy_expiry));
    } else if (statusFilter === "Inactive") {
      tempPolicies = tempPolicies.filter((policy) => !policy.policy_is_active && !isPolicyExpired(policy.policy_expiry) && !policy.policy_status);
    } else if (statusFilter === "Expired") {
      tempPolicies = tempPolicies.filter((policy) => isPolicyExpired(policy.policy_expiry));
    } else if (statusFilter === "Voided") {
      tempPolicies = tempPolicies.filter((policy) => policy.policy_status === 'voided');
    } else if (statusFilter === "Cancelled") {
      tempPolicies = tempPolicies.filter((policy) => policy.policy_status === 'cancelled');
    }

    // Search filter
    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
      tempPolicies = tempPolicies.filter((policy) => {
        const policyMainIdMatch = policy.id.toString().toLowerCase().includes(lowerCaseSearchTerm);
        const policyInternalIdMatch = policy.internal_id?.toString().toLowerCase().includes(lowerCaseSearchTerm);

        const client = policy.clients_Table;
        const clientName = client
          ? [
              client.first_Name,
              client.middle_Name,
              client.family_Name,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
          : "";

        const clientNameMatch = clientName.includes(lowerCaseSearchTerm);
        return policyMainIdMatch || policyInternalIdMatch || clientNameMatch;
      });
    }

    return tempPolicies;
  }, [policies, searchTerm, statusFilter, partnerFilter]);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentPolicies = filteredAndSearchedPolicies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAndSearchedPolicies.length / rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="policy-table-container">
      <div className="policy-table-header">
        <h2>
          Current Policies{" "}
          <span>({filteredAndSearchedPolicies.length})</span>
        </h2>

        <div className="policy-controls-right-group">
          <input
            type="text"
            placeholder="Search by Policy ID or Client Name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="policy-search-input"
          />

          <div className="policy-status-filter-dropdown">
            <label htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Expired">Expired</option>
              <option value="Voided">Voided</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="policy-partner-filter-dropdown">
            <label htmlFor="partnerFilter">Partner:</label>
            <select
              id="partnerFilter"
              value={partnerFilter}
              onChange={(e) => {
                setPartnerFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Partners</option>
              {partners.map(partner => (
                <option key={partner.id} value={partner.id}>
                  {partner.insurance_Name}
                </option>
              ))}
            </select>
          </div>

          <div className="rows-per-page-inline">
            <label htmlFor="rowsPerPage">Results:</label>
            <select
              id="rowsPerPage"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button 
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("All");
              setPartnerFilter("");
              setCurrentPage(1);
              loadPolicies();
            }} 
            className="reset-btn-policy"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="policy-table-wrapper">
        <div className="policy-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Policy ID</th>
                <th>Policy Type</th>
                <th>Client Name</th>
                <th>Insurance Partner</th>
                <th>Inception Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Premium</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPolicies.length > 0 ? (
                currentPolicies.map((policy) => {
                  const client = policy.clients_Table;
                  const partner = policy.insurance_Partners;
                  const computation = policy.policy_Computation_Table?.[0];
                  const isExpired = isPolicyExpired(policy.policy_expiry);
                  const isVoided = policy.policy_status === 'voided';
                  const isCancelled = policy.policy_status === 'cancelled';
                  const policyStatus = getPolicyStatus(policy);
                  
                  const clientName = client
                    ? [
                        client.prefix,
                        client.first_Name,
                        client.middle_Name
                          ? client.middle_Name.charAt(0) + "."
                          : "",
                        client.family_Name,
                        client.suffix,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    : "Unknown Client";

                  return (
                    <tr
                      key={policy.id}
                      className={`policy-table-clickable-row ${
                        isExpired ? 'policy-row-expired' : ''
                      } ${isVoided ? 'policy-row-voided' : ''} ${
                        isCancelled ? 'policy-row-cancelled' : ''
                      }`}
                      onClick={() => handleRowClick(policy)}
                    >
                      <td>{policy.internal_id}</td>
                      <td>{policy.policy_type}</td>
                      <td>{clientName}</td>
                      <td>{partner?.insurance_Name || "No Partner"}</td>
                      <td>
                        {policy.policy_inception
                          ? new Date(policy.policy_inception).toLocaleString("en-PH", {
                              timeZone: "Asia/Manila",
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "N/A"}
                      </td>
                      <td>
                        {policy.policy_expiry
                          ? new Date(policy.policy_expiry).toLocaleString("en-PH", {
                              timeZone: "Asia/Manila",
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "N/A"}
                      </td>
                      <td>
                        <span className={policyStatus.class}>
                          {policyStatus.text}
                        </span>
                      </td>
                      <td className="premium-cell">
                        {computation
                          ? new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(computation.total_Premium)
                          : "No Computation"}
                      </td>
                      <td className="policy-table-actions">
                        <button
                          disabled={policy.policy_is_active || isExpired || isVoided || isCancelled}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivateClick(policy);
                          }}
                          title={
                            isExpired ? "Cannot activate expired policy" :
                            isVoided ? "Cannot activate voided policy" :
                            isCancelled ? "Cannot activate cancelled policy" : ""
                          }
                        >
                          Activate
                        </button>
                        <button
                          disabled={isVoided || isCancelled}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/appinsurance/main-app/policy/Edit/${policy.id}`
                            );
                          }}
                          title={isVoided || isCancelled ? "Cannot edit voided/cancelled policy" : ""}
                        >
                          Edit
                        </button>
                        <button
                          disabled={isVoided || isCancelled || isExpired}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoidClick(policy);
                          }}
                          className="void-btn"
                          title={
                            isExpired ? "Cannot void expired policy" :
                            isVoided || isCancelled ? "Policy already voided/cancelled" : ""
                          }
                        >
                          Void
                        </button>
                        <button
                          disabled={policy.policy_is_active || isVoided || isCancelled || isExpired}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelClick(policy);
                          }}
                          className="cancel-btn"
                          title={
                            policy.policy_is_active ? "Cannot cancel active policy" :
                            isExpired ? "Cannot cancel expired policy" :
                            isVoided || isCancelled ? "Policy already voided/cancelled" : ""
                          }
                        >
                          Cancel
                        </button>
                        <button
                          disabled={policy.policy_is_active}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveClick(policy.id);
                          }}
                          title={policy.policy_is_active ? "Cannot archive active policy - deactivate first" : ""}
                        >
                          Archive
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9">No policies found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ClientInfo
        selectedPolicy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />
    </div>
  );
}