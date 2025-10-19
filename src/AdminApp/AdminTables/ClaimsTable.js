import { useEffect, useState } from "react";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import { 
  fetchClaims, 
  updateClaimToUnderReview,
  updateClaimToRejected,
  updateClaimToApproved,
  updateClaim
} from "../AdminActions/ClaimsTableActions";
import EditClaimsModal from "../AdminForms/EditClaimsModal";
import ViewClaimModal from "../AdminForms/ViewClaimModal";
import "../styles/claims-table-styles.css";

export default function ClaimsTable() {
  const [policies, setPolicies] = useState([]);
  const [claimsMap, setClaimsMap] = useState({});
  const [expanded, setExpanded] = useState({});
  const [editingClaim, setEditingClaim] = useState(null);
  const [viewingClaim, setViewingClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadClaimsData();
  }, []);

  const loadClaimsData = async () => {
    setLoading(true);
    try {
      const allClaims = await fetchClaims();
      
      if (!allClaims || allClaims.length === 0) {
        console.log("No claims data available");
        setPolicies([]);
        setClaimsMap({});
        setLoading(false);
        return;
      }

      const claimsByPolicy = {};
      allClaims.forEach(claim => {
        if (!claimsByPolicy[claim.policy_id]) {
          claimsByPolicy[claim.policy_id] = [];
        }
        claimsByPolicy[claim.policy_id].push(claim);
      });
      
      setClaimsMap(claimsByPolicy);

      const uniquePolicies = {};
      allClaims.forEach(claim => {
        if (claim.policy_Table && !uniquePolicies[claim.policy_id]) {
          uniquePolicies[claim.policy_id] = {
            id: claim.policy_id,
            internal_id: claim.policy_Table.internal_id,
            clients_Table: claim.policy_Table.clients_Table,
            policy_Table: claim.policy_Table,
          };
        }
      });
      
      setPolicies(Object.values(uniquePolicies));

    } catch (error) {
      console.error("Error loading claims:", error);
      setPolicies([]);
      setClaimsMap({});
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleClaimAction = async (claim, actionType, policyId) => {
    try {
      if (actionType === 'edit') {
        // Check if claim is in Pending status
        if (!claim.status || claim.status === 'Pending') {
          alert('Cannot edit claim in Pending status. Please set it to "Under Review" first.');
          return;
        }
        
        // Allow editing for all statuses except Pending
        setEditingClaim(claim);
      } else if (actionType === 'archive') {
        console.log(`Archiving claim ${claim.id}`);
        alert(`Claim ${claim.id} archived! (Action Simulated)`);
        loadClaimsData();
      } else if (actionType === 'view') {
        const policy = policies.find(p => p.id === policyId);
        const claimsForPolicy = claimsMap[policyId] || [];
        
        setViewingClaim({
          policy: policy,
          claims: claimsForPolicy
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
    if (!window.confirm('Do you want to set this Policy Claim to Under Review?')) return;
    
    try {
      await updateClaimToUnderReview(policyId);
      await loadClaimsData(); // Reload data immediately
      alert(`Claims for Policy ${policyId} set to Under Review!`);
    } catch (error) {
      console.error('Error setting Under Review:', error);
      alert('Failed to update claim status.');
    }
  };

  const handleRejectClaim = async (policyId) => {
    const claimsForPolicy = claimsMap[policyId] || [];
    const missingApprovedAmount = claimsForPolicy.some(c => !c.approved_amount);

    if (missingApprovedAmount) {
      alert('Cannot reject: One or more claims are missing an Approved Amount. Please edit the claims to add approved amounts first.');
      return;
    }

    if (!window.confirm('Are you sure you want to reject these claims?')) return;
    
    try {
      await updateClaimToRejected(policyId);
      await loadClaimsData(); // Reload data immediately
      alert(`Claims for Policy ${policyId} have been rejected.`);
    } catch (error) {
      console.error('Error rejecting claims:', error);
      alert('Failed to reject claims.');
    }
  };

  const handleApproveClaim = async (policyId) => {
    const claimsForPolicy = claimsMap[policyId] || [];
    const missingApprovedAmount = claimsForPolicy.some(c => !c.approved_amount);

    if (missingApprovedAmount) {
      alert('Cannot approve: One or more claims are missing an Approved Amount. Please edit the claims to add approved amounts.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to approve these claims?')) return;
    
    try {
      await updateClaimToApproved(policyId);
      await loadClaimsData(); // Reload data immediately
      alert(`Claims for Policy ${policyId} have been approved!`);
    } catch (error) {
      console.error('Error approving claims:', error);
      alert('Failed to approve claims.');
    }
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

  const totalClaimsCount = filteredPolicies.length;
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentPolicies = filteredPolicies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPolicies.length / rowsPerPage);

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
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="search-input"
          />
          <div className="result-select-wrapper">
            <span>Result</span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="result-select"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <button className="refresh-btn" onClick={loadClaimsData}>Refresh</button>
        </div>
      </div>

      <div className="policies-list">
        {currentPolicies.map(policy => {
          const client = policy.clients_Table;
          const clientName = client
            ? [client.prefix, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name, client.suffix]
              .filter(Boolean)
              .join(" ")
            : "Unknown Client";
          const clientInternalId = client?.internal_id || "N/A";

          const claimsForPolicy = claimsMap[policy.id] || [];
          const isOpen = expanded[policy.id];

          const isFinalized = claimsForPolicy.some(c => c.status === 'Approved' || c.status === 'Rejected');

          let overallStatus = 'Pending';
          if (claimsForPolicy.length > 0) {
            const statuses = claimsForPolicy.map(c => c.status || 'Pending');
            if (statuses.includes('Under Review')) {
              overallStatus = 'Under Review';
            } else if (statuses.every(s => s === 'Approved')) {
              overallStatus = 'Approved';
            } else if (statuses.some(s => s === 'Rejected')) {
              overallStatus = 'Rejected';
            }
          }

          // Check if status is Pending (to show Under Review button)
          const showUnderReviewButton = overallStatus === 'Pending';

          return (
            <div key={policy.id} className="policy-item-card">
              <div className="policy-summary" onClick={() => toggleExpand(policy.id)}>
                <div className="policy-info-left">
                  <span className="policy-id">Policy ID: {policy.internal_id}</span>
                  <span className="policy-holder">Policy Holder: {clientName}</span>
                </div>
                <div className="policy-info-right">
                  <span className={`status ${overallStatus.toLowerCase().replace(' ', '-')}`}>
                    Status: {overallStatus}
                  </span>
                  <button className={`expand-toggle ${isOpen ? "expanded" : ""}`}>
                    <span className="arrow">⌄</span>
                  </button>
                </div>
              </div>

              <div className={`claim-details-table-wrapper ${isOpen ? "show" : ""}`}>
                <h3 className="claim-details-title">Claims</h3>
                {claimsForPolicy.length > 0 ? (
                  <table className="claims-table">
                    <thead>
                      <tr>
                        <th>Type of Incident</th>
                        <th>Phone Number</th>
                        <th>Location of Incident</th>
                        <th>Incident Date</th>
                        <th>Claim Date</th>
                        <th>Estimate Amount</th>
                        <th>Approved Amount</th>
                        <th>Documents</th>
                        <th>Description</th>
                        <th>Message</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimsForPolicy.map(claim => (
                        <tr key={claim.id}>
                          <td>{claim.type_of_incident || "N/A"}</td>
                          <td>{claim.phone_number || "N/A"}</td>
                          <td>{claim.location_of_incident || "N/A"}</td>
                          <td>{formatDate(claim.incident_date)}</td>
                          <td>{formatDate(claim.claim_date)}</td>
                          <td>{formatCurrency(claim.estimate_amount)}</td>
                          <td>{formatCurrency(claim.approved_amount)}</td>
                          <td>
                            {claim.documents && Array.isArray(claim.documents) && claim.documents.length > 0
                              ? `${claim.documents.length} file(s)` 
                              : "None"}
                          </td>
                          <td>{claim.description_of_incident || "No description"}</td>
                          <td>{claim.message || "-"}</td>
                          <td className="claim-actions-cell">
                            <button 
                              onClick={() => handleClaimAction(claim, 'edit', policy.id)} 
                              className="edit-claim-btn"
                              disabled={!claim.status || claim.status === 'Pending' || claim.status === 'Approved' || claim.status === 'Rejected'}
                              style={{
                                opacity: (!claim.status || claim.status === 'Pending' || claim.status === 'Approved' || claim.status === 'Rejected') ? 0.5 : 1,
                                cursor: (!claim.status || claim.status === 'Pending' || claim.status === 'Approved' || claim.status === 'Rejected') ? 'not-allowed' : 'pointer'
                              }}
                              title={
                                (!claim.status || claim.status === 'Pending') ? 'Cannot edit - Status is Pending' :
                                (claim.status === 'Approved' || claim.status === 'Rejected') ? `Cannot edit - Status is ${claim.status}` :
                                'Edit claim'
                              }
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleClaimAction(claim, 'archive', policy.id)} 
                              className="archive-claim-btn"
                            >
                              Archive
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="no-claims-message">No claims for this policy</p>}

                <div className="claim-summary-actions">
                  <button 
                    className="view-claim-btn" 
                    onClick={() => handleClaimAction(claimsForPolicy[0], 'view', policy.id)}
                  >
                    View Claim
                  </button>
                  {!isFinalized && (
                    <>
                      {showUnderReviewButton && (
                        <button 
                          className="under-review-btn" 
                          onClick={() => handleUnderReview(policy.id)}
                        >
                          Under Review
                        </button>
                      )}
                      <button 
                        className="reject-claim-btn" 
                        onClick={() => handleRejectClaim(policy.id)}
                        disabled={claimsForPolicy.some(c => !c.approved_amount)}
                        style={{
                          opacity: claimsForPolicy.some(c => !c.approved_amount) ? 0.5 : 1,
                          cursor: claimsForPolicy.some(c => !c.approved_amount) ? 'not-allowed' : 'pointer'
                        }}
                        title={claimsForPolicy.some(c => !c.approved_amount) ? 'Cannot reject - Missing approved amount' : 'Reject claim'}
                      >
                        Reject Claim
                      </button>
                      <button 
                        className="approve-claim-btn" 
                        onClick={() => handleApproveClaim(policy.id)}
                        disabled={claimsForPolicy.some(c => !c.approved_amount)}
                        style={{
                          opacity: claimsForPolicy.some(c => !c.approved_amount) ? 0.5 : 1,
                          cursor: claimsForPolicy.some(c => !c.approved_amount) ? 'not-allowed' : 'pointer'
                        }}
                        title={claimsForPolicy.some(c => !c.approved_amount) ? 'Cannot approve - Missing approved amount' : 'Approve claim'}
                      >
                        Approve Claim
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)}>Next</button>
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