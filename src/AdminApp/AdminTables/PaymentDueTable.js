import { useEffect, useState } from "react";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import { fetchPaymentSchedule, updatePayment, generatePayments } from "../AdminActions/PaymentDueActions";
import PaymentGenerationModal from "../PaymentGenerationModal";
import "../styles/payment-table-styles.css"; 

export default function PolicyWithPaymentsList() {
  const [policies, setPolicies] = useState([]);
  const [paymentsMap, setPaymentsMap] = useState({});
  const [expanded, setExpanded] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [paymentInput, setPaymentInput] = useState(""); 

  // New state for payment generation
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Header state
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const allPolicies = await fetchPolicies();
      console.log("First policy client data:", allPolicies[0]?.clients_Table);
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

  const handlePaymentClick = (payment) => {
    setCurrentPayment(payment);
    setPaymentInput(String(payment?.paid_amount || 0));
    setModalOpen(true);
  };

  const handlePaymentSave = async () => {
    if (!currentPayment || !currentPayment.id) return;

    try {
      const cleanedInput = parseFloat(paymentInput.replace(/,/g, ""));
      if (isNaN(cleanedInput)) {
        alert("Please enter a valid number");
        return;
      }

      const updatedRow = await updatePayment(
        currentPayment.id,
        cleanedInput,
        currentPayment.amount_to_be_paid
      );

      setPaymentsMap(prev => {
        const policyPayments = prev[currentPayment.policy_id].map(p =>
          p.id === currentPayment.id ? updatedRow : p
        );
        return { ...prev, [currentPayment.policy_id]: policyPayments };
      });

      setModalOpen(false);
      setCurrentPayment(null);
      setPaymentInput("");
    } catch (err) {
      console.error("Error updating payment:", err);
    }
  };

  // New function to handle payment generation
  const handleGeneratePayments = async (policyId, payments) => {
    try {
      const newPayments = await generatePayments(policyId, payments);
      
      // Update the payments map with new payments
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
    <div className="payments-overview-section">

      {/* Payments Overview Header with search/filter controls */}
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

      {/* Policies List */}
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
                {/* Client Information Section */}
                <div className="client-info-section">
                  <h4 className="client-info-title">Client Information</h4>
                  <div className="client-info-grid">
                    <div>
                      <strong>Client Name:</strong> {clientName}
                    </div>
                    <div>
                      <strong>Client Internal ID:</strong> {clientInternalId}
                    </div>
                  </div>
                </div>

                <div className="payment-header-with-button">
                  <h3 className="payment-details-title">Payments</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenGenerateModal(policy);
                    }}
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
                        <th>Amount to be Paid</th>
                        <th>Paid Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} className={`payment-${getPaymentStatus(p)}`}>
                          <td>{new Date(p.payment_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</td>
                          <td>{p.amount_to_be_paid?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</td>
                          <td>{p.paid_amount?.toLocaleString(undefined, { style: "currency", currency: "PHP" }) || "₱0.00"}</td>
                          <td className="payment-status-cell">{getPaymentStatus(p)}</td>
                          <td className="payment-actions">
                            <button onClick={() => handlePaymentClick({ ...p, policy_id: policy.id })}>Edit Payment</button>
                          </td>
                        </tr>
                      ))}
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

      {/* Payment Edit Modal */}
      {modalOpen && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
            <h3>Enter Payment</h3>
            <p>Policy ID: {currentPayment?.policy_id} <br /> Payment Date: {new Date(currentPayment?.payment_date).toLocaleDateString()}</p>
            <input
                type="text"
                value={paymentInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*(\,\d{3})*(\.\d*)?$/.test(value)) {
                    setPaymentInput(value);
                  }
                }}
                placeholder="Enter amount"
            />
            <div className="modal-actions">
              <button onClick={handlePaymentSave}>Save</button>
              <button onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Generation Modal */}
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

  if (paid <= 0) return "not-paid";
  if (paid < due) return "partially-paid";
  if (paid >= due) return "fully-paid";
  return "not-paid";
}