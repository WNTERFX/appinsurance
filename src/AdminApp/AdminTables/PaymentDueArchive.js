import { useEffect, useState } from "react";
import { 
  fetchArchivedPayments, 
  unArchivePayment, 
  deletePayment 
} from "../AdminActions/PaymentDueActions";
import { fetchPenaltiesForPayments } from "../AdminActions/PaymentPenaltyActions";
import "../styles/payment-table-styles.css";

export default function PaymentArchiveTable() {
  const [groupedPayments, setGroupedPayments] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [isLoading, setIsLoading] = useState(false);

  const [unarchiveModalOpen, setUnarchiveModalOpen] = useState(false);
  const [selectedPolicyForUnarchive, setSelectedPolicyForUnarchive] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPolicyForDelete, setSelectedPolicyForDelete] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const data = await fetchArchivedPayments();
      
      // Get penalties for all payments
      const paymentIds = data.map(p => p.id);
      const penaltiesMap = await fetchPenaltiesForPayments(paymentIds);
      
      // Attach penalties to payments
      const paymentsWithPenalties = data.map(p => ({
        ...p,
        penalties: penaltiesMap[p.id] || []
      }));

      // Group by policy
      const grouped = paymentsWithPenalties.reduce((acc, payment) => {
        const policyId = payment.policy_Table?.id;
        if (!policyId) return acc;

        if (!acc[policyId]) {
          acc[policyId] = {
            policy: payment.policy_Table,
            payments: []
          };
        }
        acc[policyId].payments.push(payment);
        return acc;
      }, {});

      // Convert to array and sort payments by date
      const groupedArray = Object.values(grouped).map(group => ({
        ...group,
        payments: group.payments.sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date))
      }));

      setGroupedPayments(groupedArray);
    } catch (error) {
      console.error("Error loading archived payments:", error);
      setGroupedPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (policyId) => {
    setExpanded(prev => ({ ...prev, [policyId]: !prev[policyId] }));
  };

  const calculateTotalPenalties = (payment) => {
    const penalties = payment.penalties || [];
    return penalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
  };

  const calculateTotalDue = (payment) => {
    const baseDue = parseFloat(payment.amount_to_be_paid || 0);
    const totalPenalties = calculateTotalPenalties(payment);
    return baseDue + totalPenalties;
  };

  const calculateTotalPaid = (payment) => {
    const basePaid = parseFloat(payment.paid_amount || 0);
    const penaltiesPaid = (payment.penalties || [])
      .filter(p => p.is_paid)
      .reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
    return basePaid + penaltiesPaid;
  };

  const calculateOverdueInfo = (payment) => {
    const penalties = payment.penalties || [];
    if (penalties.length > 0) {
      const lastPenalty = penalties[penalties.length - 1];
      const lastDaysOverdue = lastPenalty.not_paid_days || 0;
      const penaltyPercentage = Math.min(lastDaysOverdue, 31);
      return { daysOverdue: lastDaysOverdue, penaltyPercentage };
    }
    return { daysOverdue: 0, penaltyPercentage: 0 };
  };

  const handleOpenUnarchiveModal = (policy, payments) => {
    setSelectedPolicyForUnarchive({ policy, payments });
    setUnarchiveModalOpen(true);
  };

  const handleUnarchiveConfirm = async () => {
    if (!selectedPolicyForUnarchive) return;

    try {
      const { payments } = selectedPolicyForUnarchive;
      
      for (const payment of payments) {
        await unArchivePayment(payment.id);
      }
      
      await loadPayments();
      alert(`All ${payments.length} payments un-archived successfully!`);
      setUnarchiveModalOpen(false);
      setSelectedPolicyForUnarchive(null);
    } catch (err) {
      console.error("Error un-archiving payments:", err);
      alert("Failed to un-archive payments. Check console for details.");
    }
  };

  const handleOpenDeleteModal = (policy, payments) => {
    setSelectedPolicyForDelete({ policy, payments });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPolicyForDelete) return;

    try {
      const { payments } = selectedPolicyForDelete;
      
      for (const payment of payments) {
        await deletePayment(payment.id);
      }
      
      await loadPayments();
      alert(`All ${payments.length} payments deleted successfully!`);
      setDeleteModalOpen(false);
      setSelectedPolicyForDelete(null);
    } catch (err) {
      console.error("Error deleting payments:", err);
      alert("Failed to delete payments. Check console for details.");
    }
  };

  const filteredGroups = groupedPayments.filter(group => {
    const policy = group.policy;
    const client = policy?.clients_Table;
    const clientName = client
      ? [client.prefix, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name, client.suffix]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      : "";
    const policyId = policy?.internal_id?.toLowerCase() || "";
    const search = searchTerm.toLowerCase().trim();
    return policyId.includes(search) || clientName.includes(search);
  });

  const totalPoliciesCount = filteredGroups.length;
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentGroups = filteredGroups.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredGroups.length / rowsPerPage);

  if (isLoading) return <p>Loading archived payments...</p>;

  return (
    <div className="payments-overview-section">
      {/* UNARCHIVE CONFIRMATION MODAL */}
      {unarchiveModalOpen && selectedPolicyForUnarchive && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
            <h3>Un-Archive All Payments</h3>
            <p>Are you sure you want to un-archive all {selectedPolicyForUnarchive.payments.length} payments?</p>
            <p><strong>Policy ID:</strong> {selectedPolicyForUnarchive.policy.internal_id}</p>
            <p><strong>Total Payments:</strong> {selectedPolicyForUnarchive.payments.length}</p>
            <p style={{ color: '#666', fontSize: '0.9em', marginTop: '10px' }}>
              Note: These payments will be restored to the active payments table.
            </p>
            <div className="modal-actions">
              <button onClick={handleUnarchiveConfirm} style={{ backgroundColor: '#28a745' }}>Yes, Un-Archive</button>
              <button onClick={() => { setUnarchiveModalOpen(false); setSelectedPolicyForUnarchive(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedPolicyForDelete && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
            <h3>Delete All Payments</h3>
            <p style={{ color: '#dc3545', fontWeight: 'bold' }}>⚠️ WARNING: This action cannot be undone!</p>
            <p>Are you sure you want to permanently delete all {selectedPolicyForDelete.payments.length} payments?</p>
            <p><strong>Policy ID:</strong> {selectedPolicyForDelete.policy.internal_id}</p>
            <p><strong>Total Payments:</strong> {selectedPolicyForDelete.payments.length}</p>
            <div className="modal-actions">
              <button onClick={handleDeleteConfirm} style={{ backgroundColor: '#dc3545' }}>Yes, Delete Permanently</button>
              <button onClick={() => { setDeleteModalOpen(false); setSelectedPolicyForDelete(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="payments-overview-header">
        <h2>Archived Payments ({totalPoliciesCount})</h2>
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
            onClick={loadPayments}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Policies list */}
      <div className="policies-list">
        {currentGroups.map(group => {
          const policy = group.policy;
          const client = policy?.clients_Table;
          const clientName = client
            ? [client.prefix, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name, client.suffix]
              .filter(Boolean)
              .join(" ")
            : "Unknown Client";
          const clientInternalId = client?.internal_id || "N/A";
          const payments = group.payments;
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
                  <span style={{ 
                    backgroundColor: '#6c757d', 
                    color: 'white', 
                    padding: '4px 12px', 
                    borderRadius: '12px',
                    fontSize: '0.85em',
                    marginRight: '12px'
                  }}>
                    Archived
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
                  <h3 className="payment-details-title">Archived Payments</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleOpenUnarchiveModal(policy, payments);
                      }}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Un-Archive All
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleOpenDeleteModal(policy, payments);
                      }}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Delete All
                    </button>
                  </div>
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
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => {
                        const status = getPaymentStatus(p);
                        const overdueInfo = calculateOverdueInfo(p);
                        const totalPenalties = calculateTotalPenalties(p);
                        const totalDue = calculateTotalDue(p);

                        return (
                          <tr key={p.id} className={`payment-${status}`}>
                            <td>{new Date(p.payment_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</td>
                            <td>
                              {overdueInfo.penaltyPercentage > 0 ? (
                                <span className="penalty-badge frozen">
                                  {overdueInfo.penaltyPercentage}%
                                </span>
                              ) : "-"}
                            </td>
                            <td>{p.amount_to_be_paid?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</td>
                            <td>{totalPenalties > 0 ? totalPenalties.toLocaleString(undefined, { style: "currency", currency: "PHP" }) : "₱0.00"}</td>
                            <td className="total-due-cell"><strong>{totalDue.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</strong></td>
                            <td>{calculateTotalPaid(p)?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</td>
                            <td className="payment-status-cell">{status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : <p className="no-payments-message">No payments found</p>}
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
  const paid = parseFloat(payment.paid_amount || 0);
  const due = parseFloat(payment.amount_to_be_paid || 0);

  if (paid <= 0) return "not-paid";
  if (paid < due) return "partially-paid";
  if (paid >= due) return "fully-paid";
  return "not-paid";
}