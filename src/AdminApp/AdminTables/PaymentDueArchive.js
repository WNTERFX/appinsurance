import PaymentArchiveController from "./TableController/PaymentArchiveController";
import "../styles/payment-table-styles.css";

export default function PaymentArchiveTable() {
  const {
    // --- Core data ---
    paymentsByPolicy,
    loadingPayments,
    sentinelRef,

    // --- Pagination & filtering ---
    totalPoliciesCount,
    rowsPerPage,
    setRowsPerPage,
    currentPage,
    setCurrentPage,
    totalPages,
    currentPolicies,
    searchTerm,
    setSearchTerm,
    selectedAgent,
    setSelectedAgent,
    selectedPartner,
    setSelectedPartner,
    uniqueAgents,
    uniquePartners,

    // --- Expand / collapse ---
    expanded,
    handleExpand,

    // --- Modals ---
    unarchiveModalOpen,
    setUnarchiveModalOpen,
    selectedPolicyForUnarchive,
    deleteModalOpen,
    setDeleteModalOpen,
    selectedPolicyForDelete,

    // --- Handlers ---
    loadPolicies,
    handleOpenUnarchiveModal,
    handleUnarchiveConfirm,
    handleOpenDeleteModal,
    handleDeleteConfirm,

    // --- Helpers ---
    calculateTotalPenalties,
    calculateTotalDue,
    calculateTotalPaid,
    getPaymentStatus,

    // --- UI state ---
    isLoading,
  } = PaymentArchiveController();

  const renderPolicies = currentPolicies || [];

  return (
    <div className="payments-overview-section">
      {/* UNARCHIVE MODAL */}
      {unarchiveModalOpen && selectedPolicyForUnarchive && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
            <h3>Un-Archive All Payments</h3>
            <p>Are you sure you want to un-archive all payments for this policy?</p>
            <p><strong>Policy ID:</strong> {selectedPolicyForUnarchive.policy.internal_id}</p>
            <div className="modal-actions">
              <button onClick={handleUnarchiveConfirm} style={{ backgroundColor: '#28a745' }}>
                Yes, Un-Archive
              </button>
              <button onClick={() => setUnarchiveModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && selectedPolicyForDelete && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
            <h3>Delete All Payments</h3>
            <p style={{ color: '#dc3545', fontWeight: 'bold' }}>⚠️ WARNING: Cannot be undone!</p>
            <p>Delete all payments for this policy?</p>
            <p><strong>Policy ID:</strong> {selectedPolicyForDelete.policy.internal_id}</p>
            <div className="modal-actions">
              <button onClick={handleDeleteConfirm} style={{ backgroundColor: '#dc3545' }}>
                Yes, Delete
              </button>
              <button onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="payments-overview-header">
      <h2>Archived Payments ({totalPoliciesCount})</h2>
      
      <div className="search-filter-refresh-bar" style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center', 
        flexWrap: 'wrap' 
      }}>
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by Policy ID or Client Name..."
          value={searchTerm}
          onChange={(e) => { 
            setSearchTerm(e.target.value); 
            setCurrentPage(1); 
          }}
          className="search-input"
          style={{ flex: '1 1 200px', minWidth: '200px' }}
        />
        
        {/* Agent Filter */}
        <div style={{ flex: '0 0 auto' }}>
          <select
            value={selectedAgent || ''}
            onChange={(e) => {
              setSelectedAgent(e.target.value || null);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              fontSize: '0.95em',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              backgroundColor: 'white',
              minWidth: '180px'
            }}
          >
            <option value="">All Agents</option>
            {uniqueAgents.map((agent, index) => (
              <option key={index} value={agent}>
                {agent}
              </option>
            ))}
          </select>
        </div>
        
        {/* Partner Filter */}
        <div style={{ flex: '0 0 auto' }}>
          <select
            value={selectedPartner || ''}
            onChange={(e) => {
              setSelectedPartner(e.target.value || null);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              fontSize: '0.95em',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              backgroundColor: 'white',
              minWidth: '180px'
            }}
          >
            <option value="">All Partners</option>
            {uniquePartners.map((partner, index) => (
              <option key={index} value={partner}>
                {partner}
              </option>
            ))}
          </select>
        </div>
        
        {/* Results per page */}
        <div className="result-select-wrapper" style={{ flex: '0 0 auto' }}>
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
        
        {/* Refresh Button */}
        <button 
          className="refresh-btn" 
          onClick={loadPolicies} 
          disabled={isLoading}
          style={{ flex: '0 0 auto' }}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>

      {/* Policies List */}
      <div className="policies-list">
        {isLoading && renderPolicies.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>Loading archived payments...</p>
        ) : (
          renderPolicies.map(policy => {
          const client = policy?.clients_Table;
          const clientName = client
            ? [
                client.prefix, 
                client.first_Name, 
                client.middle_Name ? client.middle_Name.charAt(0) + "." : "", 
                client.family_Name, 
                client.suffix
              ].filter(Boolean).join(" ")
            : "Unknown Client";
          
          // Get payments from lazy-loaded store (empty until expanded)
          const payments = paymentsByPolicy[policy.id] || [];
          const isOpen = expanded[policy.id];
          const isLoadingForPolicy = loadingPayments[policy.id];

          return (
            <div key={policy.id} className="policy-item-card">
              <div className="policy-summary" onClick={() => handleExpand(policy.id)}>
                <div className="policy-info-left">
                  <span className="policy-id">Policy ID: {policy.internal_id}</span>
                  <span className="policy-holder">Holder: {clientName}</span>
                </div>
                <div className="policy-info-right">
                  <span className="status inactive">Archived</span>
                  <button className={`expand-toggle ${isOpen ? "expanded" : ""}`}>
                    <span className="arrow">⌄</span>
                  </button>
                </div>
              </div>

              <div className={`payment-details-table-wrapper ${isOpen ? "show" : ""}`}>
                <div className="client-info-section">
                  <h4 className="client-info-title">Client Information</h4>
                  <div className="client-info-grid">
                    <div><strong>Client Name:</strong> {clientName}</div>
                    <div><strong>Client Internal ID:</strong> {client?.internal_id || "N/A"}</div>
                    <div><strong>Agent:</strong> {(() => {
                      const agentAccounts = client?.employee_Accounts;
                      if (agentAccounts && Array.isArray(agentAccounts) && agentAccounts.length > 0) {
                        const agent = agentAccounts[0];
                        return `${agent.first_name || ""} ${agent.last_name || ""}`.trim() || "N/A";
                      } else if (agentAccounts && !Array.isArray(agentAccounts)) {
                        return `${agentAccounts.first_name || ""} ${agentAccounts.last_name || ""}`.trim() || "N/A";
                      }
                      return "N/A";
                    })()}</div>
                    <div><strong>Partner:</strong> {(() => {
                      const partners = policy.insurance_Partners;
                      if (partners && Array.isArray(partners) && partners.length > 0) {
                        return partners[0].insurance_Name || "N/A";
                      } else if (partners && !Array.isArray(partners)) {
                        return partners.insurance_Name || "N/A";
                      }
                      return "N/A";
                    })()}</div>
                  </div>
                </div>

                <div className="payment-header-with-button">
                  <h3 className="payment-details-title">Archived Payments</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleOpenUnarchiveModal(policy, payments); 
                      }} 
                      className="generate-payment-btn"
                      disabled={isLoadingForPolicy || payments.length === 0}
                    >
                      Un-Archive All
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleOpenDeleteModal(policy, payments); 
                      }} 
                      className="archive-all-btn"
                      disabled={isLoadingForPolicy || payments.length === 0}
                    >
                      Delete All
                    </button>
                  </div>
                </div>

                {/* Loading indicator */}
                {isLoadingForPolicy && (
                  <p style={{ padding: '12px' }}>Loading payments...</p>
                )}

                {/* Payments Table */}
                {!isLoadingForPolicy && payments.length > 0 ? (
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Payment Date</th>
                        <th>Base Amount</th>
                        <th>Penalties</th>
                        <th>Total Due</th>
                        <th>Paid Amount</th>
                        <th>Payment Mode</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => {
                        const totalPenalties = calculateTotalPenalties(p);
                        const totalDue = calculateTotalDue(p);
                        const totalPaid = calculateTotalPaid(p);
                        const status = getPaymentStatus(p);

                        return (
                          <tr key={p.id} className={`payment-${status}`}>
                            <td>
                              {new Date(p.payment_date).toLocaleDateString("en-US", { 
                                month: "long", 
                                day: "numeric", 
                                year: "numeric" 
                              })}
                            </td>
                            <td>
                              {parseFloat(p.amount_to_be_paid || 0).toLocaleString(undefined, { 
                                style: "currency", 
                                currency: "PHP" 
                              })}
                            </td>
                            <td>
                              {totalPenalties.toLocaleString(undefined, { 
                                style: "currency", 
                                currency: "PHP" 
                              })}
                            </td>
                            <td>
                              {totalDue.toLocaleString(undefined, { 
                                style: "currency", 
                                currency: "PHP" 
                              })}
                            </td>
                            <td>
                              {totalPaid.toLocaleString(undefined, { 
                                style: "currency", 
                                currency: "PHP" 
                              })}
                            </td>
                            <td>{p.payment_mode?.payment_mode_name || "N/A"}</td>
                            <td className="payment-status-cell">{status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  !isLoadingForPolicy && (
                    <p className="no-payments-message">No payments found</p>
                  )
                )}
              </div>
            </div>
          );
        }))
        }
        
        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}