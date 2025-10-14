import { useEffect, useState } from "react";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import { fetchPaymentSchedule, updatePayment, generatePayments } from "../AdminActions/PaymentDueActions";
import { addPaymentPenalty, calculateDailyPenalty } from "../AdminActions/PaymentPenaltyActions";
import PaymentGenerationModal from "../PaymentGenerationModal";
import "../styles/payment-table-styles.css"; 

export default function PolicyWithPaymentsList() {
  const [policies, setPolicies] = useState([]);
  const [paymentsMap, setPaymentsMap] = useState({});
  const [expanded, setExpanded] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [paymentInput, setPaymentInput] = useState(""); 

  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [selectedPaymentForPenalty, setSelectedPaymentForPenalty] = useState(null);

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { loadPolicies(); }, []);

  const loadPolicies = async () => {
    try {
      const allPolicies = await fetchPolicies();
      setPolicies(allPolicies);

      const paymentsByPolicy = {};
      for (const policy of allPolicies) {
        const paymentData = await fetchPaymentSchedule(policy.id);
        paymentsByPolicy[policy.id] = paymentData;
      }
      setPaymentsMap(paymentsByPolicy);
    } catch (error) {
      console.error("Error loading policies or payments:", error);
    }
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const calculateTotalPenalties = (payment) => {
  const penalties = payment.penalties || []; // <-- use 'penalties' from fetchPaymentSchedule
  return penalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
  };

  const calculateTotalDue = (payment) => {
    const baseDue = parseFloat(payment.amount_to_be_paid || 0);
    const totalPenalties = calculateTotalPenalties(payment);
    return baseDue + totalPenalties;
  };

  const calculateOverdueInfo = (payment) => {
    const paymentDate = new Date(payment.payment_date);
    const today = new Date();
    const daysOverdue = Math.floor((today - paymentDate) / (1000 * 60 * 60 * 24));
    
    if (daysOverdue <= 0) return { daysOverdue: 0, penaltyPercentage: 0 };
    
    const penaltyPercentage = Math.min(daysOverdue, 90);
    return { daysOverdue, penaltyPercentage };
  };

    const calculateTotalPaid = (payment) => {
    const basePaid = parseFloat(payment.paid_amount || 0);
    const penaltiesPaid = (payment.penalties || []) // <-- use 'penalties'
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
    if (isNaN(cleanedInput)) { alert("Please enter a valid number"); return; }

    const totalDue = calculateTotalDue(currentPayment);
    const minimumPayment = totalDue * 0.25;
    const alreadyPaid = calculateTotalPaid(currentPayment); // ✅ keep if needed
    const remainingBalance = totalDue - alreadyPaid; // ✅ use currentPayment instead of p

    if (cleanedInput < minimumPayment) {
      alert(`Payment must be at least 25% of total due (₱${minimumPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`);
      return;
    }

    if (cleanedInput > remainingBalance) {
      alert(`You cannot pay more than the remaining balance (₱${remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`);
      return;
    }

    await updatePayment(currentPayment.id, cleanedInput, currentPayment.amount_to_be_paid);

    const updatedPayments = await fetchPaymentSchedule(currentPayment.policy_id);
    setPaymentsMap(prev => ({ ...prev, [currentPayment.policy_id]: updatedPayments }));

    setModalOpen(false);
    setCurrentPayment(null);
    setPaymentInput("");

  } catch (err) {
    console.error("Error updating payment:", err);
    alert("Failed to update payment. See console for details.");
  }
};

  const handleAddPenalty = (payment) => {
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
      const penaltyAmount = calculateDailyPenalty(
        selectedPaymentForPenalty.amount_to_be_paid, 
        overdueInfo.daysOverdue
      );

      const reason = `${overdueInfo.daysOverdue} day(s) overdue - ${overdueInfo.penaltyPercentage}% penalty (1% per day)`;

      const penalty = await addPaymentPenalty(
        selectedPaymentForPenalty.id,
        penaltyAmount,
        reason,
        overdueInfo.daysOverdue
      );

      setPaymentsMap(prev => {
        const policyId = selectedPaymentForPenalty.policy_id;
        const updatedPayments = prev[policyId].map(p => {
          if (p.id === selectedPaymentForPenalty.id) {
            return { ...p, payment_due_penalties: [...(p.payment_due_penalties || []), penalty] };
          }
          return p;
        });
        return { ...prev, [policyId]: updatedPayments };
      });

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
      setPaymentsMap(prev => ({
        ...prev,
        [policyId]: [...(prev[policyId] || []), ...newPayments].sort(
          (a, b) => new Date(a.payment_date) - new Date(b.payment_date)
        )
      }));
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

  if (!policies.length) return <p>Loading policies...</p>;

  return (
    <div className="payments-overview-section">

      {/* PAYMENT MODAL */}
      {modalOpen && currentPayment && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
            <h3>Enter Payment</h3>
            <p>Payment Date: {new Date(currentPayment.payment_date).toLocaleDateString()}</p>
            <p>
              <strong>Base Amount:</strong> {currentPayment.amount_to_be_paid?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}
            </p>

            {/* Only show penalties if > 0 */}
            {calculateTotalPenalties(currentPayment) > 0 && (
              <p>
                <strong>Penalties:</strong> {calculateTotalPenalties(currentPayment).toLocaleString(undefined, { style: "currency", currency: "PHP" })}
              </p>
            )}

            <p>
              <strong>Total Due:</strong> {calculateTotalDue(currentPayment).toLocaleString(undefined, { style: "currency", currency: "PHP" })}
            </p>
            <p>
              <strong>Minimum Payment (25%):</strong> {(calculateTotalDue(currentPayment) * 0.25)?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}
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
          <button className="refresh-btn" onClick={loadPolicies}>Refresh</button>
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
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenGenerateModal(policy); }}
                    className="generate-payment-btn"
                  >
                    + Generate Payments
                  </button>
                </div>

                {payments.length > 0 ? (
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Date</th>
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
                        const hasPenalty = p.payment_due_penalties && p.payment_due_penalties.length > 0;

                        // Determine if all previous payments are fully paid
                        const previousPaymentsPaid = payments
                          .slice(0, index)
                          .every(pay => getPaymentStatus(pay) === "fully-paid");

                        // Disable button if:
                        // - already fully paid
                        // - remaining balance is 0 or less
                        // - overdue but no penalty yet
                        // - previous payments are not fully paid
                        const disablePayment =
                          status === "fully-paid" ||
                          remainingBalance <= 0 ||
                          (isOverdue && !hasPenalty) ||
                          !previousPaymentsPaid;

                        return (
                          <tr key={p.id} className={`payment-${status} ${overdueInfo.daysOverdue >= 90 ? 'payment-void-warning' : ''}`}>
                            <td>{new Date(p.payment_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                {overdueInfo.daysOverdue >= 90 && <span className="void-warning-badge">⚠️ 90+ Days</span>}
                            </td>
                            <td>{overdueInfo.penaltyPercentage > 0 ? <span className="penalty-badge">{overdueInfo.penaltyPercentage}%</span> : "-"}</td>
                            <td>{p.amount_to_be_paid?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</td>
                            <td>{totalPenalties > 0 ? totalPenalties.toLocaleString(undefined, { style: "currency", currency: "PHP" }) : "₱0.00"}</td>
                            <td className="total-due-cell"><strong>{totalDue.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</strong></td>
                            <td>{calculateTotalPaid(p)?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</td>
                            <td className="payment-status-cell">{status}</td>
                            <td className="payment-actions">
                              <button
                                disabled={disablePayment}
                                onClick={() => handlePaymentClick({ ...p, policy_id: policy.id }, client?.phone_Number)}
                                className={`payment-btn ${disablePayment ? "disabled-btn" : ""}`}
                                title={
                                  status === "fully-paid" ? "Payment fully covered" :
                                  (isOverdue && !hasPenalty) ? "Cannot pay until penalty is applied" :
                                  !previousPaymentsPaid ? "Pay previous months first" :
                                  ""
                                }
                                style={{ opacity: disablePayment ? 0.5 : 1, cursor: disablePayment ? "not-allowed" : "pointer" }}
                              >
                                {status === "fully-paid" ? "Paid" : "Payment"}
                              </button>

                              {/* Show +Penalty button only if overdue and no penalty yet */}
                              {isOverdue && !hasPenalty && (
                                <button
                                  onClick={() => handleAddPenalty({ ...p, policy_id: policy.id })}
                                  className="penalty-btn"
                                  title="Add daily penalty"
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

// Helper
function getPaymentStatus(payment) {
  const paid = parseFloat(payment.paid_amount || 0);
  const due = parseFloat(payment.amount_to_be_paid || 0);

  if (paid <= 0) return "not-paid";
  if (paid < due) return "partially-paid";
  if (paid >= due) return "fully-paid";
  return "not-paid";
}
