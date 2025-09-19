import { useEffect, useState } from "react";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import { fetchPaymentSchedule } from "../AdminActions/PaymentDueActions";
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
                <strong>Policy:</strong> {policy.policy_type}
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
              <ul>
                {payments.length > 0 ? (
                  payments.map((p) => (
                    <li key={p.id} className="payment-table-row">
                      <span>
                        {new Date(p.payment_date).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span>
                        {p.amount_to_be_paid?.toLocaleString(undefined, {
                          style: "currency",
                          currency: "PHP",
                        })}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="payment-table-row">No payments scheduled</li>
                )}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
