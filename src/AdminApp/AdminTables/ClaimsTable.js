// admin side
import { useEffect, useState } from "react";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import {
  fetchClaims,
  updateClaim,
  archiveClaim,
} from "../AdminActions/ClaimsTableActions";
import EditClaimsModal from "../AdminForms/EditClaimsModal";
import ViewClaimModal from "../AdminForms/ViewClaimModal";
import CustomAlertModal from "../AdminForms/CustomAlertModal";
import CustomConfirmModal from "../AdminForms/CustomConfirmModal";
import "../styles/claims-table-styles.css";

export default function ClaimsTable() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [editingClaim, setEditingClaim] = useState(null);
  const [viewingClaim, setViewingClaim] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedClaims, setSelectedClaims] = useState({});
  
  const [activeTab, setActiveTab] = useState("Pending");

  // Custom Alert Modal State
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: "",
    title: "Alert"
  });

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    title: "Confirm",
    onConfirm: null
  });

  const tabs = ["Pending", "Under Review", "Rejected", "Approved", "Completed"];

  // Helper function to show custom alert
  const showAlert = (message, title = "Alert") => {
    setAlertModal({
      isOpen: true,
      message,
      title
    });
  };

  const closeAlert = () => {
    setAlertModal({
      isOpen: false,
      message: "",
      title: "Alert"
    });
  };

  // Helper function to show custom confirm
  const showConfirm = (message, title = "Confirm") => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        message,
        title,
        onConfirm: () => {
          closeConfirm();
          resolve(true);
        }
      });
    });
  };

  const closeConfirm = () => {
    setConfirmModal({
      isOpen: false,
      message: "",
      title: "Confirm",
      onConfirm: null
    });
  };

  useEffect(() => {
    loadClaimsData();
  }, []);

  const loadClaimsData = async () => {
    setLoading(true);
    try {
      const allClaims = await fetchClaims();
      if (!allClaims || allClaims.length === 0) {
        setClaims([]);
        setLoading(false);
        return;
      }

      const nonArchivedClaims = allClaims.filter((claim) => !claim.is_archived);
      
      // Sort claims by claim date (most recent first)
      nonArchivedClaims.sort((a, b) => new Date(b.claim_date) - new Date(a.claim_date));

      setClaims(nonArchivedClaims);
    } catch (error) {
      console.error("Error loading claims:", error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (uniqueKey) => {
    setExpanded((prev) => ({ ...prev, [uniqueKey]: !prev[uniqueKey] }));
  };

  const handleClaimAction = async (claim, actionType, uniqueKey) => {
    try {
      if (actionType === "edit") {
        if (!claim.status || claim.status === "Pending") {
          showAlert(
            'Cannot edit claim in Pending status. Please set it to "Under Review" first.',
            "Cannot Edit"
          );
          return;
        }
        setEditingClaim(claim);
      } else if (actionType === "archive") {
        const confirmed = await showConfirm(
          `Are you sure you want to archive Claim ID: ${claim.id}?`,
          "Archive Claim"
        );
        if (!confirmed) {
          return;
        }
        try {
          await archiveClaim(claim.id);
          showAlert(`Claim ID:${claim.id} has been archived successfully.`, "Success");
          loadClaimsData();
        } catch (error) {
          console.error("Error archiving claim:", error);
          showAlert("Failed to archive claim.", "Error");
        }
      } else if (actionType === "view") {
        setViewingClaim({
          policy: claim.policy_Table,
          claims: [claim],
        });
      }
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      showAlert(`Failed to ${actionType} claim.`, "Error");
    }
  };

  const handleSaveEdit = async (claimId, updatedData) => {
    try {
      await updateClaim(claimId, updatedData);
      showAlert("Claim updated successfully!", "Success");
      setEditingClaim(null);
      loadClaimsData();
    } catch (error) {
      console.error("Error updating claim:", error);
      showAlert("Failed to update claim.", "Error");
    }
  };

  const handleUnderReview = async (uniqueKey) => {
    const selectedClaimId = selectedClaims[uniqueKey];
    if (!selectedClaimId) {
      showAlert("Please select a claim first.", "No Claim Selected");
      return;
    }
    
    const confirmed = await showConfirm(
      "Do you want to set this Claim to Under Review?",
      "Under Review"
    );
    if (!confirmed) {
      return;
    }

    try {
      const updateData = {
        status: "Under Review",
        under_review_date: new Date().toISOString().split("T")[0],
      };
      await updateClaim(selectedClaimId, updateData);
      await loadClaimsData();
      setActiveTab("Under Review");
      showAlert(`Claim ID:${selectedClaimId} set to Under Review!`, "Success");
    } catch (error) {
      console.error("Error setting Under Review:", error);
      showAlert("Failed to update claim status.", "Error");
    }
  };

  const handleRejectClaim = async (uniqueKey) => {
    const selectedClaimId = selectedClaims[uniqueKey];
    if (!selectedClaimId) {
      showAlert("Please select a claim first.", "No Claim Selected");
      return;
    }
    
    const confirmed = await showConfirm(
      "Are you sure you want to reject this claim?",
      "Reject Claim"
    );
    if (!confirmed) {
      return;
    }

    try {
      const updateData = {
        status: "Rejected",
        reject_claim_date: new Date().toISOString().split("T")[0],
        is_approved: false,
      };
      await updateClaim(selectedClaimId, updateData);
      await loadClaimsData();
      setActiveTab("Rejected");
      showAlert(`Claim ID:${selectedClaimId} has been rejected.`, "Claim Rejected");
    } catch (error) {
      console.error("Error rejecting claim:", error);
      showAlert("Failed to reject claim.", "Error");
    }
  };

  const handleApproveClaim = async (uniqueKey) => {
    const selectedClaimId = selectedClaims[uniqueKey];
    if (!selectedClaimId) {
      showAlert("Please select a claim first.", "No Claim Selected");
      return;
    }
    
    const confirmed = await showConfirm(
      "Are you sure you want to approve this claim?",
      "Approve Claim"
    );
    if (!confirmed) {
      return;
    }

    try {
      const updateData = {
        status: "Approved",
        approved_claim_date: new Date().toISOString().split("T")[0],
        is_approved: true,
      };
      await updateClaim(selectedClaimId, updateData);
      await loadClaimsData();
      setActiveTab("Approved");
      showAlert(`Claim ID:${selectedClaimId} has been approved!`, "Claim Approved");
    } catch (error) {
      console.error("Error approving claim:", error);
      showAlert("Failed to approve claim.", "Error");
    }
  };

  const handleCompleted = async (uniqueKey) => {
    const selectedClaimId = selectedClaims[uniqueKey];
    if (!selectedClaimId) {
      showAlert("Please select a claim first.", "No Claim Selected");
      return;
    }
    
    const confirmed = await showConfirm(
      "Mark this claim as completed?",
      "Complete Claim"
    );
    if (!confirmed) {
      return;
    }

    try {
      const updateData = {
        status: "Completed",
        completed_date: new Date().toISOString().split("T")[0],
      };
      await updateClaim(selectedClaimId, updateData);
      await loadClaimsData();
      setActiveTab("Completed");
      showAlert("Claim marked as completed!", "Success");
    } catch (error) {
      console.error("Error marking claim as completed:", error);
      showAlert("Failed to mark claim as completed.", "Error");
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₱0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Group claims by policy AND status (each policy-status combination is separate)
  const groupedClaims = claims.reduce((acc, claim) => {
    const policyId = claim.policy_id;
    const status = claim.status || "Pending";
    const uniqueKey = `${policyId}-${status}`;
    
    if (!acc[uniqueKey]) {
      acc[uniqueKey] = {
        policyId: policyId,
        status: status,
        policy_Table: claim.policy_Table,
        claims: []
      };
    }
    acc[uniqueKey].claims.push(claim);
    return acc;
  }, {});

  // Filter by active tab
  const filteredGroups = Object.entries(groupedClaims).filter(([key, group]) => {
    return group.status === activeTab;
  });

  // Filter by search term
  const searchFilteredGroups = filteredGroups.filter(([key, group]) => {
    const client = group.policy_Table?.clients_Table;
    const clientName = client
      ? [
        client.prefix,
        client.first_Name,
        client.middle_Name ? client.middle_Name.charAt(0) + "." : "",
        client.family_Name,
        client.suffix,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      : "";
    const policyId = group.policy_Table?.internal_id?.toLowerCase() || "";
    const search = searchTerm.toLowerCase().trim();
    return policyId.includes(search) || clientName.includes(search);
  });

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentGroups = searchFilteredGroups.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(searchFilteredGroups.length / rowsPerPage);

  const getTabCount = (tabName) => {
    return Object.values(groupedClaims).filter(group => group.status === tabName).length;
  };

  if (loading) {
    return (
      <div className="claims-overview-section">
        <p style={{ textAlign: "center", padding: "20px", fontSize: "16px" }}>
          Loading claims data...
        </p>
      </div>
    );
  }

  return (
    <div className="claims-overview-section">
      <div className="claims-tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`claims-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
          >
            {tab} ({getTabCount(tab)})
          </button>
        ))}
      </div>

      <div className="claims-overview-header">
        <h2>Claims Overview</h2>
        <div className="search-filter-refresh-bar">
          <input
            type="text"
            placeholder="Search by Policy ID or Client Name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
          <div className="result-select-wrapper">
            <span>Result</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="result-select"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <button className="refresh-btn" onClick={loadClaimsData}>
            Refresh
          </button>
        </div>
      </div>

      {currentGroups.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px", fontSize: "18px", color: "#666" }}>
          No claims in {activeTab} status
        </p>
      ) : (
        <div className="policies-list">
          {currentGroups.map(([uniqueKey, group]) => {
            const client = group.policy_Table?.clients_Table;
            const clientName = client
              ? [
                client.prefix,
                client.first_Name,
                client.middle_Name ? client.middle_Name.charAt(0) + "." : "",
                client.family_Name,
                client.suffix,
              ]
                .filter(Boolean)
                .join(" ")
              : "Unknown Client";

            const claimsForGroup = group.claims;
            const isOpen = expanded[uniqueKey];

            const selectedClaimId = selectedClaims[uniqueKey];
            const selectedClaim = selectedClaimId
              ? claimsForGroup.find((c) => c.id === selectedClaimId)
              : null;

            const claimStatus = selectedClaim?.status || group.status;
            const approvedAmount = selectedClaim?.approved_amount || 0;
            const estimateAmount = selectedClaim?.estimate_amount || 0;
            const hasValidApprovedAmount =
              approvedAmount > 0 && approvedAmount >= estimateAmount * 0.5;

            let buttons = {
              viewClaim: true,
              underReview: false,
              rejectClaim: false,
              approveClaim: false,
              completed: false,
            };

            const isClaimSelected = !!selectedClaim;

            if (isClaimSelected) {
              if (claimStatus === "Pending") {
                buttons.viewClaim = true;
                buttons.underReview = true;
                buttons.rejectClaim = true;
                buttons.approveClaim = true;
                buttons.completed = true;
              } else if (claimStatus === "Under Review") {
                buttons.viewClaim = true;
                buttons.underReview = false;
                buttons.rejectClaim = true;
                buttons.approveClaim = true;
                buttons.completed = true;
              } else if (claimStatus === "Approved") {
                buttons.viewClaim = true;
                buttons.completed = true;
              } else if (
                claimStatus === "Rejected" ||
                claimStatus === "Completed"
              ) {
                buttons.viewClaim = true;
              }
            } else {
              buttons.viewClaim = false;
              buttons.underReview = true;
              buttons.rejectClaim = true;
              buttons.approveClaim = true;
              buttons.completed = true;
            }

            return (
              <div key={uniqueKey} className="policy-item-card">
                <div
                  className="policy-summary"
                  onClick={() => toggleExpand(uniqueKey)}
                >
                  <div className="policy-info-left">
                    <span className="policy-id">Policy ID: {group.policy_Table?.internal_id}</span>
                    <span className="policy-holder">
                      Policy Holder: {clientName}
                    </span>
                  </div>

                  <div className="policy-info-right">
                    <span
                      className={`claim-status-badge ${group.status.toLowerCase().replace(/\s+/g, "-")}`}
                      title={`Status: ${group.status}`}
                    >
                      Status: {group.status}
                    </span>

                    <button
                      className={`expand-toggle ${isOpen ? "expanded" : ""}`}
                      aria-label={isOpen ? "Collapse" : "Expand"}
                    >
                      <span className="arrow">⌄</span>
                    </button>
                  </div>
                </div>

                <div
                  className={`claim-details-table-wrapper ${isOpen ? "show" : ""}`}
                >
                  <h3 className="claim-details-title">Claims</h3>

                  {claimsForGroup.length > 0 ? (
                    <table className="claims-table">
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Type of Incident</th>
                          <th>Incident Date</th>
                          <th>Claim Date</th>
                          <th>Claimable Amount</th>
                          <th>Estimate Amount</th>
                          <th>Approved Amount</th>
                          <th>Documents</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claimsForGroup.map((claim) => {
                          let documentCount = 0;
                          if (claim.documents) {
                            if (Array.isArray(claim.documents)) {
                              documentCount = claim.documents.length;
                            } else if (typeof claim.documents === 'object') {
                              documentCount = Object.keys(claim.documents).length;
                            }
                          }

                          return (
                            <tr key={claim.id}>
                              <td>
                                <input
                                  type="radio"
                                  name={`selected-claim-${uniqueKey}`}
                                  checked={selectedClaims[uniqueKey] === claim.id}
                                  onChange={() =>
                                    setSelectedClaims((prev) => ({
                                      ...prev,
                                      [uniqueKey]: claim.id,
                                    }))
                                  }
                                />
                              </td>
                              <td>{claim.type_of_incident || "N/A"}</td>
                              <td>{formatDate(claim.incident_date)}</td>
                              <td>{formatDate(claim.claim_date)}</td>
                              <td>
                                {formatCurrency(
                                  claim.policy_Table?.policy_Computation_Table
                                    ?.policy_claim_amount
                                )}
                              </td>
                              <td>{formatCurrency(claim.estimate_amount)}</td>
                              <td>{formatCurrency(claim.approved_amount)}</td>
                              <td style={{ textAlign: "center" }}>
                                <span 
                                  className="document-count-badge"
                                  title={`${documentCount} document${documentCount !== 1 ? 's' : ''} uploaded`}
                                >
                                  {documentCount}
                                </span>
                              </td>

                              <td className="claim-actions-cell">
                                <button
                                  onClick={() =>
                                    handleClaimAction(claim, "edit", uniqueKey)
                                  }
                                  className="edit-claim-btn"
                                  disabled={
                                    !isClaimSelected ||
                                    selectedClaim?.id !== claim.id ||
                                    claim.status === "Pending" ||
                                    claim.status === "Approved" ||
                                    claim.status === "Rejected" ||
                                    claim.status === "Completed"
                                  }
                                  style={{
                                    opacity:
                                      !isClaimSelected ||
                                      selectedClaim?.id !== claim.id ||
                                      claim.status === "Pending" ||
                                      claim.status === "Approved" ||
                                      claim.status === "Rejected" ||
                                      claim.status === "Completed"
                                        ? 0.5
                                        : 1,
                                    cursor:
                                      !isClaimSelected ||
                                      selectedClaim?.id !== claim.id ||
                                      claim.status === "Pending" ||
                                      claim.status === "Approved" ||
                                      claim.status === "Rejected" ||
                                      claim.status === "Completed"
                                        ? "not-allowed"
                                        : "pointer",
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleClaimAction(claim, "archive", uniqueKey)
                                  }
                                  className="archive-claim-btn"
                                  disabled={
                                    !isClaimSelected || 
                                    selectedClaim?.id !== claim.id ||
                                    claim.status === "Pending" ||
                                    claim.status === "Under Review" ||
                                    claim.status === "Approved"
                                  }
                                  style={{
                                    opacity:
                                      !isClaimSelected || 
                                      selectedClaim?.id !== claim.id ||
                                      claim.status === "Pending" ||
                                      claim.status === "Under Review" ||
                                      claim.status === "Approved"
                                        ? 0.5
                                        : 1,
                                    cursor:
                                      !isClaimSelected || 
                                      selectedClaim?.id !== claim.id ||
                                      claim.status === "Pending" ||
                                      claim.status === "Under Review" ||
                                      claim.status === "Approved"
                                        ? "not-allowed"
                                        : "pointer",
                                  }}
                                  title={
                                    !isClaimSelected
                                      ? "Please select a claim first"
                                      : selectedClaim?.id !== claim.id
                                        ? "Please select this claim to archive"
                                        : claim.status === "Pending" ||
                                          claim.status === "Under Review" ||
                                          claim.status === "Approved"
                                          ? "Only Rejected or Completed claims can be archived"
                                          : "Archive this claim"
                                  }
                                >
                                  Archive
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-claims-message">No claims for this policy</p>
                  )}

                  <div className="claim-summary-actions">
                    {buttons.viewClaim && (
                      <button
                        className="view-claim-btn"
                        onClick={() =>
                          handleClaimAction(selectedClaim, "view", uniqueKey)
                        }
                        disabled={!buttons.viewClaim}
                        style={{
                          opacity: !buttons.viewClaim ? 0.5 : 1,
                          cursor: !buttons.viewClaim ? "not-allowed" : "pointer",
                        }}
                        title={
                          !buttons.viewClaim
                            ? "Please select a claim first"
                            : "View selected claim"
                        }
                      >
                        View Claim
                      </button>
                    )}

                    {buttons.underReview && (
                      <button
                        className="under-review-btn"
                        onClick={() => handleUnderReview(uniqueKey)}
                        disabled={!isClaimSelected || claimStatus !== "Pending"}
                        style={{
                          opacity:
                            !isClaimSelected || claimStatus !== "Pending" ? 0.5 : 1,
                          cursor:
                            !isClaimSelected || claimStatus !== "Pending"
                              ? "not-allowed"
                              : "pointer",
                        }}
                        title={
                          !isClaimSelected
                            ? "Please select a claim first"
                            : claimStatus !== "Pending"
                              ? "Not available for this status"
                              : "Set to Under Review"
                        }
                      >
                        Under Review
                      </button>
                    )}

                    {buttons.rejectClaim && (
                      <button
                        className="reject-claim-btn"
                        onClick={() => handleRejectClaim(uniqueKey)}
                        disabled={
                          !isClaimSelected ||
                          claimStatus === "Pending" ||
                          !hasValidApprovedAmount
                        }
                        style={{
                          opacity:
                            !isClaimSelected ||
                            claimStatus === "Pending" ||
                            !hasValidApprovedAmount
                              ? 0.5
                              : 1,
                          cursor:
                            !isClaimSelected ||
                            claimStatus === "Pending" ||
                            !hasValidApprovedAmount
                              ? "not-allowed"
                              : "pointer",
                        }}
                        title={
                          !isClaimSelected
                            ? "Please select a claim first"
                            : claimStatus === "Pending"
                              ? "Set to Under Review first"
                              : !hasValidApprovedAmount
                                ? "Approved amount must be at least 50% of estimate amount"
                                : "Reject selected claim"
                        }
                      >
                        Reject Claim
                      </button>
                    )}

                    {buttons.approveClaim && (
                      <button
                        className="approve-claim-btn"
                        onClick={() => handleApproveClaim(uniqueKey)}
                        disabled={
                          !isClaimSelected ||
                          claimStatus === "Pending" ||
                          !hasValidApprovedAmount
                        }
                        style={{
                          opacity:
                            !isClaimSelected ||
                            claimStatus === "Pending" ||
                            !hasValidApprovedAmount
                              ? 0.5
                              : 1,
                          cursor:
                            !isClaimSelected ||
                            claimStatus === "Pending" ||
                            !hasValidApprovedAmount
                              ? "not-allowed"
                              : "pointer",
                        }}
                        title={
                          !isClaimSelected
                            ? "Please select a claim first"
                            : claimStatus === "Pending"
                              ? "Set to Under Review first"
                              : !hasValidApprovedAmount
                                ? "Approved amount must be at least 50% of estimate amount"
                                : "Approve selected claim"
                        }
                      >
                        Approve Claim
                      </button>
                    )}

                    {buttons.completed && (
                      <button
                        className="completed-btn"
                        onClick={() => handleCompleted(uniqueKey)}
                        disabled={!isClaimSelected || claimStatus !== "Approved"}
                        style={{
                          opacity:
                            !isClaimSelected || claimStatus !== "Approved" ? 0.5 : 1,
                          cursor:
                            !isClaimSelected || claimStatus !== "Approved"
                              ? "not-allowed"
                              : "pointer",
                        }}
                        title={
                          !isClaimSelected
                            ? "Please select a claim first"
                            : claimStatus !== "Approved"
                              ? "Only approved claims can be completed"
                              : "Mark as completed"
                        }
                      >
                        Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {editingClaim && (
        <EditClaimsModal
          claim={editingClaim}
          onClose={() => setEditingClaim(null)}
          onSave={handleSaveEdit}
        />
      )}

      {viewingClaim && (
        <ViewClaimModal
          policy={viewingClaim.policy}
          claims={viewingClaim.claims}
          onClose={() => setViewingClaim(null)}
        />
      )}

      {alertModal.isOpen && (
        <CustomAlertModal
          isOpen={alertModal.isOpen}
          onClose={closeAlert}
          message={alertModal.message}
          title={alertModal.title}
        />
      )}

      {confirmModal.isOpen && (
        <CustomConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirm}
          onConfirm={confirmModal.onConfirm}
          message={confirmModal.message}
          title={confirmModal.title}
        />
      )}
    </div>
  );
}