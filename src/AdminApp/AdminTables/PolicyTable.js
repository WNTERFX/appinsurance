import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ClientInfo from "../ClientInfo";
import "../styles/policy-table-styles.css";
import {
  fetchPolicies,
  archivePolicy,
  fetchPartners
} from "../AdminActions/PolicyActions";
import { 
  SetPolicyInceptionDate, 
  CancelPolicyAndRefund, 
  VoidPolicyAndPayments,
  CheckAllPoliciesForOverduePayments,  
  DebugCheckPolicy                      
} from "../AdminActions/PolicyActivationActions";

import PolicyInceptionModal from "../PolicyInceptionModal";

export default function PolicyTable() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [partnerFilter, setPartnerFilter] = useState("");
  const [partners, setPartners] = useState([]);
  const [isCheckingOverdue, setIsCheckingOverdue] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInceptionModal, setShowInceptionModal] = useState(false);
  const [selectedPolicyForInception, setSelectedPolicyForInception] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
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

  // 🆕 MANUAL BUTTON: Check for 90+ day overdue payments
  const handleCheckOverduePayments = async () => {
    if (isCheckingOverdue) return; // Prevent double-clicks
    
    const confirmCheck = window.confirm(
      "Check all policies for overdue payments?\n\n" +
      "This will automatically void any policies with payments overdue by 90+ days.\n\n" +
      "Continue?"
    );
    
    if (!confirmCheck) return;

    setIsCheckingOverdue(true);
    
    try {
      console.log("🔍 Manual check: Looking for 90+ day overdue payments...");
      const result = await CheckAllPoliciesForOverduePayments();
      
      if (result.success && result.policiesAffected.length > 0) {
        console.log(`⚠️ Found and voided ${result.policiesAffected.length} policies with overdue payments`);
        
        // Build detailed notification
        const policyList = result.policiesAffected
          .map(p => 
            `• ${p.internal_id} - ${p.client_name}\n` +
            `  ${p.voidedCount} payment(s) voided (${p.maxDaysOverdue} days overdue)`
          )
          .join('\n\n');

        alert(
          `⚠️ OVERDUE PAYMENT CHECK RESULTS\n\n` +
          `Policies checked: ${result.totalChecked}\n` +
          `Policies voided: ${result.policiesAffected.length}\n` +
          `Total payments voided: ${result.totalVoided}\n\n` +
          `Details:\n${policyList}\n\n` +
          `Check Duration: ${result.duration}s`
        );
        
        // Reload policies to show updated status
        await loadPolicies();
      } else if (result.success) {
        alert(
          `✅ CHECK COMPLETE\n\n` +
          `Policies checked: ${result.totalChecked}\n` +
          `No overdue payments found (90+ days)\n\n` +
          `Duration: ${result.duration}s`
        );
      } else {
        alert("❌ Check failed:\n\n" + result.error);
      }
    } catch (error) {
      console.error("Manual overdue check failed:", error);
      alert("❌ Error checking overdue payments:\n\n" + error.message);
    } finally {
      setIsCheckingOverdue(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      console.log("🚀 Initializing PolicyTable...");
      await loadPolicies();
      await loadPartners();
    };
    initialize();
    
    // Expose debug function globally for testing in console
    window.debugCheckPolicy = DebugCheckPolicy;
    console.log("💡 Debug helper available: window.debugCheckPolicy(policyId)");
  }, []);

  const handleCopyClick = (e, textToCopy) => {
    // Stop the row's onClick event from firing
    e.stopPropagation();

    // Create a temporary textarea element to hold the text
    const textarea = document.createElement("textarea");
    textarea.value = textToCopy;

    // Position it off-screen
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";

    document.body.appendChild(textarea);
    textarea.select(); // Select the text

    try {
      // Use the legacy execCommand
      document.execCommand("copy");

      // Set feedback state
      setCopiedId(textToCopy);

      // Clear feedback after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }

    // Clean up the temporary element
    document.body.removeChild(textarea);
  };


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

  const handleSaveInceptionDate = async (inceptionTimestamp, expiryTimestamp) => {
    try {
      const result = await SetPolicyInceptionDate(
        selectedPolicyForInception.id,
        inceptionTimestamp,
        expiryTimestamp
      );

      if (result.success) {
        // Reload policies to show updated dates
        await loadPolicies();
        
        alert(
          `✅ Inception date set successfully!\n\n` +
          `Inception: ${new Date(inceptionTimestamp).toLocaleString("en-PH")}\n` +
          `Expiry: ${new Date(expiryTimestamp).toLocaleString("en-PH")}`
        );
      } else {
        alert("❌ Error setting inception date:\n\n" + result.error);
      }
    } catch (error) {
      console.error("Error setting inception date:", error);
      throw error;
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
      `Void this policy?\n\nThis will:\n- Mark policy as VOIDED\n- Cancel all associated payments\n- Deactivate the policy\n- Prevent any claims or payments\n\nReason: ${reason}`
    );
    if (!confirmVoid) return;

    try {
      const result = await VoidPolicyAndPayments(policy.id, reason.trim());

      if (result.success) {
        // Update UI
        setPolicies((prev) =>
          prev.map((p) =>
            p.id === policy.id
              ? {
                  ...p,
                  policy_status: "voided",
                  policy_is_active: false,
                  void_reason: reason.trim(),
                  voided_date: new Date().toISOString(),
                }
              : p
          )
        );

        alert(
          `✅ ${result.message}\n\n` +
          `Payments cancelled: ${result.paymentsCancelled}\n` +
          `Reason: ${reason}`
        );
      } else {
        alert("❌ Void Error:\n\n" + result.error);
      }
    } catch (error) {
      console.error("Error voiding policy:", error);
      alert("❌ Error voiding policy:\n\n" + error.message);
    }
  };

  const handleCancelClick = async (policy) => {
    const reason = prompt("Enter reason for cancelling this policy:");
    if (!reason || !reason.trim()) return;

    const confirmCancel = window.confirm(
      `Cancel this policy?\n\nThis will:\n- Refund ALL paid/partially-paid payments\n- Cancel all unpaid payments\n- Mark the policy as CANCELLED\n\nReason: ${reason}`
    );
    if (!confirmCancel) return;

    try {
      // Call your CancelPolicyAndRefund function
      const result = await CancelPolicyAndRefund(policy.id);

      if (result.success) {
        // Update the policy with cancellation details
        const { db } = await import("../../dbServer");
        const { error: policyError } = await db
          .from("policy_Table")
          .update({
            cancellation_reason: reason,
          })
          .eq("id", policy.id);

        if (policyError) {
          console.error("Error updating cancellation reason:", policyError);
        }

        // Update UI
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

        alert(`✅ ${result.message}\n\nReason: ${reason}`);
        
        // Optionally reload policies to ensure UI is in sync
        await loadPolicies();
      } else {
        alert("❌ Cancellation Error:\n\n" + result.error);
      }
    } catch (error) {
      console.error("Error cancelling policy:", error);
      alert("❌ Error cancelling policy:\n\n" + error.message);
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

          {/* 🆕 OVERDUE CHECK BUTTON */}
        <button 
            onClick={async () => {
              setIsRefreshing(true);
              try {
                // Reset all filters
                setSearchTerm("");
                setStatusFilter("All");
                setPartnerFilter("");
                setCurrentPage(1);
                
                // Reload data
                await loadPolicies();
                await loadPartners();
                
                console.log("✅ Policies refreshed successfully");
              } catch (error) {
                console.error("❌ Error refreshing:", error);
                alert("Failed to refresh policies. Please try again.");
              } finally {
                setIsRefreshing(false);
              }
            }} 
            className="reset-btn-policy"
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
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
                <th>Renewal Date</th>
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
                      
                        <td
                          onClick={(e) => handleCopyClick(e, policy.internal_id)}
                          title="Click to copy Policy ID"
                          style={{
                            cursor: "pointer",
                            color: copiedId === policy.internal_id ? "#155724" : "#007bff",
                            backgroundColor:
                              copiedId === policy.internal_id ? "#d4edda" : "transparent",
                             borderRadius: "4px",
                            padding: "8px",
                            transition: "all 0.2s",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          {copiedId === policy.internal_id ? "Copied!" : policy.internal_id}
                      </td>
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
                      {policy.renewal_table && policy.renewal_table.length > 0 ? (
                        <span className="renewal-badge renewed">
                          {new Date(
                            policy.renewal_table[policy.renewal_table.length - 1].renewal_date
                          ).toLocaleString("en-PH", {
                            timeZone: "Asia/Manila",
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      ) : (
                        <span className="renewal-badge not-renewed">—</span>
                      )}
                    </td>

                      <td className="policy-status-cell">
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
                          disabled={isVoided || isCancelled || policy.policy_is_active}
                          onClick={(e) => {
                            e.stopPropagation();
                            const client = policy.clients_Table;
                            const clientName = client
                              ? [client.first_Name, client.middle_Name, client.family_Name]
                                  .filter(Boolean)
                                  .join(" ")
                              : "Unknown Client";
                            
                            setSelectedPolicyForInception({
                              id: policy.id,
                              internal_id: policy.internal_id,
                              policy_type: policy.policy_type,
                              clientName: clientName
                            });
                            setShowInceptionModal(true);
                          }}
                          title={
                            policy.policy_is_active ? "Cannot set inception for an active policy":
                            isVoided ? "Cannot set inception for voided policy" :
                            isCancelled ? "Cannot set inception for cancelled policy" : ""
                          }
                        >
                          Set Inception
                        </button>
                        <button
                          disabled={isVoided || isCancelled}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isExpired) {
                              // Pass renewal flag in URL or state for Edit page
                              navigate(`/appinsurance/main-app/policy/Edit/${policy.id}?mode=renewal`);
                            } else {
                              navigate(`/appinsurance/main-app/policy/Edit/${policy.id}`);
                            }
                          }}
                          title={
                            isVoided
                              ? "Cannot edit voided policy"
                              : isCancelled
                              ? "Cannot edit cancelled policy"
                              : isExpired
                              ? "Expired — you can renew this policy"
                              : "Edit this policy"
                          }
                        >
                          {isExpired ? "Edit / Renew" : "Edit"}
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

       <PolicyInceptionModal
        isOpen={showInceptionModal}
        onClose={() => {
          setShowInceptionModal(false);
          setSelectedPolicyForInception(null);
        }}
        onSave={handleSaveInceptionDate}
        policyInfo={selectedPolicyForInception}
      />
    </div>
  );
}