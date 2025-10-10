import { useEffect, useState } from "react";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import { fetchPaymentSchedule, updatePayment } from "../AdminActions/PaymentDueActions";
import "../styles/payment-table-styles.css";

export default function PolicyWithPaymentsList() {
  const [policies, setPolicies] = useState([]);
  const [paymentsMap, setPaymentsMap] = useState({});
  const [expanded, setExpanded] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [paymentInput, setPaymentInput] = useState("");

  // Header state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  useEffect(() => {
    loadPolicies();
  }, []);

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

  // ------------------------
  // Filter and Pagination
  // ------------------------
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

  if (!policies.length) return <p>Loading policies...</p>;

  return (
    <div className="payment-table-list">
      {/* Header controls */}
      <div className="payment-table-header" style={{ cursor: "default" }}>
        <h2>Policy Payments</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by Policy ID or Client..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}
          />
          <label>Results:</label>
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            style={{ padding: "6px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button className="reset-btn-payment" onClick={loadPolicies}>Refresh</button>
        </div>
      </div>

      {/* Policies */}
      {currentPolicies.map(policy => {
        const client = policy.clients_Table;
        const clientName = client
          ? [client.prefix, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name, client.suffix]
            .filter(Boolean)
            .join(" ")
          : "Unknown Client";

        const payments = paymentsMap[policy.id] || [];
        const isOpen = expanded[policy.id];

        return (
          <div key={policy.id} className="payment-table-card">
            <div className="payment-table-header" onClick={() => toggleExpand(policy.id)}>
              <p><strong>Policy ID:</strong> {policy.internal_id}</p>
              <p><strong>Holder:</strong> {clientName}</p>
              <p><strong>Status:</strong> 
                <span className={policy.policy_is_active ? "payment-status-active" : "payment-status-inactive"}>
                  {policy.policy_is_active ? "Active" : "Inactive"}
                </span>
              </p>
              <span className="drawer-toggle">{isOpen ? "▲ Hide" : "▼ Show"}</span>
            </div>

            <div className={`payment-table-schedule ${isOpen ? "open" : ""}`}>
              <h3>Payments</h3>
              {payments.length > 0 ? (
                <table className="payment-table">
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
                        <td className="status-cell">{getPaymentStatus(p)}</td>
                        <td className="payment-actions">
                          <button onClick={() => handlePaymentClick({ ...p, policy_id: policy.id })}>Edit Payment</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>No payments scheduled</p>}
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)}>Next</button>
        </div>
      )}

      {/* Payment Modal */}
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
                  if (/^[\d,]*\.?\d*$/.test(value)) setPaymentInput(value);
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
    </div>
  );
}

function getPaymentStatus(payment) {
  const { amount_to_be_paid, paid_amount } = payment;
  if (!paid_amount || paid_amount <= 0) return "not-paid";
  if (paid_amount < amount_to_be_paid) return "partially-paid";
  if (paid_amount >= amount_to_be_paid) return "fully-paid";
  return "not-paid";
}
