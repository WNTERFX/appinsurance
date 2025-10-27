import { useEffect, useState } from "react";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import { fetchPaymentSchedule, updatePayment, generatePayments, archivePayment } from "../AdminActions/PaymentDueActions";
import { addPaymentPenalty, calculateDailyPenalty, hasPenaltyForToday } from "../AdminActions/PaymentPenaltyActions";
import PaymentGenerationModal from "../PaymentGenerationModal";
import "../styles/payment-table-styles.css";

export default function PolicyWithPaymentsList() {
  const [policies, setPolicies] = useState([]);
  const [paymentsMap, setPaymentsMap] = useState({});
  const [expanded, setExpanded] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [paymentInput, setPaymentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [selectedPaymentForPenalty, setSelectedPaymentForPenalty] = useState(null);

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Archive confirmation modal state
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedPaymentForArchive, setSelectedPaymentForArchive] = useState(null);

  // Constant for cheque payment type
  const CHEQUE_PAYMENT_TYPE = 2;

  useEffect(() => { loadPolicies(); }, []);

const loadPolicies = async () => {
  try {
    setIsLoading(true);
    setPolicies([]);
    setPaymentsMap({});
    const allPolicies = await fetchPolicies();
    
    const paymentsByPolicy = {};
    for (const policy of allPolicies) {
      const paymentData = await fetchPaymentSchedule(policy.id);
      // ✅ Filter out archived payments
      const nonArchivedPayments = paymentData.filter(payment => payment.is_archive !== true);
      paymentsByPolicy[policy.id] = nonArchivedPayments;
    }
    
    // ✅ Filter: Exclude archived policies AND inactive policies with no (non-archived) payments
    const filteredPolicies = allPolicies.filter(policy => {
      const isArchived = policy.is_archived === true;
      const hasNonArchivedPayments = paymentsByPolicy[policy.id]?.length > 0;
      
      // Hide archived policies
      if (isArchived) return false;
      
      // Show active policies OR inactive with non-archived payments
      return policy.policy_is_active || hasNonArchivedPayments;
    });
    
    console.log("🔍 FILTERED POLICIES:", filteredPolicies.length);
    setPolicies(filteredPolicies);
    setPaymentsMap(paymentsByPolicy);
    
  } catch (error) {
    console.error("Error loading policies or payments:", error);
  } finally {
    setIsLoading(false);
  }
};

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const calculateTotalPenalties = (payment) => {
    const penalties = payment.penalties || [];
    return penalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
  };

  const calculateTotalDue = (payment) => {
    const baseDue = parseFloat(payment.amount_to_be_paid || 0);
    const totalPenalties = calculateTotalPenalties(payment);
    return baseDue + totalPenalties;
  };

  // ✅ UPDATED: Check if payment is cheque type
  const isChequePayment = (payment) => {
    return payment.payment_type_id === CHEQUE_PAYMENT_TYPE;
  };

  // ✅ UPDATED: Exclude cheque payments from overdue calculation
  const calculateOverdueInfo = (payment) => {
    // Cheque payments are never overdue
    if (isChequePayment(payment)) {
      return { daysOverdue: 0, penaltyPercentage: 0 };
    }

    const paymentDate = new Date(payment.payment_date);
    const today = new Date();
    const isPaid = getPaymentStatus(payment) === "fully-paid";
    const penalties = payment.penalties || payment.payment_due_penalties || [];

    if (isPaid) {
      if (penalties.length > 0) {
        const lastPenalty = penalties[penalties.length - 1];
        const lastDaysOverdue = lastPenalty.not_paid_days || 0;
        const penaltyPercentage = Math.min(lastDaysOverdue, 31);
        return { daysOverdue: lastDaysOverdue, penaltyPercentage };
      }
      return { daysOverdue: 0, penaltyPercentage: 0 };
    }

    const daysOverdue = Math.floor((today - paymentDate) / (1000 * 60 * 60 * 24));
    if (daysOverdue <= 0) return { daysOverdue: 0, penaltyPercentage: 0 };

    const penaltyPercentage = Math.min(daysOverdue, 31);
    return { daysOverdue, penaltyPercentage };
  };

  const calculateTotalPaid = (payment) => {
    const basePaid = parseFloat(payment.paid_amount || 0);
    const penaltiesPaid = (payment.penalties || [])
      .filter(p => p.is_paid)
      .reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
    return basePaid + penaltiesPaid;
  };

  const handlePaymentClick = (payment, clientPhone) => {
    setCurrentPayment({ ...payment, client_phone: clientPhone, policy_id: payment.policy_id });
    setPaymentInput(String(payment?.paid_amount || ""));
    setModalOpen(true);
  };

  const handlePaymentSave = async () => {
    if (!currentPayment?.id || !currentPayment?.policy_id) return;

    try {
      const cleanedInput = parseFloat(paymentInput.replace(/,/g, ""));
      if (isNaN(cleanedInput)) {
        alert("Please enter a valid number");
        return;
      }

      const policyId = currentPayment.policy_id;
      const payments = paymentsMap[policyId] || [];

      const currentIndex = payments.findIndex(p => p.id === currentPayment.id);
      if (currentIndex === -1) return;

      const currentTotalDue = calculateTotalDue(currentPayment);
      const currentPaid = calculateTotalPaid(currentPayment);
      const currentRemaining = Math.max(currentTotalDue - currentPaid, 0);

      const totalRemainingAcrossAll = payments.reduce((sum, p) => {
        const totalDue = calculateTotalDue(p);
        const totalPaid = calculateTotalPaid(p);
        const remaining = Math.max(totalDue - totalPaid, 0);
        return sum + remaining;
      }, 0);

      if (cleanedInput > totalRemainingAcrossAll + 0.0001) {
        alert(`You cannot pay more than the total remaining balance (₱${totalRemainingAcrossAll.toLocaleString()}).`);
        return;
      }

      if (cleanedInput <= currentRemaining + 0.0001) {
        await updatePayment(currentPayment.id, cleanedInput, currentPayment.amount_to_be_paid);
      } else {
        let remainingToApply = cleanedInput;

        for (let i = currentIndex; i < payments.length && remainingToApply > 0; i++) {
          const p = payments[i];
          const totalDue = calculateTotalDue(p);
          const totalPaid = calculateTotalPaid(p);
          const remaining = Math.max(totalDue - totalPaid, 0);

          if (remaining <= 0) continue;

          const amountToPay = Math.min(remaining, remainingToApply);
          await updatePayment(p.id, amountToPay, p.amount_to_be_paid);
          remainingToApply -= amountToPay;
        }
      }

      const updatedSchedule = await fetchPaymentSchedule(policyId);
      setPaymentsMap(prev => ({
        ...prev,
        [policyId]: updatedSchedule,
      }));

      if (Math.abs(cleanedInput - totalRemainingAcrossAll) < 0.01) {
        alert("Full payment applied across remaining months!");
      } else if (cleanedInput > currentRemaining) {
        alert("Payment applied with spillover across months.");
      } else {
        alert("Payment applied successfully!");
      }

      setModalOpen(false);
      setCurrentPayment(null);
      setPaymentInput("");

    } catch (err) {
      console.error("Error updating payment:", err);
      alert("Failed to update payment. Check console for details.");
    }
  };

  // ✅ UPDATED: Prevent penalty addition for cheque payments
  const handleAddPenalty = (payment) => {
    // Cannot add penalties to cheque payments
    if (isChequePayment(payment)) {
      alert("Cheque payments are not subject to overdue penalties.");
      return;
    }

    const overdueInfo = calculateOverdueInfo(payment);
    if (overdueInfo.daysOverdue <= 0) {
      alert("This payment is not yet overdue. Penalties can only be added to overdue payments.");
      return;
    }
    setSelectedPaymentForPenalty(payment);
    setPenaltyModalOpen(true);
  };

  const handlePenaltySave = async () => {
    if (!selectedPaymentForPenalty) return;

    try {
      const overdueInfo = calculateOverdueInfo(selectedPaymentForPenalty);
      const { penaltyAmount } = await calculateDailyPenalty({
        amount_to_be_paid: selectedPaymentForPenalty.amount_to_be_paid,
        payment_date: selectedPaymentForPenalty.payment_date
      });
      const reason = `${overdueInfo.daysOverdue} day(s) overdue - ${overdueInfo.penaltyPercentage}% penalty (1% per day)`;

      const penalty = await addPaymentPenalty(
        selectedPaymentForPenalty.id,
        penaltyAmount,
        reason,
        overdueInfo.daysOverdue
      );

      try {
        const res = await fetch("https://ezmvecxqcjnrspmjfgkk.functions.supabase.co/payment_penalty_notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bXZlY3hxY2pucnNwbWpmZ2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MjUzMzMsImV4cCI6MjA3MDEwMTMzM30.M0ZsDxmJRc7EFe3uzRFmy69TymcsdwMbV54jkay29tI`
          },
          body: JSON.stringify({
            payment_id: selectedPaymentForPenalty.id,
            penalty_amount: penaltyAmount,
            penalty_reason: reason,
            not_paid_days: overdueInfo.daysOverdue,
          }),
        });

        if (res.ok) {
          console.log("✅ Penalty notification sent!");
        } else {
          console.warn("⚠️ Notification failed:", await res.text());
        }
      } catch (notifyErr) {
        console.error("Error sending penalty notification:", notifyErr);
      }

      const policyId = selectedPaymentForPenalty.policy_id;
      const updatedPayments = await fetchPaymentSchedule(policyId);
      setPaymentsMap(prev => ({ ...prev, [policyId]: updatedPayments }));

      alert("Penalty added successfully!");
      setPenaltyModalOpen(false);
      setSelectedPaymentForPenalty(null);

    } catch (err) {
      console.error("Error adding penalty:", err);
      alert("Failed to add penalty. See console for details.");
    }
  };

  const handleGeneratePayments = async (policyId, payments) => {
    try {
      const newPayments = await generatePayments(policyId, payments);
      await loadPolicies();
      alert("Payments generated successfully!");
    } catch (error) {
      console.error("Error generating payments:", error);
      throw error;
    }
  };

  const handleOpenGenerateModal = (policy) => {
    setSelectedPolicy(policy);
    setGenerateModalOpen(true);
  };

  // Archive functionality
  const handleOpenArchiveModal = (payment) => {
    setSelectedPaymentForArchive(payment);
    setArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!selectedPaymentForArchive) return;

    try {
      // Check if we're archiving multiple payments for a policy
      if (selectedPaymentForArchive.payments) {
        const { policy_id, payments } = selectedPaymentForArchive;

        if (payments.length === 0) {
          alert("No payments to archive.");
          setArchiveModalOpen(false);
          setSelectedPaymentForArchive(null);
          return;
        }

        // Archive all payments regardless of status
        for (const payment of payments) {
          await archivePayment(payment.id);
        }

        // Refresh the payment schedule
        const updatedSchedule = await fetchPaymentSchedule(policy_id);
        setPaymentsMap(prev => ({
          ...prev,
          [policy_id]: updatedSchedule,
        }));

        alert(`All ${payments.length} payments archived successfully!`);
      } else {
        // Single payment archive
        await archivePayment(selectedPaymentForArchive.id);

        const policyId = selectedPaymentForArchive.policy_id;
        const updatedSchedule = await fetchPaymentSchedule(policyId);
        setPaymentsMap(prev => ({
          ...prev,
          [policyId]: updatedSchedule,
        }));

        alert("Payment archived successfully!");
      }

      setArchiveModalOpen(false);
      setSelectedPaymentForArchive(null);
    } catch (err) {
      console.error("Error archiving payment:", err);
      alert("Failed to archive payment. Check console for details.");
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

  const totalPoliciesCount = filteredPolicies.length;
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentPolicies = filteredPolicies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPolicies.length / rowsPerPage);

  if (isLoading) return <p>Refreshing policy payments...</p>;

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
                padding: '8px', 
                borderRadius: '4px', 
                marginBottom: '10px',
                fontWeight: '500'
              }}>
                <strong>Payment Type:</strong> {currentPayment.payment_type_name}
                {isChequePayment(currentPayment) && ' (No penalties apply)'}
              </p>
            )}
            <p>
              <strong>Base Amount:</strong> {currentPayment.amount_to_be_paid?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}
            </p>

            {calculateTotalPenalties(currentPayment) > 0 && (
              <p>
                <strong>Penalties:</strong> {calculateTotalPenalties(currentPayment).toLocaleString(undefined, { style: "currency", currency: "PHP" })}
              </p>
            )}

            <p>
              <strong>Total Due:</strong> {calculateTotalDue(currentPayment).toLocaleString(undefined, { style: "currency", currency: "PHP" })}
            </p>
            <p>
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
            />
            <div className="modal-actions">
              <button onClick={handlePaymentSave}>Save</button>
              <button onClick={() => { setModalOpen(false); setCurrentPayment(null); setPaymentInput(""); }}>Cancel</button>
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
            <p style={{ color: '#666', fontSize: '0.9em', marginTop: '10px' }}>
              Note: Archived payments can be restored from the archived payments section.
            </p>
            <div className="modal-actions">
              <button onClick={handleArchiveConfirm} style={{ backgroundColor: '#ff6b6b' }}>Yes, Archive</button>
              <button onClick={() => { setArchiveModalOpen(false); setSelectedPaymentForArchive(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT GENERATION MODAL */}
      {generateModalOpen && selectedPolicy && (
        <PaymentGenerationModal
          policy={selectedPolicy}
          onClose={() => { setGenerateModalOpen(false); setSelectedPolicy(null); }}
          onGenerate={handleGeneratePayments}
        />
      )}

      <div className="payments-overview-header">
        <h2>Payments Overview ({totalPoliciesCount})</h2>
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
          <button 
            className="refresh-btn" 
            onClick={loadPolicies}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Policies list */}
      <div className="policies-list">
        {currentPolicies.map(policy => {
          const client = policy.clients_Table;
          const clientName = client
            ? [client.prefix, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name, client.suffix]
              .filter(Boolean)
              .join(" ")
            : "Unknown Client";
          const clientInternalId = client?.internal_id || "N/A";
          const payments = paymentsMap[policy.id] || [];
          const isOpen = expanded[policy.id];

          return (
            <div key={policy.id} className="policy-item-card">
              <div className="policy-summary" onClick={() => toggleExpand(policy.id)}>
                <div className="policy-info-left">
                  <span className="policy-id">Policy ID: {policy.internal_id}</span>
                  <span className="policy-holder">Policy Holder: {clientName}</span>
                </div>
                <div className="policy-info-right">
                  <span className={`status ${policy.policy_is_active ? "active" : "inactive"}`}>
                    Status: {policy.policy_is_active ? "Active" : "Inactive"}
                  </span>
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
                    <div><strong>Client Internal ID:</strong> {clientInternalId}</div>
                  </div>
                </div>

                <div className="payment-header-with-button">
                  <h3 className="payment-details-title">Payments</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(() => {
                      if (payments.length === 0) return null;

                      // ✅ FIXED: Include "voided" in archivable statuses
                      const archivableStatuses = ["fully-paid", "refunded", "cancelled", "voided"];
                      const allArchivable = payments.every(p => archivableStatuses.includes(getPaymentStatus(p)));
                      if (!allArchivable) return null;

                      // Count each type
                      const fullyPaidCount = payments.filter(p => getPaymentStatus(p) === "fully-paid").length;
                      const refundedCount = payments.filter(p => getPaymentStatus(p) === "refunded").length;
                      const cancelledCount = payments.filter(p => getPaymentStatus(p) === "cancelled").length;
                      const voidedCount = payments.filter(p => getPaymentStatus(p) === "voided").length;

                      // Build button text dynamically based on what exists
                      const statusParts = [];
                      if (fullyPaidCount > 0) statusParts.push(`${fullyPaidCount} Paid`);
                      if (refundedCount > 0) statusParts.push(`${refundedCount} Refunded`);
                      if (cancelledCount > 0) statusParts.push(`${cancelledCount} Cancelled`);
                      if (voidedCount > 0) statusParts.push(`${voidedCount} Voided`);

                      const buttonText = `Archive All Payments (${statusParts.join(' / ')})`;

                      return (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedPaymentForArchive({ policy_id: policy.id, payments }); 
                            setArchiveModalOpen(true);
                          }}
                          style={{
                            backgroundColor: '#6c757d',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          {buttonText}
                        </button>
                      );
                    })()}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenGenerateModal(policy); }}
                      className="generate-payment-btn"
                    >
                      + Generate Payments
                    </button>
                  </div>
                </div>

                {payments.length > 0 ? (
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Penalty %</th>
                        <th>Base Amount</th>
                        <th>Penalty Amount</th>
                        <th>Total Due</th>
                        <th>Paid Amount</th>
                        <th>Status</th>
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

                        // Special statuses
                        const isRefunded = status === "refunded";
                        const isCancelled = status === "cancelled";
                        const isVoided = status === "voided";
                        const isSpecialStatus = isRefunded || isCancelled || isVoided;

                        const hasTodayPenalty = hasPenaltyForToday(p);

                        const previousPaymentsPaid = payments
                          .slice(0, index)
                          .every(pay => {
                            const payStatus = getPaymentStatus(pay);
                            return payStatus === "fully-paid" || payStatus === "refunded" || payStatus === "cancelled" || payStatus === "voided";
                          });

                        const disablePayment =
                          isSpecialStatus ||
                          status === "fully-paid" ||
                          remainingBalance <= 0 ||
                          (!isCheque && isOverdue && !hasTodayPenalty) ||
                          !previousPaymentsPaid;

                        // Row background color for special statuses
                        const rowStyle = {
                          backgroundColor: isRefunded ? '#e8f5e9' : 
                                          isVoided ? '#ffebee' :
                                          isCancelled ? '#fff3e0' : 'white'
                        };

                        return (
                          <tr 
                            key={p.id} 
                            className={`
                              payment-${status} 
                              ${!isCheque && overdueInfo.daysOverdue >= 90 && !isSpecialStatus ? 'payment-void-warning' : ''}
                            `}
                            style={rowStyle}
                          >
                            {/* Payment Date */}
                            <td>
                              {new Date(p.payment_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                              {!isCheque && overdueInfo.daysOverdue >= 90 && !isSpecialStatus && (
                                <span className="void-warning-badge">⚠️ 90+ Days</span>
                              )}
                            </td>

                            {/* Payment Type */}
                            <td>
                              {p.payment_type_name && (
                                <span style={{ 
                                  backgroundColor: isCheque ? '#e3f2fd' : '#f5f5f5', 
                                  padding: '4px 8px', 
                                  borderRadius: '4px',
                                  fontSize: '0.85em',
                                  fontWeight: '500'
                                }}>
                                  {p.payment_type_name}
                                </span>
                              )}
                            </td>

                            {/* Penalty % */}
                            <td>
                              {!isCheque && !isSpecialStatus && overdueInfo.penaltyPercentage > 0 ? (
                                <span 
                                  className={`penalty-badge ${status === "fully-paid" ? "frozen" : ""}`}
                                  title={status === "fully-paid" ? "Penalty frozen after full payment" : ""}
                                >
                                  {overdueInfo.penaltyPercentage}%
                                </span>
                              ) : "-"}
                            </td>

                            {/* Base Amount */}
                            <td>{p.amount_to_be_paid?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</td>

                            {/* Penalty Amount */}
                            <td>
                              <td>
                                {totalPenalties > 0 
                                  ? totalPenalties.toLocaleString(undefined, { style: "currency", currency: "PHP" })
                                  : "₱0.00"
                                }
                              </td>
                            </td>

                            {/* Total Due */}
                            <td className="total-due-cell">
                              <strong>
                                {isRefunded ? (
                                  <span style={{ color: '#4caf50' }}>₱0.00 (Refunded)</span>
                                ) : isVoided ? (
                                  <span style={{ color: '#f44336' }}>₱0.00 (Voided)</span>
                                ) : isCancelled ? (
                                  <span style={{ color: '#ff9800' }}>₱0.00 (Cancelled)</span>
                                ) : (
                                  totalDue.toLocaleString(undefined, { style: "currency", currency: "PHP" })
                                )}
                              </strong>
                            </td>

                            {/* Paid Amount */}
                            <td>
                              {isRefunded ? (
                                <span style={{ color: '#4caf50', fontWeight: '600' }}>
                                  {p.refund_amount?.toLocaleString(undefined, { style: "currency", currency: "PHP" })} (Refunded)
                                </span>
                              ) : isVoided ? (
                                <span style={{ color: '#f44336', fontWeight: '600' }}>₱0.00 (Voided)</span>
                              ) : isCancelled ? (
                                <span style={{ color: '#ff9800', fontWeight: '600' }}>₱0.00 (Cancelled)</span>
                              ) : (
                                calculateTotalPaid(p)?.toLocaleString(undefined, { style: "currency", currency: "PHP" })
                              )}
                            </td>

                            {/* Status */}
                            <td className="payment-status-cell">
                              {isRefunded && <span className="payment-status-badge status-refunded">Refunded</span>}
                              {isCancelled && <span className="payment-status-badge status-cancelled">Cancelled</span>}
                              {isVoided && <span className="payment-status-badge status-voided">Voided</span>}
                              {!isSpecialStatus && status}
                            </td>

                            {/* Actions */}
                            <td className="payment-actions">
                              <button
                                disabled={disablePayment}
                                onClick={() => handlePaymentClick({ ...p, policy_id: policy.id }, client?.phone_Number)}
                                className={`payment-btn ${disablePayment ? "disabled-btn" : ""}`}
                                style={{ opacity: disablePayment ? 0.5 : 1, cursor: disablePayment ? "not-allowed" : "pointer" }}
                              >
                                {isSpecialStatus ? status.charAt(0).toUpperCase() + status.slice(1) :
                                status === "fully-paid" ? "Paid" : "Payment"}
                              </button>

                              {!isCheque && !isSpecialStatus && isOverdue && !hasTodayPenalty && (
                                <button
                                  onClick={() => handleAddPenalty({ ...p, policy_id: policy.id })}
                                  className="penalty-btn"
                                  title="Add today's penalty"
                                >
                                  +Penalty
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                  </table>
                ) : <p className="no-payments-message">No payments scheduled</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)}>Next</button>
        </div>
      )}
    </div>
  );
}

function getPaymentStatus(payment) {
  // Check for refunded status first
  if (payment.is_refunded || payment.payment_status === "refunded") {
    return "refunded";
  }
  
  // Check for cancelled status
  if (payment.payment_status === "cancelled") {
    return "cancelled";
  }
  
  // Check for voided status
  if (payment.payment_status === "voided") {
    return "voided";
  }

  const paid = parseFloat(payment.paid_amount || 0);
  const due = parseFloat(payment.amount_to_be_paid || 0);

  if (paid <= 0) return "not-paid";
  if (paid < due) return "partially-paid";
  if (paid >= due) return "fully-paid";
  return "not-paid";
}
