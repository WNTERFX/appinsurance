import { useEffect, useState } from "react";
import { 
  fetchArchivedPayments, 
  unArchivePayment, 
  deletePayment 
} from "../AdminActions/PaymentDueActions";
import "../styles/payment-due-archive.css"; // keep your CSS file

export default function PaymentArchiveTable() {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await fetchArchivedPayments();
      setPayments(data);
    } catch (error) {
      console.error("Error loading archived payments:", error);
      setPayments([]);
    }
  };

  const handleUnArchive = async (paymentId) => {
    if (!window.confirm("Un-archive this payment?")) return;
    try {
      await unArchivePayment(paymentId);
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      alert("Payment un-archived successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to un-archive payment");
    }
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm("This will permanently delete the payment record. Continue?")) return;
    try {
      await deletePayment(paymentId);
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      alert("Payment deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete payment");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const policy = payment.policy_Table;
    const client = policy?.clients_Table;
    const clientName = client
      ? [
          client.prefix,
          client.first_Name,
          client.middle_Name ? client.middle_Name.charAt(0) + "." : "",
          client.family_Name,
          client.suffix,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
      : "";

    const policyId = policy?.internal_id?.toString().toLowerCase() || "";
    const search = searchTerm.toLowerCase().trim();
    return policyId.includes(search) || clientName.includes(search);
  });

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPayments.length / rowsPerPage);

  return (
    <div className="client-archive-table-container">
      <div className="client-archive-table-header">
        <h2>Archived Payments</h2>
        <div className="client-archive-header-controls">
          <input
            type="text"
            placeholder="Search by Policy ID or Client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="client-archive-search-input"
          />

          <div className="rows-per-page-inline">
            <label htmlFor="rowsPerPage">Results:</label>
            <select
              id="rowsPerPage"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button className="reset-btn-archive" onClick={loadPayments}>
            Refresh
          </button>
        </div>
      </div>

      <div className="client-archive-table-wrapper">
        <div className="client-archive-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Policy ID</th>
                <th>Client Name</th>
                <th>Payment Date</th>
                <th>Amount to be Paid</th>
                <th>Paid Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.length > 0 ? (
                currentPayments.map((payment) => {
                  const policy = payment.policy_Table;
                  const client = policy?.clients_Table;
                  const clientName = client
                    ? [
                        client.prefix,
                        client.first_Name,
                        client.middle_Name ? client.middle_Name.charAt(0) + "." : "",
                        client.family_Name,
                        client.suffix,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    : "Unknown Client";

                  return (
                    <tr key={payment.id} className="client-archive-table-clickable-row">
                      <td>{payment.id}</td>
                      <td>{policy?.internal_id || "N/A"}</td>
                      <td>{clientName}</td>
                      <td>
                        {new Date(payment.payment_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </td>
                      <td>
                        {payment.amount_to_be_paid?.toLocaleString(undefined, { style: "currency", currency: "PHP" })}
                      </td>
                      <td>
                        {payment.paid_amount?.toLocaleString(undefined, { style: "currency", currency: "PHP" }) || "₱0.00"}
                      </td>
                      <td className={`payment-due-archive-status-cell ${getPaymentStatus(payment)}`}>
                        {getPaymentStatus(payment).split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                      </td>
                      <td className="client-archive-table-actions">
                        <button onClick={(e) => { e.stopPropagation(); handleUnArchive(payment.id); }}>Un-Archive</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(payment.id); }}>Delete</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8">No archived payments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-controls">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

function getPaymentStatus(payment) {
  const { amount_to_be_paid, paid_amount } = payment;
  if (!paid_amount || paid_amount <= 0) return "not-paid";
  const diff = Math.abs(paid_amount - amount_to_be_paid);
  if (diff < 0.01) return "fully-paid";
  if (paid_amount < amount_to_be_paid) return "partially-paid";
  if (paid_amount == amount_to_be_paid) return "fully-paid";
  return "not-paid";
}
