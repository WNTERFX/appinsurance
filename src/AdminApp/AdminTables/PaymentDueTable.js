
import PaymentGenerationModal from "../PaymentGenerationModal";
import "../styles/payment-table-styles.css";
import PaymentDueController from "./TableController/PaymentDueController"
import { useState } from "react";


export default function PolicyWithPaymentsList() {

 
  const calculateDailyPenalty = (baseAmount, daysOverdue) => {
    const ratePerDay = 0.01; // or whatever logic you used before
    return baseAmount * ratePerDay * daysOverdue;
  };

  // if you have renderPoliciesList() inside controller, rename to renderPolicies

  const {
    // --- Core data ---
    policies,
    paymentsMap,
    paymentsByPolicy,
    loadingPayments,
    visiblePolicies,
    sentinelRef,

    selectedPaymentMode,
    setSelectedPaymentMode,
    paymentModes,

    //search
    searchTerm,
    setSearchTerm,


    // --- Pagination & filtering ---
    totalPoliciesCount,
    rowsPerPage,
    setRowsPerPage,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredPolicies,
    currentPolicies,
    renderPoliciesList,

    // --- Expand / collapse ---
    expanded,
    setExpanded,
    expandedPolicy,
    setExpandedPolicy,
    handleExpand,
    toggleExpand,

    // --- Modals ---
    modalOpen,
    setModalOpen,
    currentPayment,
    setCurrentPayment,
    paymentInput,
    setPaymentInput,

    penaltyModalOpen,
    setPenaltyModalOpen,
    selectedPaymentForPenalty,
    setSelectedPaymentForPenalty,

    manualReference,
    setManualReference,
    editModalOpen,
    setEditModalOpen,
    paymentToEdit,
    setPaymentToEdit,
    handleOpenEditModal,
    handleEditPaymentSave,

    generateModalOpen,
    setGenerateModalOpen,
    selectedPolicy,
    setSelectedPolicy,

    archiveModalOpen,
    setArchiveModalOpen,
    selectedPaymentForArchive,
    setSelectedPaymentForArchive,

    // --- Handlers ---
    loadPolicies,
    handlePaymentClick,
    handlePaymentSave,
    handleAddPenalty,
    handlePenaltySave,
    handleGeneratePayments,
    handleOpenGenerateModal,
    handleOpenArchiveModal,
    handleArchiveConfirm,

    // --- Helpers ---
    calculateTotalPenalties,
    calculateTotalDue,
    isChequePayment,
    calculateOverdueInfo,
    calculateTotalPaid,
    hasPenaltyForToday,
    getPaymentStatus,

    // --- UI state ---
    isLoading,
    setIsLoading,
  } = PaymentDueController ();

   const renderPolicies = renderPoliciesList || [];


  return (
    <div className="payments-overview-section">
          {/* PAYMENT MODAL */}
        {modalOpen && currentPayment && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
            <h3>Enter Payment</h3>
            <p>Payment Date: {new Date(currentPayment.payment_date).toLocaleDateString()}</p>
            
            {currentPayment.payment_type_name && (
              <p style={{
                backgroundColor: isChequePayment(currentPayment) ? '#e3f2fd' : '#f5f5f5',
                padding: '8px', borderRadius: '4px', marginBottom: '10px', fontWeight: '500'
              }}>
                <strong>Payment Type:</strong> {currentPayment.payment_type_name}
                {isChequePayment(currentPayment) && ' (No penalties apply)'}
              </p>
            )}

            {/* Payment Mode Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Payment Mode: <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                value={selectedPaymentMode || ''}
                onChange={(e) => setSelectedPaymentMode(e.target.value ? Number(e.target.value) : null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '1em',
                  border: '2px solid #ced4da',
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">-- Select Payment Mode --</option>
                {paymentModes.map(mode => (
                  <option key={mode.id} value={mode.id}>
                    {mode.payment_mode_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Manual Reference Number */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                fontSize: '0.9em'
              }}>
                Reference Number (Optional)
              </label>
              <input
                type="text"
                value={manualReference}
                onChange={(e) => setManualReference(e.target.value)}
                placeholder="e.g., OR-12345, TXN-67890"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '1em',
                  border: '2px solid #ced4da',
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}
              />
              <small style={{ 
                display: 'block', 
                marginTop: '4px', 
                color: '#6c757d',
                fontSize: '0.85em'
              }}>
                Enter receipt number, OR number, or transaction reference
              </small>
            </div>
            
            {/* Payment Breakdown */}
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              border: '1px solid #dee2e6'
            }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Base Amount:</strong> {currentPayment.amount_to_be_paid?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}
              </p>
              {calculateTotalPenalties(currentPayment) > 0 && (
                <p style={{ marginBottom: '8px' }}>
                  <strong>Penalties:</strong> {calculateTotalPenalties(currentPayment).toLocaleString(undefined, { style: "currency", currency: "PHP" })}
                </p>
              )}
              <p style={{ fontSize: '1em',  marginBottom: '8px', color: '#28a745', fontWeight: '400' }}>
                <strong>Already Paid:</strong> {calculateTotalPaid(currentPayment).toLocaleString(undefined, { style: "currency", currency: "PHP" })}
              </p>
              <p style={{ 
                marginBottom: '0', 
                fontSize: '1em', 
                color: '#dc3545', 
                fontWeight: 'bold',
                paddingTop: '8px',
                borderTop: '2px solid #dee2e6'
              }}>
                <strong>Payment Remaining:</strong> {(calculateTotalDue(currentPayment) - calculateTotalPaid(currentPayment)).toLocaleString(undefined, { style: "currency", currency: "PHP" })}
              </p>
            </div>

            <p style={{ fontSize: '1em', color: '#6c757d', marginBottom: '12px' }}>
              <strong>Minimum Payment (1%):</strong> {(calculateTotalDue(currentPayment) * 0.01)?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}
            </p>

            <input 
              type="text" 
              value={paymentInput} 
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*(,\d{3})*(\.\d*)?$/.test(value)) setPaymentInput(value);
              }} 
              placeholder="Enter amount" 
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '1.1em',
                marginBottom: '12px',
                border: '2px solid #ced4da',
                borderRadius: '4px'
              }}
            />
            <div className="modal-actions">
              <button onClick={handlePaymentSave}>Save</button>
              <button onClick={() => { 
                setModalOpen(false); 
                setCurrentPayment(null); 
                setPaymentInput(""); 
                setSelectedPaymentMode(null);
                setManualReference("");
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* PENALTY MODAL */}
      {penaltyModalOpen && selectedPaymentForPenalty && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
            <h3>Add Penalty</h3>
            <p>Payment Date: {new Date(selectedPaymentForPenalty.payment_date).toLocaleDateString()}</p>
            {(() => {
              const overdueInfo = calculateOverdueInfo(selectedPaymentForPenalty);
              const penaltyAmount = calculateDailyPenalty(selectedPaymentForPenalty.amount_to_be_paid, overdueInfo.daysOverdue);
              return (
                <>
                  <p><strong>Base Amount:</strong> {selectedPaymentForPenalty.amount_to_be_paid?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</p>
                  <p><strong>Days Overdue:</strong> {overdueInfo.daysOverdue} days</p>
                  <p><strong>Penalty Rate:</strong> {overdueInfo.penaltyPercentage}%</p>
                  <p><strong>Penalty Amount:</strong> {penaltyAmount.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</p>
                </>
              );
            })()}
            <div className="modal-actions">
              <button onClick={handlePenaltySave}>Confirm & Add Penalty</button>
              <button onClick={() => { setPenaltyModalOpen(false); setSelectedPaymentForPenalty(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ARCHIVE CONFIRMATION MODAL */}
      {archiveModalOpen && selectedPaymentForArchive && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
            <h3>Archive {selectedPaymentForArchive.payments ? 'All Payments' : 'Payment'}</h3>
            <p>Are you sure you want to archive {selectedPaymentForArchive.payments ? `all ${selectedPaymentForArchive.payments.length} payments` : 'this payment'}?</p>
            {selectedPaymentForArchive.payments ? (
              <>
                <p><strong>Total Payments:</strong> {selectedPaymentForArchive.payments.length}</p>
                <p><strong>All payments are fully paid</strong></p>
              </>
            ) : (
              <>
                <p>Payment Date: {new Date(selectedPaymentForArchive.payment_date).toLocaleDateString()}</p>
                <p>Amount: {selectedPaymentForArchive.amount_to_be_paid?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</p>
              </>
            )}
            <p style={{ color: '#666', fontSize: '0.9em', marginTop: '10px' }}>Note: Archived payments can be restored from the archived payments section.</p>
            <div className="modal-actions">
              <button onClick={handleArchiveConfirm} style={{ backgroundColor: '#ff6b6b' }}>Yes, Archive</button>
              <button onClick={() => { setArchiveModalOpen(false); setSelectedPaymentForArchive(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PAYMENT MODAL */}
        {editModalOpen && paymentToEdit && (
          <div className="payment-modal-backdrop">
            <div className="payment-modal">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Edit Payment Details
              </h3>
              
              {/* Payment Info (Read-only) */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                border: '1px solid #dee2e6'
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.9em' }}>
                  <strong>Payment Date:</strong> {new Date(paymentToEdit.payment_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.9em' }}>
                  <strong>Amount Paid:</strong> {paymentToEdit.paid_amount?.toLocaleString(undefined, { 
                    style: "currency", 
                    currency: "PHP" 
                  })}
                </p>
                <p style={{ margin: '0', fontSize: '0.9em' }}>
                  <strong>Payment Type:</strong> {paymentToEdit.payment_type_name}
                </p>
              </div>

              {/* Editable: Payment Mode */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '0.9em'
                }}>
                  Payment Mode: <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={selectedPaymentMode || ''}
                  onChange={(e) => setSelectedPaymentMode(e.target.value ? Number(e.target.value) : null)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '1em',
                    border: '2px solid #ced4da',
                    borderRadius: '4px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">-- Select Payment Mode --</option>
                  {paymentModes.map(mode => (
                    <option key={mode.id} value={mode.id}>
                      {mode.payment_mode_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Editable: Manual Reference */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '0.9em'
                }}>
                  Reference Number (Optional)
                </label>
                <input
                  type="text"
                  value={manualReference}
                  onChange={(e) => setManualReference(e.target.value)}
                  placeholder="e.g., OR-12345, TXN-67890"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '1em',
                    border: '2px solid #ced4da',
                    borderRadius: '4px',
                    backgroundColor: 'white'
                  }}
                />
                <small style={{ 
                  display: 'block', 
                  marginTop: '4px', 
                  color: '#6c757d',
                  fontSize: '0.85em'
                }}>
                  Update or add a reference number for this payment
                </small>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button onClick={handleEditPaymentSave}>Save Changes</button>
                <button onClick={() => {
                  setEditModalOpen(false);
                  setPaymentToEdit(null);
                  setManualReference("");
                  setSelectedPaymentMode(null);
                }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      {/* PAYMENT GENERATION MODAL */}
      {generateModalOpen && selectedPolicy && (
        <PaymentGenerationModal 
          policy={selectedPolicy} 
          onClose={() => { 
            setGenerateModalOpen(false); 
            setSelectedPolicy(null); 
          }} 
          onGenerate={handleGeneratePayments}
        />
      )}
      <div className="payments-overview-header">
        <h2>Payments Overview ({totalPoliciesCount})</h2>
        <div className="search-filter-refresh-bar">
          <input type="text" placeholder="Search by Policy ID or Client Name..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="search-input" />
          <div className="result-select-wrapper">
            <span>Result</span>
            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="result-select">
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <button className="refresh-btn" onClick={loadPolicies} disabled={isLoading}>{isLoading ? "Refreshing..." : "Refresh"}</button>
        </div>
      </div>

      {/* Policies list */}
      <div className="policies-list">
        {renderPolicies.map(policy => {
          const client = policy.clients_Table;
          const clientName = client ? [client.prefix, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name, client.suffix].filter(Boolean).join(" ") : "Unknown Client";
          const clientInternalId = client?.internal_id || "N/A";
          const agentName = client?.employee_Accounts
            ? `${client.employee_Accounts.first_name || ""} ${client.employee_Accounts.last_name || ""}`.trim()
            : "N/A";

          const partnerName = policy.insurance_Partners?.insurance_Name || "N/A";

          // payments: prefer lazy-loaded store, fallback to paymentsMap (older code)
          const payments = paymentsByPolicy[policy.id] || paymentsMap[policy.id] || [];
          const isOpen = !!expanded[policy.id];
          const isLoadingForPolicy = !!loadingPayments[policy.id];

          return (
            <div key={policy.id} className="policy-item-card">
              <div className="policy-summary" onClick={() => handleExpand(policy.id)}>
                <div className="policy-info-left">
                  <span className="policy-id">Policy ID: {policy.internal_id}</span>
                  <span className="policy-holder">Policy Holder: {clientName}</span>
                </div>
                <div className="policy-info-right">
                  <span className={`status ${policy.policy_is_active ? "active" : "inactive"}`}>Status: {policy.policy_is_active ? "Active" : "Inactive"}</span>
                  <button className={`expand-toggle ${isOpen ? "expanded" : ""}`}><span className="arrow">⌄</span></button>
                </div>
              </div>

              <div className={`payment-details-table-wrapper ${isOpen ? "show" : ""}`}>
                <div className="client-info-section">
                  <h4 className="client-info-title">Client Information</h4>
                  <div className="client-info-grid">
                    <div><strong>Client Name:</strong> {clientName}</div>
                    <div><strong>Client Internal ID:</strong> {clientInternalId}</div>
                    <div><strong>Agent:</strong> {agentName}</div>
                    <div><strong>Partner:</strong> {partnerName}</div>
                  </div>
                </div>

                <div className="payment-header-with-button">
                  <h3 className="payment-details-title">Payments</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(() => {
                      if (!payments || payments.length === 0) return null;
                      const archivableStatuses = ["fully-paid", "refunded", "cancelled", "voided"];
                      const allArchivable = payments.every(p => archivableStatuses.includes(getPaymentStatus(p)));
                      if (!allArchivable) return null;

                      const fullyPaidCount = payments.filter(p => getPaymentStatus(p) === "fully-paid").length;
                      const refundedCount = payments.filter(p => getPaymentStatus(p) === "refunded").length;
                      const cancelledCount = payments.filter(p => getPaymentStatus(p) === "cancelled").length;
                      const voidedCount = payments.filter(p => getPaymentStatus(p) === "voided").length;

                      const statusParts = [];
                      if (fullyPaidCount > 0) statusParts.push(`${fullyPaidCount} Paid`);
                      if (refundedCount > 0) statusParts.push(`${refundedCount} Refunded`);
                      if (cancelledCount > 0) statusParts.push(`${cancelledCount} Cancelled`);
                      if (voidedCount > 0) statusParts.push(`${voidedCount} Voided`);

                      const buttonText = `Archive All Payments (${statusParts.join(' / ')})`;

                      return (
                        <button onClick={(e) => { e.stopPropagation(); setSelectedPaymentForArchive({ policy_id: policy.id, payments }); setArchiveModalOpen(true); }} style={{ backgroundColor: '#6c757d', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                          {buttonText}
                        </button>
                      );
                    })()}
                    <button onClick={(e) => { e.stopPropagation(); handleOpenGenerateModal(policy); }} className="generate-payment-btn">+ Generate Payments</button>
                  </div>
                </div>

                {/* Loading indicator for payments */}
                {isLoadingForPolicy && <p style={{ padding: '12px' }}>Loading payments...</p>}

               {(!isLoadingForPolicy && payments && payments.length > 0) ? (
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Mode</th> {/* NEW COLUMN */}
                      <th>Penalty %</th>
                      <th>Base Amount</th>
                      <th>Penalty Amount</th>
                      <th>Total Due</th>
                      <th>Paid Amount</th>
                      <th>Status</th>
                      <th>Reference</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, index) => {
                      const status = getPaymentStatus(p);
                      const overdueInfo = calculateOverdueInfo(p);
                      const totalPenalties = calculateTotalPenalties(p);
                      const totalDue = calculateTotalDue(p);
                      const remainingBalance = totalDue - calculateTotalPaid(p);
                      const isOverdue = overdueInfo.daysOverdue > 0 && status !== "fully-paid";
                      const isCheque = isChequePayment(p);

                      const isRefunded = status === "refunded";
                      const isCancelled = status === "cancelled";
                      const isVoided = status === "voided";
                      const isSpecialStatus = isRefunded || isCancelled || isVoided;

                      const hasTodayPenalty = hasPenaltyForToday(p);

                      const previousPaymentsPaid = payments.slice(0, index).every(pay => {
                        const payStatus = getPaymentStatus(pay);
                        return payStatus === "fully-paid" || payStatus === "refunded" || payStatus === "cancelled" || payStatus === "voided";
                      });

                      const disablePayment =
                        isSpecialStatus ||
                        status === "fully-paid" ||
                        remainingBalance <= 0 ||
                        (!isCheque && isOverdue && !hasTodayPenalty) ||
                        !previousPaymentsPaid;

                      const rowStyle = {
                        backgroundColor: isRefunded ? '#e8f5e9' :
                          isVoided ? '#ffebee' :
                            isCancelled ? '#fff3e0' : 'white'
                      };

                      return (
                        <tr key={p.id} className={`payment-${status} ${!isCheque && overdueInfo.daysOverdue >= 90 && !isSpecialStatus ? 'payment-void-warning' : ''}`} style={rowStyle}>
                          <td>
                            {new Date(p.payment_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            {!isCheque && overdueInfo.daysOverdue >= 90 && !isSpecialStatus && <span className="void-warning-badge">⚠️ 90+ Days</span>}
                          </td>
                          <td>
                            {p.payment_type_name && <span style={{ backgroundColor: isCheque ? '#e3f2fd' : '#f5f5f5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: '500' }}>{p.payment_type_name}</span>}
                          </td>
                          {/* NEW: Payment Mode Column */}
                          <td>
                            {p.payment_mode_name ? (
                              <span style={{ 
                                backgroundColor: '#e8f4f8', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.85em', 
                                fontWeight: '500',
                                color: '#0277bd'
                              }}>
                                {p.payment_mode_name}
                              </span>
                            ) : (
                              <span style={{ color: '#aaa', fontSize: '0.85em' }}>N/A</span>
                            )}
                          </td>
                          <td>{!isCheque && !isSpecialStatus && overdueInfo.penaltyPercentage > 0 ? <span className={`penalty-badge ${status === "fully-paid" ? "frozen" : ""}`} title={status === "fully-paid" ? "Penalty frozen after full payment" : ""}>{overdueInfo.penaltyPercentage}%</span> : "-"}</td>
                          <td>{p.amount_to_be_paid?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</td>
                          <td>{totalPenalties > 0 ? totalPenalties.toLocaleString(undefined, { style: "currency", currency: "PHP" }) : "₱0.00"}</td>
                          <td className="total-due-cell"><strong>{isRefunded ? (<span style={{ color: '#4caf50' }}>₱0.00 (Refunded)</span>) : isVoided ? (<span style={{ color: '#f44336' }}>₱0.00 (Voided)</span>) : isCancelled ? (<span style={{ color: '#ff9800' }}>₱0.00 (Cancelled)</span>) : (totalDue.toLocaleString(undefined, { style: "currency", currency: "PHP" }))}</strong></td>
                          <td>{isRefunded ? (<span style={{ color: '#4caf50', fontWeight: '600' }}>{p.refund_amount?.toLocaleString(undefined, { style: "currency", currency: "PHP" })} (Refunded)</span>) : isVoided ? (<span style={{ color: '#f44336', fontWeight: '600' }}>₱0.00 (Voided)</span>) : isCancelled ? (<span style={{ color: '#ff9800', fontWeight: '600' }}>₱0.00 (Cancelled)</span>) : (calculateTotalPaid(p)?.toLocaleString(undefined, { style: "currency", currency: "PHP" }))}</td>
                          <td className="payment-status-cell">{isRefunded && <span className="payment-status-badge status-refunded">Refunded</span>}{isCancelled && <span className="payment-status-badge status-cancelled">Cancelled</span>}{isVoided && <span className="payment-status-badge status-voided">Voided</span>}{!isSpecialStatus && status}</td>
                       <td>
                            {p.payment_manual_reference ? (
                              // Show manual reference if it exists
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ 
                                  fontWeight: "500",
                                  color: "#2c3e50",
                                  backgroundColor: "#e8f5e9",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  fontSize: "0.85em"
                                }}>
                                  {p.payment_manual_reference}
                                </span>
                                <small style={{ color: "#6c757d", fontSize: "0.75em", marginTop: "4px" }}>
                                  Manual Reference
                                </small>
                              </div>
                            ) : p.paymongo_reference ? (
                              // Show PayMongo reference if no manual reference
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ 
                                  fontWeight: "500",
                                  color: "#1976d2",
                                  backgroundColor: "#e3f2fd",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  fontSize: "0.85em"
                                }}>
                                  {p.paymongo_reference}
                                </span>
                                {p.paymongo_checkout_url && (
                                  <a
                                    href={p.paymongo_checkout_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ 
                                      color: "#1976d2", 
                                      fontSize: "0.75em",
                                      marginTop: "4px"
                                    }}
                                  >
                                    View Checkout
                                  </a>
                                )}
                                <small style={{ color: "#6c757d", fontSize: "0.75em", marginTop: "2px" }}>
                                  PayMongo
                                </small>
                              </div>
                            ) : (
                              <span style={{ color: "#aaa" }}>N/A</span>
                            )}
                          </td>
                          <td className="payment-actions">
                            <button disabled={disablePayment} onClick={() => handlePaymentClick({ ...p, policy_id: policy.id }, client?.phone_Number)} className={`payment-btn ${disablePayment ? "disabled-btn" : ""}`} style={{ opacity: disablePayment ? 0.5 : 1, cursor: disablePayment ? "not-allowed" : "pointer" }}>
                              {isSpecialStatus ? status.charAt(0).toUpperCase() + status.slice(1) : status === "fully-paid" ? "Paid" : "Payment"}
                            </button>

                              {(status === "fully-paid" || status === "partially-paid") && !isSpecialStatus && (
                                <button 
                                  onClick={() => handleOpenEditModal({ ...p, policy_id: policy.id })} 
                                  className="penalty-btn" 
                                  title="Edit payment details"
                                  style={{ backgroundColor: '#17a2b8' }}
                                >
                                   Edit
                                </button>
                              )}


                            {!isCheque && !isSpecialStatus && isOverdue && !hasTodayPenalty && (
                              <button onClick={() => handleAddPenalty({ ...p, policy_id: policy.id })} className="penalty-btn" title="Add today's penalty">+Penalty</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (!isLoadingForPolicy && <p className="no-payments-message">No payments scheduled</p>)}
              </div>
            </div>
          );
        })}
        {/* sentinel for infinite scroll (append more policies when visible) */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

// your helper as-is
function getPaymentStatus(payment) {
  if (payment.is_refunded || payment.payment_status === "refunded") return "refunded";
  if (payment.payment_status === "cancelled") return "cancelled";
  if (payment.payment_status === "voided") return "voided";
  const paid = parseFloat(payment.paid_amount || 0);
  const due = parseFloat(payment.amount_to_be_paid || 0);
  if (paid <= 0) return "not-paid";
  if (paid < due) return "partially-paid";
  if (paid >= due) return "fully-paid";
  return "not-paid";
}
