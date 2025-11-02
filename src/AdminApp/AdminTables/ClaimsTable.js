// admin side
import { useEffect, useState } from "react";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import {
  fetchClaims,
  updateClaim,
  archiveClaim
} from "../AdminActions/ClaimsTableActions";
import EditClaimsModal from "../AdminForms/EditClaimsModal";
import ViewClaimModal from "../AdminForms/ViewClaimModal";
import "../styles/claims-table-styles.css";

export default function ClaimsTable() {
  const [policies, setPolicies] = useState([]);
  const [policyClaimsMap, setPolicyClaimsMap] = useState({});
  const [loadingClaims, setLoadingClaims] = useState({});
  const [expanded, setExpanded] = useState({});
  const [editingClaim, setEditingClaim] = useState(null);
  const [viewingClaim, setViewingClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedClaims, setSelectedClaims] = useState({});

  useEffect(() => {
    loadClaimsData();
  }, []);

  const loadClaimsData = async () => {
    setLoading(true);
    try {
      const allClaims = await fetchClaims();
      if (!allClaims || allClaims.length === 0) {
        setPolicies([]);
        setPolicyClaimsMap({});
        setLoading(false);
        return;
      }

      // Filter out archived claims FIRST
      const nonArchivedClaims = allClaims.filter(claim => !claim.is_archived);

      // Build unique policies from non-archived claims only
      const uniquePolicies = {};
      nonArchivedClaims.forEach(claim => {
        if (claim.policy_Table && !uniquePolicies[claim.policy_id]) {
          uniquePolicies[claim.policy_id] = {
            id: claim.policy_id,
            internal_id: claim.policy_Table.internal_id,
            clients_Table: claim.policy_Table.clients_Table,
          };
        }
      });

      setPolicies(Object.values(uniquePolicies));
      setPolicyClaimsMap({});
    } catch (error) {
      console.error("Error loading claims:", error);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClaimsForPolicy = async (policyId) => {
    setLoadingClaims(prev => ({ ...prev, [policyId]: true }));
    try {
      const allClaims = await fetchClaims();
      const claimsForPolicy = allClaims.filter(
        c => c.policy_id === policyId && !c.is_archived
      );
      setPolicyClaimsMap(prev => ({
        ...prev,
        [policyId]: claimsForPolicy,
      }));
    } catch (err) {
      console.error("Error fetching claims for policy:", err);
    } finally {
      setLoadingClaims(prev => ({ ...prev, [policyId]: false }));
    }
  };

  const toggleExpand = async (policyId) => {
    setExpanded(prev => ({ ...prev, [policyId]: !prev[policyId] }));
    if (!policyClaimsMap[policyId] || policyClaimsMap[policyId].length === 0) {
      await loadClaimsForPolicy(policyId);
    }

  };

  const handleClaimAction = async (claim, actionType, policyId) => {
    try {
      if (actionType === 'edit') {
        if (!claim.status || claim.status === 'Pending') {
          alert('Cannot edit claim in Pending status. Please set it to "Under Review" first.');
          return;
        }
        setEditingClaim(claim);
      } else if (actionType === 'archive') {
        if (!window.confirm(`Are you sure you want to archive Claim ${claim.id}?`)) return;
        try {
          await archiveClaim(claim.id);
          alert(`Claim ${claim.id} has been archived successfully.`);
          loadClaimsData();
        } catch (error) {
          console.error("Error archiving claim:", error);
          alert("Failed to archive claim.");
        }
      } else if (actionType === 'view') {
        const policy = policies.find(p => p.id === policyId);
        setViewingClaim({
          policy: policy,
          claims: [claim],
        });
      }
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      alert(`Failed to ${actionType} claim.`);
    }
  };

  const handleSaveEdit = async (claimId, updatedData) => {
    try {
      await updateClaim(claimId, updatedData);
      alert('Claim updated successfully!');
      setEditingClaim(null);
      loadClaimsData();
    } catch (error) {
      console.error('Error updating claim:', error);
      alert('Failed to update claim.');
    }
  };

  const handleUnderReview = async (policyId) => {
    const selectedClaimId = selectedClaims[policyId];
    if (!selectedClaimId) {
      alert('Please select a claim first.');
      return;
    }
    if (!window.confirm('Do you want to set this Claim to Under Review?')) return;

    try {
      const updateData = {
        status: 'Under Review',
        under_review_date: new Date().toISOString().split('T')[0],
      };
      await updateClaim(selectedClaimId, updateData);
      await loadClaimsData();
      alert(`Claim ${selectedClaimId} set to Under Review!`);
    } catch (error) {
      console.error('Error setting Under Review:', error);
      alert('Failed to update claim status.');
    }
  };

  const handleRejectClaim = async (policyId) => {
    const selectedClaimId = selectedClaims[policyId];
    if (!selectedClaimId) {
      alert('Please select a claim first.');
      return;
    }
    if (!window.confirm('Are you sure you want to reject this claim?')) return;

    try {
      const updateData = {
        status: 'Rejected',
        reject_claim_date: new Date().toISOString().split('T')[0],
        is_approved: false,
      };
      await updateClaim(selectedClaimId, updateData);
      await loadClaimsData();
      alert(`Claim ${selectedClaimId} has been rejected.`);
    } catch (error) {
      console.error('Error rejecting claim:', error);
      alert('Failed to reject claim.');
    }
  };

  const handleApproveClaim = async (policyId) => {
    const selectedClaimId = selectedClaims[policyId];
    if (!selectedClaimId) {
      alert('Please select a claim first.');
      return;
    }
    const claimsForPolicy = policyClaimsMap[policyId] || [];
    const selectedClaim = claimsForPolicy.find(c => c.id === selectedClaimId);
    if (!selectedClaim) {
      alert('Selected claim not found.');
      return;
    }
    if (!window.confirm('Are you sure you want to approve this claim?')) return;

    try {
      const updateData = {
        status: 'Approved',
        approved_claim_date: new Date().toISOString().split('T')[0],
        is_approved: true,
      };
      await updateClaim(selectedClaimId, updateData);
      await loadClaimsData();
      alert(`Claim ${selectedClaimId} has been approved!`);
    } catch (error) {
      console.error('Error approving claim:', error);
      alert('Failed to approve claim.');
    }
  };

  const handleCompleted = async (policyId) => {
    const selectedClaimId = selectedClaims[policyId];
    if (!selectedClaimId) {
      alert('Please select a claim first.');
      return;
    }
    if (!window.confirm('Mark this claim as completed?')) return;

    try {
      const updateData = {
        status: 'Completed',
        completed_date: new Date().toISOString().split('T')[0]
      };
      await updateClaim(selectedClaimId, updateData);
      await loadClaimsData();
      alert('Claim marked as completed!');
    } catch (error) {
      console.error('Error marking claim as completed:', error);
      alert('Failed to mark claim as completed.');
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

  const filteredPolicies = policies.filter(policy => {
    const client = policy.clients_Table;
    const clientName = client
      ? [client.prefix, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name, client.suffix]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      : "";
    const policyId = policy.internal_id?.toLowerCase() || "";
    const search = searchTerm.toLowerCase().trim();
    return policyId.includes(search) || clientName.includes(search);
  });

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentPolicies = filteredPolicies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPolicies.length / rowsPerPage);

  const totalClaimsCount = currentPolicies.reduce((count, policy) => {
    const claimsForPolicy = policyClaimsMap[policy.id] || [];
    const activeClaims = claimsForPolicy.filter(c => c.status !== 'Completed' && c.status !== 'Rejected');
    return count + activeClaims.length;
  }, 0);

  if (loading) {
    return (
      <div className="claims-overview-section">
        <p style={{ textAlign: 'center', padding: '20px', fontSize: '16px' }}>Loading claims data...</p>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="claims-overview-section">
        <div className="claims-overview-header">
          <h2>Claims Overview (0)</h2>
          <button className="refresh-btn" onClick={loadClaimsData}>Refresh</button>
        </div>
        <p style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
          No data in claims
        </p>
      </div>
    );
  }


  return (
    <div className="claims-overview-section">
      <div className="claims-overview-header">
        <h2>Claims Overview ({totalClaimsCount})</h2>
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

      <div className="policies-list">
        {currentPolicies.map((policy) => {
          const client = policy.clients_Table;
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

          const claimsForPolicy = policyClaimsMap[policy.id] || [];
          const isOpen = expanded[policy.id];

          const activeClaimsForPolicy = claimsForPolicy.filter(
            (c) => c.status !== "Completed" && c.status !== "Rejected"
          );
          const policyClaimsCount = activeClaimsForPolicy.length;

          const selectedClaimId = selectedClaims[policy.id];
          const selectedClaim = selectedClaimId
            ? claimsForPolicy.find((c) => c.id === selectedClaimId)
            : null;

          let overallStatus = "Pending";
          const nonCompletedClaims = claimsForPolicy.filter(
            (c) => c.status !== "Completed"
          );
          if (nonCompletedClaims.length > 0) {
            const statuses = nonCompletedClaims.map((c) => c.status || "Pending");
            if (statuses.includes("Under Review")) {
              overallStatus = "Under Review";
            } else if (statuses.every((s) => s === "Approved")) {
              overallStatus = "Approved";
            } else if (statuses.some((s) => s === "Rejected")) {
              overallStatus = "Rejected";
            }
          }

          const isClaimSelected = !!selectedClaim;
          const claimStatus = selectedClaim?.status || "Pending";
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
            } else if (claimStatus === "Rejected" || claimStatus === "Completed") {
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
            <div key={policy.id} className="policy-item-card">
              <div className="policy-summary" onClick={() => toggleExpand(policy.id)}>
                <div className="policy-info-left">
                  <span className="policy-id">Policy ID: {policy.internal_id}</span>
                  <span className="policy-holder">Policy Holder: {clientName}</span>
                </div>
                <div className="policy-info-right">
                  <button className={`expand-toggle ${isOpen ? "expanded" : ""}`}>
                    <span className="arrow">⌄</span>
                  </button>
                </div>
              </div>

              <div className={`claim-details-table-wrapper ${isOpen ? "show" : ""}`}>
                <h3 className="claim-details-title">Claims</h3>

                {loadingClaims[policy.id] ? (
                  <p className="no-claims-message">Loading claims...</p>
                ) : claimsForPolicy.length > 0 ? (
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
                        <th>Message</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimsForPolicy.map((claim) => (
                        <tr key={claim.id}>
                          <td>
                            <input
                              type="radio"
                              name={`selected-claim-${policy.id}`}
                              checked={selectedClaims[policy.id] === claim.id}
                              onChange={() =>
                                setSelectedClaims((prev) => ({
                                  ...prev,
                                  [policy.id]: claim.id,
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
                          <td>{claim.message || "-"}</td>
                          <td>
                            <span
                              className={`claim-status-badge ${
                                claim.status
                                  ? claim.status.toLowerCase().replace(/\s+/g, "-")
                                  : "pending"
                              }`}
                            >
                              {claim.status || "Pending"}
                            </span>
                          </td>
                          <td className="claim-actions-cell">
                            <button
                              onClick={() =>
                                handleClaimAction(claim, "edit", policy.id)
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
                                handleClaimAction(claim, "archive", policy.id)
                              }
                              className="archive-claim-btn"
                              disabled={!isClaimSelected || selectedClaim?.id !== claim.id}
                              style={{
                                opacity:
                                  !isClaimSelected || selectedClaim?.id !== claim.id
                                    ? 0.5
                                    : 1,
                                cursor:
                                  !isClaimSelected || selectedClaim?.id !== claim.id
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                            >
                              Archive
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-claims-message">No claims for this policy</p>
                )}

                <div className="claim-summary-actions">
                  {buttons.viewClaim && (
                    <button
                      className="view-claim-btn"
                      onClick={() => handleClaimAction(selectedClaim, "view", policy.id)}
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
                      onClick={() => handleUnderReview(policy.id)}
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
                      onClick={() => handleRejectClaim(policy.id)}
                      disabled={
                        !isClaimSelected || claimStatus === "Pending" || !hasValidApprovedAmount
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
                      onClick={() => handleApproveClaim(policy.id)}
                      disabled={
                        !isClaimSelected || claimStatus === "Pending" || !hasValidApprovedAmount
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
                      onClick={() => handleCompleted(policy.id)}
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
    </div>
  );
}
