import { useEffect, useState, useCallback } from "react"; // Import useCallback
import { db } from "../../dbServer";
import {
  fetchModeratorPoliciesWithPayments,
  fetchPaymentSchedule,
  updatePayment, // Import updatePayment for moderator
  generatePayments // Import generatePayments for moderator
} from "../ModeratorActions/ModeratorPaymentDueActions"; // Ensure these actions are available in ModeratorActions

import "../moderator-styles/payment-table-styles-moderator.css"; 

import PaymentGenerationModal from "../../AdminApp/PaymentGenerationModal"; // reuse this in admin 

export default function PaymentDueTableModerator() {
  const [policies, setPolicies] = useState([]);
  const [paymentsMap, setPaymentsMap] = useState({});
  const [expanded, setExpanded] = useState({});
  const [modalOpen, setModalOpen] = useState(false); // State for payment edit modal
  const [currentPayment, setCurrentPayment] = useState(null); // State for payment being edited
  const [paymentInput, setPaymentInput] = useState(""); // State for payment input field

  // New state for payment generation modal
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

    // Header state
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);


  // Define loadData using useCallback so it can be called from multiple places
  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await db.auth.getUser();
      if (!user) return;

      const moderatorPolicies = await fetchModeratorPoliciesWithPayments(user.id);
      setPolicies(moderatorPolicies);

      const paymentsByPolicy = {};
      for (const policy of moderatorPolicies) {
        const paymentData = await fetchPaymentSchedule(policy.id);
        paymentsByPolicy[policy.id] = paymentData;
      }
      setPaymentsMap(paymentsByPolicy);
    } catch (error) {
      console.error("Error loading moderator payments:", error);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    loadData(); // Call loadData here
  }, [loadData]); // Add loadData to the dependency array of useEffect

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // Handler for opening the payment edit modal
  const handlePaymentClick = (payment) => {
    setCurrentPayment(payment);
    setPaymentInput(String(payment?.paid_amount || 0));
    setModalOpen(true);
  };

  // Handler for saving the edited payment
  const handlePaymentSave = async () => {
    if (!currentPayment || !currentPayment.id) return;

    try {
      const cleanedInput = parseFloat(paymentInput.replace(/,/g, ""));
      if (isNaN(cleanedInput)) {
        alert("Please enter a valid number");
        return;
      }

      await updatePayment(
        currentPayment.id,
        cleanedInput,
        currentPayment.amount_to_be_paid
      );
      const updatedPayments = await fetchPaymentSchedule(currentPayment.policy_id);
      setPaymentsMap(prev => ({
        ...prev,
        [currentPayment.policy_id]: updatedPayments
      }));

      setModalOpen(false);
      setCurrentPayment(null);
      setPaymentInput("");

      alert("Payment updated successfully!");
    } catch (err) {
      console.error("Error updating payment:", err);
      alert("Failed to update payment.");
    }
  };

  // Handler for opening the payment generation modal
  const handleOpenGenerateModal = (policy) => {
    setSelectedPolicy(policy);
    setGenerateModalOpen(true);
  };

  // New function to handle payment generation (passed to modal)
  const handleGeneratePayments = async (policyId, paymentsToGenerate) => {
    try {
      const newPayments = await generatePayments(policyId, paymentsToGenerate);
      
      setPaymentsMap(prev => ({
        ...prev,
        [policyId]: [...(prev[policyId] || []), ...newPayments].sort(
          (a, b) => new Date(a.payment_date) - new Date(b.payment_date)
        )
      }));

      alert("Payments generated successfully!");
    } catch (error) {
      console.error("Error generating payments:", error);
      alert("Failed to generate payments.");
      throw error; // Re-throw to allow modal to handle error state if needed
    }
  };

   // Filter and Pagination
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
    <div className="payments-overview-section-moderator">

      {/* Payments Overview Header with search/filter controls */}
      <div className="payments-overview-header-moderator">
        <h2>Payments Overview ({totalPoliciesCount})</h2>
        <div className="search-filter-refresh-bar-moderator">
          <input
            type="text"
            placeholder="Search by Policy ID or Client Name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="search-input-moderator"
          />
          <div className="result-select-wrapper-moderator">
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
          <button className="refresh-btn-moderator" onClick={loadData}>Refresh</button> {/* Corrected onClick */}
        </div>
      </div>

      {/* Policies List */}
      <div className="policies-list-moderator">
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
            <div key={policy.id} className="policy-item-card-moderator">
              <div className="policy-summary-moderator" onClick={() => toggleExpand(policy.id)}>
                <div className="policy-info-left-moderator">
                  <span className="policy-id-moderator">Policy ID: {policy.internal_id}</span>
                  <span className="policy-holder-moderator">Policy Holder: {clientName}</span>
                </div>
                <div className="policy-info-right-moderator">
                  <span className={`status ${policy.policy_is_active ? "active" : "inactive"}`}>
                    Status: {policy.policy_is_active ? "Active" : "Inactive"}
                  </span>
                  <button className={`expand-toggle-moderator ${isOpen ? "expanded" : ""}`}>
                    <span className="arrow-moderator">⌄</span>
                  </button>
                </div>
              </div>

              <div className={`payment-details-table-wrapper-moderator ${isOpen ? "show" : ""}`}>
                {/* Client Information Section */}
                <div className="client-info-section-moderator">
                  <h4 className="client-info-title-moderator">Client Information</h4>
                  <div className="client-info-grid-moderator">
                    <div>
                      <strong>Client Name:</strong> {clientName}
                    </div>
                    <div>
                      <strong>Client Internal ID:</strong> {clientInternalId}
                    </div>
                  </div>
                </div>

                <div className="payment-header-with-button-moderator">
                  <h3 className="payment-details-title-moderator">Payments</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenGenerateModal(policy);
                    }}
                    className="generate-payment-btn-moderator"
                  >
                    + Generate Payments
                  </button>
                </div>
                {payments.length > 0 ? (
                  <table className="payments-table-moderator">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Penalty %</th>
                        <th>Amount to be Paid</th>
                        <th>Paid Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, index) => {
                          const status = getPaymentStatus(p);
                          const firstUnpaidIndex = payments.findIndex(pay => getPaymentStatus(pay) !== "fully-paid");
                          const isDisabled =
                            status === "fully-paid" || index > firstUnpaidIndex || firstUnpaidIndex === -1;

                          return (
                            <tr key={p.id} className={`payment-${status}`}>
                              <td>{new Date(p.payment_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</td>
                              <td></td>
                              <td>{p.amount_to_be_paid?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</td>
                              <td>{p.paid_amount?.toLocaleString(undefined, { style: "currency", currency: "PHP" }) || "₱0.00"}</td>
                              <td className="payment-status-cell-moderator">{status}</td>
                              <td className="payment-actions-moderator">
                                <button
                                  disabled={isDisabled}
                                  onClick={() => handlePaymentClick({ ...p, policy_id: policy.id })}
                                  className={isDisabled ? "disabled-btn" : ""}
                                >
                                  {status === "fully-paid" ? "Paid" : "Payment"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                ) : <p className="no-payments-message-moderator">No payments scheduled</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-controls-moderator">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)}>Next</button>
        </div>
      )}

      {/* Payment Edit Modal (Moderator) */}
      {modalOpen && (
        <div className="payment-modal-backdrop-moderator-moderator">
          <div className="payment-modal-moderator-moderator">
            <h3>Enter Payment</h3>
            <p>Policy ID: {currentPayment?.policy_id} <br /> Payment Date: {new Date(currentPayment?.payment_date).toLocaleDateString()}</p>
            <input
                type="text"
                value={paymentInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or valid currency format
                  if (value === '' || /^\d*(\,\d{3})*(\.\d*)?$/.test(value)) {
                    setPaymentInput(value);
                  }
                }}
                placeholder="Enter amount"
            />
            <div className="modal-actions-moderator-moderator">
              <button onClick={handlePaymentSave}>Save</button>
              <button onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Generation Modal (Moderator) */}
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
    </div>
  );
}

function getPaymentStatus(payment) {
  const { amount_to_be_paid, paid_amount } = payment;
  const paid = parseFloat(paid_amount || 0);
  const due = parseFloat(amount_to_be_paid || 0);

  if (paid <= 0 && due > 0) return "not-paid";
  if (paid < due) return "partially-paid";
  if (paid >= due) return "fully-paid";

  return "not-paid"; // fallback
}