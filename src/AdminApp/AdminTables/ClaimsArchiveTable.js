import React, { useState } from "react";
import ClaimsArchiveController from "./TableController/ClaimsArchiveController";
import CustomConfirmModal from "../AdminForms/CustomConfirmModal";
import "../styles/claims-table-styles.css";

export default function ClaimsArchiveTable() {
  const {
    archivedClaims,
    loading,
    searchTerm,
    setSearchTerm,
    handleUnarchive,
    handleRefresh,
    currentPage,
    totalPages,
    handlePageChange,
    rowsPerPage,
    setRowsPerPage,
  } = ClaimsArchiveController();

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    title: "Confirm",
    onConfirm: null
  });

  // Handle unarchive with modal
  const handleUnarchiveClick = (claimId) => {
    setConfirmModal({
      isOpen: true,
      message: "Proceed to unarchive this claim?",
      title: "Unarchive Claim",
      onConfirm: () => handleUnarchive(claimId)
    });
  };

  // Close confirm modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      message: "",
      title: "Confirm",
      onConfirm: null
    });
  };

  return (
    <div className="claims-overview-section">
      <div className="claims-overview-header">
        <h2>Archived Claims</h2>
        <div className="search-filter-refresh-bar">
          {/* 🔍 Search */}
          <input
            type="text"
            className="search-input"
            placeholder="Search by policy number, policy holder, status, or incident type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* 📄 Results per page */}
          <div className="result-select-wrapper">
            <label htmlFor="rowsPerPage" className="result-label">
              Result
            </label>
            <select
              id="rowsPerPage"
              className="result-select"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* 🔄 Refresh button */}
          <button className="refresh-btn" onClick={handleRefresh}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="no-claims-message">Loading archived claims...</div>
      ) : archivedClaims.length === 0 ? (
        <div className="no-claims-message">No archived claims found.</div>
      ) : (
        <table className="claims-table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Policy Number</th>
              <th>Policy Holder</th>
              <th>Type of Incident</th>
              <th>Claim Amount</th>
              <th>Status</th>
              <th>Claim Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {archivedClaims.map((claim) => (
              <tr key={claim.id}>
                <td>{claim.id}</td>
                <td>{claim.policy_internal_id || "—"}</td>
                <td>{claim.policy_holder_name || "—"}</td>
                <td>{claim.type_of_incident || "N/A"}</td>
                <td>
                  {claim.approved_amount
                    ? `₱${claim.approved_amount.toLocaleString()}`
                    : "N/A"}
                </td>
                <td>
                  <span className={`claim-status-badge ${claim.status?.toLowerCase().replace(/\s+/g, "-") || ""}`}>
                    {claim.status || "N/A"}
                  </span>
                </td>
                <td>
                  {claim.claim_date
                    ? new Date(claim.claim_date).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="claim-actions-cell">
                  <button
                    className="edit-claim-btn"
                    onClick={() => handleUnarchiveClick(claim.id)}
                  >
                    Unarchive
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      <CustomConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        title={confirmModal.title}
      />
    </div>
  );
}