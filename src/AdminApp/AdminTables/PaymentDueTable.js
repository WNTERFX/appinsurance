import { useEffect, useState } from "react";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import { fetchPaymentSchedule, } from "../AdminActions/PaymentDueActions";
import "../styles/payment-table-styles.css";

export default function PolicyWithPaymentsList() {
  const [policies, setPolicies] = useState([]);
  const [paymentsMap, setPaymentsMap] = useState({});
  const [expanded, setExpanded] = useState({}); 

  useEffect(() => {
    async function loadData() {
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
    }
    loadData();
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!policies.length) return <p>Loading policies...</p>;

  return (
    <div className="payment-table-list">
      {policies.map((policy) => {
        const client = policy.clients_Table;
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

        const payments = paymentsMap[policy.id] || [];
        const isOpen = expanded[policy.id];

        return (
          <div key={policy.id} className="payment-table-card">
            {/* Header */}
            <div
              className="payment-table-header"
              onClick={() => toggleExpand(policy.id)}
            >
              <p>
                <strong>Policy ID:</strong> {policy.internal_id}
              </p>
              <p>
                <strong>Holder:</strong> {clientName}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    policy.policy_is_active
                      ? "payment-status-active"
                      : "payment-status-inactive"
                  }
                >
                  {policy.policy_is_active ? "Active" : "Inactive"}
                </span>
              </p>
              <span className="drawer-toggle">
                {isOpen ? "▲ Hide" : "▼ Show"}
              </span>
            </div> 

            {/* Collapsible Drawer */}
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
                    {payments.map((p) => (
                      <tr key={p.id} className={`payment-${getPaymentStatus(p)}`}>
                        <td>
                          {new Date(p.payment_date).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          {p.amount_to_be_paid?.toLocaleString(undefined, {
                            style: "currency",
                            currency: "PHP",
                          })}
                        </td>
                        <td>
                          {p.paid_amount
                            ? p.paid_amount.toLocaleString(undefined, {
                                style: "currency",
                                currency: "PHP",
                              })
                            : "₱0.00"}
                        </td>
                        <td className="status-cell">{getPaymentStatus(p)}</td>

                        <td className="payment-actions">
                          <button>Enter Payment</button>
                          
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No payments scheduled</p>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}


function getPaymentStatus(payment) {
  const { amount_to_be_paid, paid_amount } = payment;

  if (!paid_amount || paid_amount <= 0) return "not-paid"; // Red
  if (paid_amount < amount_to_be_paid) return "partially-paid"; // Yellow
  if (paid_amount >= amount_to_be_paid) return "fully-paid"; // Green

  return "not-paid"; // fallback
}